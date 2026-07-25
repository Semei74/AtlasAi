import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError, ValidationError, AiProviderError } from "@atlas/errors";
import { PrismaService } from "../../../prisma/prisma.service.js";
import type { OcrService as IOcrService } from "../interfaces/ocr-service.interface.js";
import type { OcrProvider } from "../interfaces/ocr-provider.interface.js";
import { OCR_PROVIDER } from "../interfaces/ocr-provider.interface.js";
import type { OcrJobResult } from "../interfaces/ocr-result.interface.js";
import { DOCUMENT_SERVICE } from "../interfaces/document-service.interface.js";
import type { DocumentService } from "../interfaces/document-service.interface.js";
import { METADATA_SERVICE } from "../interfaces/metadata-service.interface.js";
import type { MetadataService } from "../interfaces/metadata-service.interface.js";
import { FILE_STORAGE } from "../interfaces/file-storage.interface.js";
import type { FileStorage } from "../interfaces/file-storage.interface.js";

@Injectable()
export class OcrService implements IOcrService {
  public constructor(
    @Inject(OCR_PROVIDER)
    private readonly ocrProvider: OcrProvider,
    @Inject(DOCUMENT_SERVICE)
    private readonly documentService: DocumentService,
    @Inject(METADATA_SERVICE)
    private readonly metadataService: MetadataService,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
  ) {}

  public async processDocument(documentId: string, organizationId: string): Promise<OcrJobResult> {
    const document = await this.documentService.findById(documentId, organizationId);
    if (document === null) {
      throw new NotFoundError("Document", documentId);
    }

    if (document.storagePath.length === 0) {
      throw new ValidationError("Document has no stored file");
    }

    const existingOcr = await this.prisma.knowledgeDocumentOcr.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });

    if (existingOcr !== null && existingOcr.status === "Completed") {
      return this.mapToJobResult(existingOcr);
    }

    if (!this.ocrProvider.supports(document.mimeType)) {
      throw new ValidationError(`Unsupported MIME type for OCR: ${document.mimeType}`);
    }

    const fileBuffer = await this.fileStorage.retrieve(document.storagePath);

    const ocrRecord = await this.prisma.knowledgeDocumentOcr.create({
      data: {
        documentId,
        status: "Processing",
      },
    });

    try {
      const result = await this.ocrProvider.recognize(
        fileBuffer,
        { language: "eng" },
      );

      const updated = await this.prisma.knowledgeDocumentOcr.update({
        where: { id: ocrRecord.id },
        data: {
          status: "Completed",
          extractedText: result.text,
          confidence: result.confidence,
          detectedLanguage: result.detectedLanguage,
          pages: result.pages.length,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- readonly array needs cast to Prisma Json
          pageResults: result.pages as object,
          processingTimeMs: result.processingTimeMs,
        },
      });

      try {
        await this.metadataService.mergeMetadata(documentId, organizationId, {
          ocrCompleted: true,
          ocrConfidence: result.confidence,
          ocrPages: result.pages.length,
          ocrLanguage: result.detectedLanguage,
          ocrProcessedAt: new Date().toISOString(),
        });
      } catch {
        // metadata merge is best-effort
      }

      return this.mapToJobResult(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown OCR error";

      await this.prisma.knowledgeDocumentOcr.update({
        where: { id: ocrRecord.id },
        data: {
          status: "Failed",
          errorMessage: message,
        },
      });

      throw new AiProviderError(`OCR processing failed: ${message}`);
    }
  }

  public async getOcrResult(documentId: string, organizationId: string): Promise<OcrJobResult | null> {
    const document = await this.documentService.findById(documentId, organizationId);
    if (document === null) {
      return null;
    }

    const ocrRecord = await this.prisma.knowledgeDocumentOcr.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });

    if (ocrRecord === null) {
      return null;
    }

    return this.mapToJobResult(ocrRecord);
  }

  private mapToJobResult(record: {
    id: string;
    documentId: string;
    status: string;
    extractedText: string | null;
    confidence: number | null;
    detectedLanguage: string | null;
    pages: number;
    processingTimeMs: number | null;
    errorMessage: string | null;
    createdAt: Date;
  }): OcrJobResult {
    return {
      documentId: record.documentId,
      ocrId: record.id,
      status: record.status,
      extractedText: record.extractedText,
      confidence: record.confidence,
      detectedLanguage: record.detectedLanguage,
      pages: record.pages,
      processingTimeMs: record.processingTimeMs,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
