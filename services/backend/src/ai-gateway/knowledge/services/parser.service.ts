/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion -- readonly arrays / objects need cast to Prisma Json */
import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError, ValidationError, AiProviderError } from "@atlas/errors";
import { PrismaService } from "../../../prisma/prisma.service.js";
import { Prisma } from "../../../generated/prisma/client.js";
import type { ParserService as IParserService, ParseJobResult } from "../interfaces/parser-service.interface.js";
import type { ParserProvider } from "../interfaces/parser-provider.interface.js";
import { PARSER_PROVIDER } from "../interfaces/parser-provider.interface.js";
import type { DocumentService } from "../interfaces/document-service.interface.js";
import { DOCUMENT_SERVICE } from "../interfaces/document-service.interface.js";
import type { MetadataService } from "../interfaces/metadata-service.interface.js";
import { METADATA_SERVICE } from "../interfaces/metadata-service.interface.js";
import type { FileStorage } from "../interfaces/file-storage.interface.js";
import { FILE_STORAGE } from "../interfaces/file-storage.interface.js";
import type { ParsedDocument, ParsedHeading, ParsedMetadata, ParsedSection, ParsedTable, ParseStatistics } from "../interfaces/parser-result.interface.js";

interface ParseRecord {
  id: string;
  documentId: string;
  status: string;
  parser: string;
  parserVersion: string;
  mimeType: string;
  extractedText: string | null;
  language: string | null;
  pageCount: number;
  sectionCount: number;
  headings: unknown;
  tables: unknown;
  sections: unknown;
  statistics: unknown;
  metadata: unknown;
  processingTimeMs: number | null;
  errorMessage: string | null;
  createdAt: Date;
}

const DEFAULT_STATISTICS: ParseStatistics = {
  characterCount: 0,
  wordCount: 0,
  lineCount: 0,
  paragraphCount: 0,
  sectionCount: 0,
  headingCount: 0,
  tableCount: 0,
};

function parseStatistics(value: unknown): ParseStatistics {
  if (typeof value !== "object" || value === null) {
    return { ...DEFAULT_STATISTICS };
  }
  const candidate = value as Partial<ParseStatistics>;
  return {
    characterCount: candidate.characterCount ?? 0,
    wordCount: candidate.wordCount ?? 0,
    lineCount: candidate.lineCount ?? 0,
    paragraphCount: candidate.paragraphCount ?? 0,
    sectionCount: candidate.sectionCount ?? 0,
    headingCount: candidate.headingCount ?? 0,
    tableCount: candidate.tableCount ?? 0,
  };
}

@Injectable()
export class ParserService implements IParserService {
  public constructor(
    @Inject(PARSER_PROVIDER)
    private readonly parserProvider: ParserProvider,
    @Inject(DOCUMENT_SERVICE)
    private readonly documentService: DocumentService,
    @Inject(METADATA_SERVICE)
    private readonly metadataService: MetadataService,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
  ) {}

