import { Inject, Injectable } from "@nestjs/common";
import { ValidationError, NotFoundError } from "@atlas/errors";
import { PrismaService } from "../../../prisma/prisma.service.js";
import type { MetadataService as IMetadataService, MetadataFilter } from "../interfaces/metadata-service.interface.js";
import type {
  DocumentMetadata,
  AutoMetadata,
  MetadataHistoryEntry,
  MetadataValidationResult,
} from "../interfaces/document-metadata.interface.js";
import {
  RESERVED_METADATA_KEYS,
  METADATA_KEY_PATTERN,
  MAX_METADATA_BYTES,
} from "../interfaces/document-metadata.interface.js";
import type { KnowledgeDocument } from "../../../generated/prisma/client.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type { PaginatedDocuments } from "../interfaces/document-service.interface.js";

@Injectable()
export class MetadataService implements IMetadataService {
  public constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  public async getMetadata(documentId: string, organizationId: string): Promise<DocumentMetadata> {
    const document = await this.findDocument(documentId, organizationId);
    return this.buildDocumentMetadata(document);
  }

  public async updateMetadata(
    documentId: string,
    organizationId: string,
    metadata: Record<string, unknown>,
  ): Promise<DocumentMetadata> {
    const validation = this.validateMetadata(metadata);
    if (!validation.valid) {
      throw new ValidationError(`Invalid metadata: ${validation.errors.join("; ")}`);
    }

    const document = await this.findDocument(documentId, organizationId);

    await this.saveMetadataHistory(document);

    const updated = await this.prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        metadata: metadata as object,
        version: document.version + 1,
      },
    });

    return this.buildDocumentMetadata(updated);
  }

  public async mergeMetadata(
    documentId: string,
    organizationId: string,
    metadata: Record<string, unknown>,
  ): Promise<DocumentMetadata> {
    const validation = this.validateMetadata(metadata);
    if (!validation.valid) {
      throw new ValidationError(`Invalid metadata: ${validation.errors.join("; ")}`);
    }

    const document = await this.findDocument(documentId, organizationId);

    await this.saveMetadataHistory(document);

    const currentCustom = this.getCustomMetadata(document);
    const merged = { ...currentCustom, ...metadata };

    const updated = await this.prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        metadata: merged as object,
        version: document.version + 1,
      },
    });

    return this.buildDocumentMetadata(updated);
  }

  public async deleteMetadata(
    documentId: string,
    organizationId: string,
    keys: readonly string[],
  ): Promise<DocumentMetadata> {
    const document = await this.findDocument(documentId, organizationId);

    await this.saveMetadataHistory(document);

    const currentCustom = this.getCustomMetadata(document);
    const filtered = Object.fromEntries(
      Object.entries(currentCustom).filter(([k]) => !keys.includes(k)),
    );

    const updated = await this.prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        metadata: filtered as object,
        version: document.version + 1,
      },
    });

    return this.buildDocumentMetadata(updated);
  }

  public async rebuildMetadata(documentId: string, organizationId: string): Promise<DocumentMetadata> {
    const document = await this.findDocument(documentId, organizationId);

    const rebuilt: Record<string, unknown> = {};
    const currentCustom = this.getCustomMetadata(document);
    for (const [key, value] of Object.entries(currentCustom)) {
      const validation = this.validateEntry(key, value);
      if (validation.valid) {
        rebuilt[key] = value;
      }
    }

    await this.saveMetadataHistory(document);

    const updated = await this.prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        metadata: rebuilt as object,
        version: document.version + 1,
      },
    });

    return this.buildDocumentMetadata(updated);
  }

  public validateMetadata(metadata: Record<string, unknown>): MetadataValidationResult {
    const errors: string[] = [];
    const seenKeys = new Set<string>();

    let serializedSize: number | null = null;
    try {
      serializedSize = new TextEncoder().encode(JSON.stringify(metadata)).length;
    } catch {
      errors.push("Metadata is not JSON-serializable");
      return { valid: false, errors };
    }

    if (serializedSize > MAX_METADATA_BYTES) {
      errors.push(`Metadata exceeds maximum size of ${String(MAX_METADATA_BYTES)} bytes`);
    }

    for (const [key, value] of Object.entries(metadata)) {
      const entryResult = this.validateEntry(key, value);
      if (!entryResult.valid) {
        errors.push(...entryResult.errors);
      }

      if (seenKeys.has(key)) {
        errors.push(`Duplicate key: "${key}"`);
      }
      seenKeys.add(key);
    }

    return { valid: errors.length === 0, errors };
  }

  public async getMetadataHistory(
    documentId: string,
    organizationId: string,
  ): Promise<readonly MetadataHistoryEntry[]> {
    await this.findDocument(documentId, organizationId);

    const history = await this.prisma.knowledgeDocumentMetadataHistory.findMany({
      where: { documentId },
      orderBy: { version: "asc" },
    });

    return history.map((entry) => ({
      version: entry.version,
      custom: entry.custom as Record<string, unknown>,
      timestamp: entry.createdAt.toISOString(),
    }));
  }

  public async rollbackMetadata(
    documentId: string,
    organizationId: string,
    version: number,
  ): Promise<DocumentMetadata> {
    const document = await this.findDocument(documentId, organizationId);

    const historyEntry = await this.prisma.knowledgeDocumentMetadataHistory.findUnique({
      where: { documentId_version: { documentId, version } },
    });

    if (historyEntry === null) {
      throw new NotFoundError("Metadata history version", String(version));
    }

    await this.saveMetadataHistory(document);

    const updated = await this.prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        metadata: historyEntry.custom as object,
        version: document.version + 1,
      },
    });

    return this.buildDocumentMetadata(updated);
  }

  public async searchByMetadata(filter: MetadataFilter): Promise<PaginatedDocuments> {
    const where: Prisma.KnowledgeDocumentWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.workspaceId !== undefined) where.workspaceId = filter.workspaceId;
    if (filter.ownerId !== undefined) where.ownerId = filter.ownerId;
    if (filter.status !== undefined) where.status = filter.status;
    if (filter.mimeType !== undefined) where.mimeType = filter.mimeType;
    if (filter.version !== undefined) where.version = filter.version;

    if (filter.search !== undefined && filter.search.length > 0) {
      where.OR = [
        { originalName: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    if (filter.tags !== undefined && filter.tags.length > 0) {
      where.tags = { hasSome: [...filter.tags] };
    }

    if (filter.uploadedAfter !== undefined || filter.uploadedBefore !== undefined) {
      const createdAtFilter: { gte?: Date; lte?: Date } = {};
      if (filter.uploadedAfter !== undefined) createdAtFilter.gte = new Date(filter.uploadedAfter);
      if (filter.uploadedBefore !== undefined) createdAtFilter.lte = new Date(filter.uploadedBefore);
      where.createdAt = createdAtFilter;
    }

    if (filter.metadataKey !== undefined) {
      if (filter.metadataValue !== undefined) {
        where.metadata = {
          path: [filter.metadataKey],
          string_contains: filter.metadataValue,
        };
      } else {
        where.metadata = {
          path: [filter.metadataKey],
          not: { equals: null },
        };
      }
    }

    const offset = filter.offset ?? 0;
    const limit = Math.min(filter.limit ?? 20, 100);

    const [items, total] = await Promise.all([
      this.prisma.knowledgeDocument.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [filter.sortBy ?? "createdAt"]: filter.sortOrder ?? "desc" },
      }),
      this.prisma.knowledgeDocument.count({ where }),
    ]);

    return { items, total, offset, limit };
  }

  private async findDocument(documentId: string, organizationId: string): Promise<KnowledgeDocument> {
    const document = await this.prisma.knowledgeDocument.findFirst({
      where: { id: documentId, organizationId, deletedAt: null },
    });

    if (document === null) {
      throw new NotFoundError("Document");
    }

    return document;
  }

  private buildDocumentMetadata(document: KnowledgeDocument): DocumentMetadata {
    const auto = this.extractAutoMetadata(document);
    const custom = this.getCustomMetadata(document);

    return {
      auto,
      custom,
      classification: document.classification,
      tags: [...document.tags],
      status: document.status,
    };
  }

  private extractAutoMetadata(document: KnowledgeDocument): AutoMetadata {
    const extension = this.extractExtension(document.originalName);
    const title = this.extractTitle(document.originalName);
    const content = "";

    return {
      title,
      filename: document.originalName,
      extension,
      mimeType: document.mimeType,
      size: document.size,
      checksum: document.checksum,
      language: null,
      encoding: null,
      pageCount: null,
      wordCount: content.length > 0 ? content.split(/\s+/).filter(Boolean).length : null,
      characterCount: content.length > 0 ? content.length : null,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
      uploadedBy: document.ownerId,
      documentVersion: document.version,
    };
  }

  private getCustomMetadata(document: KnowledgeDocument): Record<string, unknown> {
    if (document.metadata === null) {
      return {};
    }
    const raw = document.metadata as Record<string, unknown>;
    return { ...raw };
  }

  private extractExtension(filename: string): string {
    const idx = filename.lastIndexOf(".");
    return idx >= 0 ? filename.substring(idx + 1) : "";
  }

  private extractTitle(filename: string): string {
    const idx = filename.lastIndexOf(".");
    return idx >= 0 ? filename.substring(0, idx) : filename;
  }

  private validateEntry(
    key: string,
    value: unknown,
  ): MetadataValidationResult {
    const errors: string[] = [];

    if (typeof key !== "string" || key.length === 0) {
      errors.push("Metadata key must be a non-empty string");
      return { valid: false, errors };
    }

    if (!METADATA_KEY_PATTERN.test(key)) {
      errors.push(
        `Invalid metadata key format: "${key}". Keys must start with a letter or underscore, contain only alphanumeric, underscore, dot, space, or hyphen characters, and be at most 128 characters`,
      );
    }

    if (RESERVED_METADATA_KEYS.includes(key)) {
      errors.push(`"${key}" is a reserved metadata key`);
    }

    const valueErrors = this.validateValue(value, key);
    errors.push(...valueErrors);

    return { valid: errors.length === 0, errors };
  }

  private validateValue(value: unknown, path: string): string[] {
    const errors: string[] = [];

    if (value === null || value === undefined) {
      return errors;
    }

    const type = typeof value;

    if (type === "string" || type === "number" || type === "boolean") {
      return errors;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const elementErrors = this.validateValue(value[i], `${path}[${String(i)}]`);
        errors.push(...elementErrors);
      }
      return errors;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (type === "object" && value !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const proto = Object.getPrototypeOf(value);
      if (proto !== Object.prototype) {
        errors.push(`Invalid metadata value type at "${path}": unsupported object type`);
        return errors;
      }

      const objValue = value as Record<string, unknown>;
      for (const [nestedKey, nestedValue] of Object.entries(objValue)) {
        const nestedErrors = this.validateValue(
          nestedValue,
          `${path}.${nestedKey}`,
        );
        errors.push(...nestedErrors);
      }
      return errors;
    }

      errors.push(`Invalid metadata value type at "${path}": expected string, number, boolean, null, array, or plain object, got ${type}`);
    return errors;
  }

  private async saveMetadataHistory(document: KnowledgeDocument): Promise<void> {
    const latest = await this.prisma.knowledgeDocumentMetadataHistory.findFirst({
      where: { documentId: document.id },
      orderBy: { version: "desc" },
    });

    if (latest !== null && latest.version >= document.version) {
      return;
    }

    await this.prisma.knowledgeDocumentMetadataHistory.create({
      data: {
        documentId: document.id,
        version: document.version,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        custom: this.getCustomMetadata(document) as object,
      },
    });
  }
}
