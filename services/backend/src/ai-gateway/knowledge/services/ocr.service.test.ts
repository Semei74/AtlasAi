import { describe, it, expect, beforeEach, vi } from "vitest";
import { OcrService } from "./ocr.service.js";
import type { DocumentService } from "./document.service.js";
import type { MetadataService } from "./metadata.service.js";
import type { FileStorage } from "../interfaces/file-storage.interface.js";
import type { PrismaService } from "../../../prisma/prisma.service.js";

interface MockPrisma {
  knowledgeDocumentOcr: {
    create: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  $connect: ReturnType<typeof vi.fn>;
  $disconnect: ReturnType<typeof vi.fn>;
}

function createMockPrisma(): MockPrisma {
  return {
    knowledgeDocumentOcr: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
}

function createMockProvider() {
  return {
    recognize: vi.fn(),
    supports: vi.fn(),
  };
}

function createMockDocumentService() {
  return {
    findById: vi.fn(),
  };
}

function createMockMetadataService() {
  return {
    mergeMetadata: vi.fn(),
  };
}

function createMockFileStorage() {
  return {
    retrieve: vi.fn(),
  };
}

describe("OcrService", () => {
  let service: OcrService;
  let mockPrisma: MockPrisma;
  let mockProvider: ReturnType<typeof createMockProvider>;
  let mockDocService: ReturnType<typeof createMockDocumentService>;
  let mockMetaService: ReturnType<typeof createMockMetadataService>;
  let mockFileStorage: ReturnType<typeof createMockFileStorage>;

  function mockDocument(overrides: Record<string, unknown> = {}) {
    return {
      id: "doc-1",
      organizationId: "org-1",
      originalName: "scan.png",
      mimeType: "image/png",
      size: 1024,
      storagePath: "doc-1/file.png",
      status: "Ready",
      version: 1,
      checksum: "abc123",
      classification: null,
      tags: [],
      metadata: {},
      workspaceId: null,
      ownerId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = createMockPrisma();
    mockPrisma.knowledgeDocumentOcr.findFirst.mockResolvedValue(null);
    mockProvider = createMockProvider();
    mockDocService = createMockDocumentService();
    mockMetaService = createMockMetadataService();
    mockFileStorage = createMockFileStorage();

    service = new OcrService(
      mockProvider,
      mockDocService as unknown as DocumentService,
      mockMetaService as unknown as MetadataService,
      mockPrisma as unknown as PrismaService,
      mockFileStorage as unknown as FileStorage,
    );
  });

  describe("processDocument", () => {
    it("should throw when document is not found", async () => {
      mockDocService.findById.mockResolvedValue(null);

      await expect(service.processDocument("doc-1", "org-1")).rejects.toThrow("not found");
    });

    it("should throw when document has no storage path", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument({ storagePath: "" }));

      await expect(service.processDocument("doc-1", "org-1")).rejects.toThrow("Document has no stored file");
    });

    it("should return existing OCR result if already completed", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument());
      mockPrisma.knowledgeDocumentOcr.findFirst.mockResolvedValue({
        id: "ocr-1",
        documentId: "doc-1",
        status: "Completed",
        extractedText: "existing text",
        confidence: 95.0,
        detectedLanguage: "eng",
        pages: 2,
        processingTimeMs: 500,
        errorMessage: null,
        createdAt: new Date(),
      });

      const result = await service.processDocument("doc-1", "org-1");

      expect(result.status).toBe("Completed");
      expect(result.extractedText).toBe("existing text");
      expect(mockProvider.recognize).not.toHaveBeenCalled();
    });

    it("should throw for unsupported MIME types", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument({ mimeType: "application/pdf" }));
      mockProvider.supports.mockReturnValue(false);

      await expect(service.processDocument("doc-1", "org-1")).rejects.toThrow(
        "Unsupported MIME type for OCR",
      );
    });

    it("should process a document and return OCR result", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument());
      mockProvider.supports.mockReturnValue(true);
      mockFileStorage.retrieve.mockResolvedValue(Buffer.from("fake-image"));
      mockPrisma.knowledgeDocumentOcr.findFirst.mockResolvedValue(null);
      mockPrisma.knowledgeDocumentOcr.create.mockResolvedValue({
        id: "ocr-1",
        documentId: "doc-1",
        status: "Processing",
        extractedText: null,
        confidence: null,
        detectedLanguage: null,
        pages: 0,
        processingTimeMs: null,
        errorMessage: null,
        createdAt: new Date(),
      });
      mockProvider.recognize.mockResolvedValue({
        text: "extracted OCR text",
        confidence: 91.2,
        detectedLanguage: "eng",
        pages: [{ pageNumber: 1, text: "extracted OCR text", confidence: 91.2 }],
        processingTimeMs: 350,
      });
      mockPrisma.knowledgeDocumentOcr.update.mockResolvedValue({
        id: "ocr-1",
        documentId: "doc-1",
        status: "Completed",
        extractedText: "extracted OCR text",
        confidence: 91.2,
        detectedLanguage: "eng",
        pages: 1,
        processingTimeMs: 350,
        errorMessage: null,
        createdAt: new Date(),
      });

      const result = await service.processDocument("doc-1", "org-1");

      expect(result.status).toBe("Completed");
      expect(result.extractedText).toBe("extracted OCR text");
      expect(result.confidence).toBe(91.2);
      expect(result.pages).toBe(1);
      expect(mockFileStorage.retrieve).toHaveBeenCalledWith("doc-1/file.png");
      expect(mockMetaService.mergeMetadata).toHaveBeenCalledWith("doc-1", "org-1", expect.any(Object));
    });

    it("should handle OCR failures and store error message", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument());
      mockProvider.supports.mockReturnValue(true);
      mockFileStorage.retrieve.mockResolvedValue(Buffer.from("fake-image"));
      mockPrisma.knowledgeDocumentOcr.findFirst.mockResolvedValue(null);
      mockPrisma.knowledgeDocumentOcr.create.mockResolvedValue({
        id: "ocr-1",
        documentId: "doc-1",
        status: "Processing",
      });
      mockProvider.recognize.mockRejectedValue(new Error("OCR engine timeout"));

      await expect(service.processDocument("doc-1", "org-1")).rejects.toThrow("OCR processing failed");

      expect(mockPrisma.knowledgeDocumentOcr.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "Failed",
            errorMessage: "OCR engine timeout",
          }),
        }),
      );
    });
  });

  describe("getOcrResult", () => {
    it("should return null when document not found", async () => {
      mockDocService.findById.mockResolvedValue(null);

      const result = await service.getOcrResult("doc-1", "org-1");
      expect(result).toBeNull();
    });

    it("should return null when no OCR result exists", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument());
      mockPrisma.knowledgeDocumentOcr.findFirst.mockResolvedValue(null);

      const result = await service.getOcrResult("doc-1", "org-1");
      expect(result).toBeNull();
    });

    it("should return OCR result when it exists", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument());
      mockPrisma.knowledgeDocumentOcr.findFirst.mockResolvedValue({
        id: "ocr-1",
        documentId: "doc-1",
        status: "Completed",
        extractedText: "extracted text",
        confidence: 88.5,
        detectedLanguage: "eng",
        pages: 3,
        processingTimeMs: 1200,
        errorMessage: null,
        createdAt: new Date("2024-06-01"),
      });

      const result = await service.getOcrResult("doc-1", "org-1");

      expect(result).not.toBeNull();
      expect(result?.status).toBe("Completed");
      expect(result?.extractedText).toBe("extracted text");
      expect(result?.confidence).toBe(88.5);
    });
  });
});