  public async parseDocument(documentId: string, organizationId: string): Promise<ParseJobResult> {
    const document = await this.documentService.findById(documentId, organizationId);
    if (document === null) {
      throw new NotFoundError("Document", documentId);
    }

    if (document.storagePath.length === 0) {
      throw new ValidationError("Document has no stored file");
    }

    const existing = await this.prisma.knowledgeDocumentParse.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });

    if (existing !== null && existing.status === "Completed") {
      return this.mapToJobResult(existing);
    }

    if (!this.parserProvider.supports(document.mimeType)) {
      throw new ValidationError(`Unsupported MIME type for parsing: ${document.mimeType}`);
    }

    const fileBuffer = await this.fileStorage.retrieve(document.storagePath);

    const parseRecord = await this.prisma.knowledgeDocumentParse.create({
      data: {
        documentId,
        status: "Processing",
        mimeType: document.mimeType,
      },
    });

    const start = Date.now();

    try {
      const result = await this.parserProvider.parse(fileBuffer, document.mimeType);
      const processingTimeMs = Date.now() - start;

      const updated = await this.prisma.knowledgeDocumentParse.update({
        where: { id: parseRecord.id },
        data: {
          status: "Completed",
          parser: result.parser,
          parserVersion: result.parserVersion,
          mimeType: result.mimeType,
          extractedText: result.extractedText,
          language: result.language,
          pageCount: result.pageCount,
          sectionCount: result.sections.length,
          headings: result.headings as object,
          tables: result.tables as object,
          sections: result.sections as object,
          statistics: result.statistics as object,
          metadata: (result.metadata ?? Prisma.JsonNull) as object,
          processingTimeMs,
        },
      });

      try {
        await this.metadataService.mergeMetadata(documentId, organizationId, this.buildDocumentMetadata(result));
      } catch {
        // metadata merge is best-effort
      }

      return this.mapToJobResult(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown parsing error";

      await this.prisma.knowledgeDocumentParse.update({
        where: { id: parseRecord.id },
        data: {
          status: "Failed",
          errorMessage: message,
        },
      });

      throw new AiProviderError(`Parsing failed: ${message}`);
    }
  }

  public async getParseResult(documentId: string, organizationId: string): Promise<ParseJobResult | null> {
    const document = await this.documentService.findById(documentId, organizationId);
    if (document === null) {
      return null;
    }

    const parseRecord = await this.prisma.knowledgeDocumentParse.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });

    if (parseRecord === null) {
      return null;
    }

    return this.mapToJobResult(parseRecord);
  }

  private mapToJobResult(record: ParseRecord): ParseJobResult {
    const headings = Array.isArray(record.headings) ? (record.headings as readonly ParsedHeading[]) : [];
    const tables = Array.isArray(record.tables) ? (record.tables as readonly ParsedTable[]) : [];
    const sections = Array.isArray(record.sections) ? (record.sections as readonly ParsedSection[]) : [];
    const statistics = parseStatistics(record.statistics);

    return {
      documentId: record.documentId,
      parseId: record.id,
      status: record.status,
      mimeType: record.mimeType,
      parser: record.parser,
      parserVersion: record.parserVersion,
      extractedText: record.extractedText,
      language: record.language,
      pageCount: record.pageCount,
      sectionCount: record.sectionCount,
      headings,
      tables,
      sections,
      statistics,
      processingTimeMs: record.processingTimeMs,
      errorMessage: record.errorMessage,
      metadata: this.normalizeMetadata(record.metadata),
      createdAt: record.createdAt.toISOString(),
    };
  }

  private buildDocumentMetadata(result: ParsedDocument): Record<string, unknown> {
    const documentMetadata: Record<string, unknown> = {
      parsed: true,
      parser: result.parser,
      parserVersion: result.parserVersion,
      parseLanguage: result.language,
      parseSections: result.sections.length,
      parseTextPreview: result.extractedText.slice(0, 500),
      parseProcessedAt: new Date().toISOString(),
    };

    const parserMeta = result.metadata;
    if (parserMeta !== undefined) {
      if (parserMeta.title !== undefined) {
        documentMetadata["parse.title"] = parserMeta.title;
      }
      if (parserMeta.creator !== undefined) {
        documentMetadata["parse.author"] = parserMeta.creator;
      } else if (parserMeta.author !== undefined) {
        documentMetadata["parse.author"] = parserMeta.author;
      }
      if (parserMeta.publisher !== undefined) {
        documentMetadata["parse.publisher"] = parserMeta.publisher;
      }
      if (parserMeta.language !== undefined) {
        documentMetadata["parse.language"] = parserMeta.language;
      }
    }

    return documentMetadata;
  }

  private normalizeMetadata(value: unknown): ParsedMetadata | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value !== "object" || Array.isArray(value)) {
      return undefined;
    }
    return value as ParsedMetadata;
  }
}
