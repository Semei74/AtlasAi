import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "@atlas/errors";
import { PrismaService } from "../../../prisma/prisma.service.js";
import { DocumentStatus } from "../../../generated/prisma/enums.js";
import { FILE_STORAGE } from "../interfaces/file-storage.interface.js";
import type { FileStorage, FileUpload } from "../interfaces/file-storage.interface.js";
import type {
  DocumentService as IDocumentService,
  DocumentFilter,
  PaginatedDocuments,
  CreateDocumentInput,
  UpdateDocumentInput,
} from "../interfaces/document-service.interface.js";
import type { KnowledgeDocument, Prisma } from "../../../generated/prisma/client.js";

@Injectable()
export class DocumentService implements IDocumentService {
  public constructor(
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  public async create(
    file: { originalName: string; mimeType: string; size: number; buffer: Buffer },
    input: CreateDocumentInput,
  ): Promise<KnowledgeDocument> {
    const upload: FileUpload = {
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      buffer: file.buffer,
    };

    const document = await this.prisma.knowledgeDocument.create({
      data: {
        organizationId: input.organizationId,
        workspaceId: input.workspaceId,
        ownerId: input.ownerId,
        originalName: upload.originalName,
        mimeType: upload.mimeType,
        size: upload.size,
        storagePath: "",
        checksum: null,
        metadata: (input.metadata ?? {}) as object,
        classification: input.classification ?? null,
        tags: [...(input.tags ?? [])],
        status: DocumentStatus.Uploading,
        version: 1,
      } as Prisma.KnowledgeDocumentUncheckedCreateInput,
    });

    const storageResult = await this.storage.store(upload, document.id);

    return this.prisma.knowledgeDocument.update({
      where: { id: document.id },
      data: {
        storagePath: storageResult.storagePath,
        checksum: storageResult.checksum,
        status: DocumentStatus.Ready,
      },
    });
  }

  public async findById(id: string, organizationId: string): Promise<KnowledgeDocument | null> {
    return this.prisma.knowledgeDocument.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  public async findMany(filter: DocumentFilter): Promise<PaginatedDocuments> {
    const where: Prisma.KnowledgeDocumentWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.workspaceId !== undefined) where.workspaceId = filter.workspaceId;
    if (filter.ownerId !== undefined) where.ownerId = filter.ownerId;
    if (filter.status !== undefined) where.status = filter.status;
    if (filter.mimeType !== undefined) where.mimeType = filter.mimeType;

    if (filter.search !== undefined && filter.search.length > 0) {
      where.OR = [
        { originalName: { contains: filter.search, mode: "insensitive" } },
        { classification: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    if (filter.tags !== undefined && filter.tags.length > 0) {
      where.tags = { hasSome: [...filter.tags] };
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

  public async update(id: string, organizationId: string, input: UpdateDocumentInput): Promise<KnowledgeDocument> {
    const existing = await this.findById(id, organizationId);
    if (existing === null) {
      throw new NotFoundError("Document", id);
    }

    const data: Prisma.KnowledgeDocumentUpdateInput = {};
    if (input.classification !== undefined) data.classification = input.classification;
    if (input.tags !== undefined) data.tags = [...input.tags] as string[];
    if (input.metadata !== undefined) data.metadata = input.metadata as object;

    return this.prisma.knowledgeDocument.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string, organizationId: string): Promise<void> {
    const existing = await this.findById(id, organizationId);
    if (existing === null) {
      throw new NotFoundError("Document", id);
    }

    await this.prisma.knowledgeDocument.update({
      where: { id },
      data: { deletedAt: new Date(), status: DocumentStatus.Deleted },
    });
  }

  public async restore(id: string, organizationId: string): Promise<KnowledgeDocument> {
    const document = await this.prisma.knowledgeDocument.findFirst({
      where: { id, organizationId, deletedAt: { not: null } },
    });

    if (document === null) {
      throw new NotFoundError("Document");
    }

    return this.prisma.knowledgeDocument.update({
      where: { id },
      data: { deletedAt: null, status: DocumentStatus.Ready },
    });
  }

  public async archive(id: string, organizationId: string): Promise<KnowledgeDocument> {
    const existing = await this.findById(id, organizationId);
    if (existing === null) {
      throw new NotFoundError("Document", id);
    }

    return this.prisma.knowledgeDocument.update({
      where: { id },
      data: { status: DocumentStatus.Archived },
    });
  }

  public async download(
    id: string,
    organizationId: string,
  ): Promise<{ stream: Buffer; mimeType: string; originalName: string }> {
    const document = await this.findById(id, organizationId);
    if (document === null) {
      throw new NotFoundError("Document", id);
    }

    const buffer = await this.storage.retrieve(document.storagePath);
    return { stream: buffer, mimeType: document.mimeType, originalName: document.originalName };
  }
}
