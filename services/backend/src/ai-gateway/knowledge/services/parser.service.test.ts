import { describe, it, expect, beforeEach, vi } from "vitest";
import { ParserService } from "./parser.service.js";
import type { DocumentService } from "../interfaces/document-service.interface.js";
import type { MetadataService } from "../interfaces/metadata-service.interface.js";
import type { FileStorage } from "../interfaces/file-storage.interface.js";
import type { ParsedDocument } from "../interfaces/parser-result.interface.js";
import type { PrismaService } from "../../../prisma/prisma.service.js";

interface MockPrisma {
  knowledgeDocumentParse: {
    create: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  $connect: ReturnType<typeof vi.fn>;
  $disconnect: ReturnType<typeof vi.fn>;
}

function createMockPrisma(): MockPrisma {
  return {
    knowledgeDocumentParse: {
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
    parse: vi.fn(),
    supports: vi.fn(),
  };
}

function createMockDocumentService() {
  return { findById: vi.fn() };
}

function createMockMetadataService() {
  return { mergeMetadata: vi.fn() };
}

function createMockFileStorage() {
  return { retrieve: vi.fn() };
}

function mockDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: "doc-1",
    organizationId: "org-1",
    originalName: "doc.md",
    mimeType: "text/markdown",
    size: 1024,
    storagePath: "doc-1/file.md",
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

const mockParsed: ParsedDocument = {
  mimeType: "text/markdown",
  extractedText: "parsed text",
  language: "en",
  pageCount: 1,
  sections: [{ id: "sec-0", title: null, level: null, text: "parsed text", startIndex: 0, endIndex: 10 }],
  headings: [{ text: "Title", level: 1, position: 0 }],
  tables: [{ headers: ["a"], rows: [["1"]] }],
  statistics: {
    characterCount: 11,
    wordCount: 2,
    lineCount: 1,
    paragraphCount: 1,
    sectionCount: 1,
    headingCount: 1,
    tableCount: 1,
  },
  parser: "markdown",
  parserVersion: "1.0.0",
  metadata: { title: "Doc Title", creator: "Doc Author", publisher: "Doc Press" },
};

describe("ParserService", () => {
  let service: ParserService;
  let mockPrisma: MockPrisma;
  let mockProvider: ReturnType<typeof createMockProvider>;
  let mockDocService: ReturnType<typeof createMockDocumentService>;
  let mockMetaService: ReturnType<typeof createMockMetadataService>;
  let mockFileStorage: ReturnType<typeof createMockFileStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = createMockPrisma();
    mockPrisma.knowledgeDocumentParse.findFirst.mockResolvedValue(null);
    mockProvider = createMockProvider();
    mockDocService = createMockDocumentService();
    mockMetaService = createMockMetadataService();
    mockFileStorage = createMockFileStorage();

    service = new ParserService(
      mockProvider,
      mockDocService as unknown as DocumentService,
      mockMetaService as unknown as MetadataService,
      mockPrisma as unknown as PrismaService,
      mockFileStorage as unknown as FileStorage,
    );
  });

  describe("parseDocument", () => {
    it("should throw when document is not found", async () => {
      mockDocService.findById.mockResolvedValue(null);

      await expect(service.parseDocument("doc-1", "org-1")).rejects.toThrow("not found");
    });

    it("should throw when document has no stored file", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument({ storagePath: "" }));

      await expect(service.parseDocument("doc-1", "org-1")).rejects.toThrow("Document has no stored file");
    });

    it("should throw for unsupported MIME types", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument({ mimeType: "image/png" }));
      mockProvider.supports.mockReturnValue(false);

      await expect(service.parseDocument("doc-1", "org-1")).rejects.toThrow(
        "Unsupported MIME type for parsing: image/png",
      );
    });

    it("should parse a document and persist structured content", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument());
      mockProvider.supports.mockReturnValue(true);
      mockFileStorage.retrieve.mockResolvedValue(Buffer.from("# Title\n\nbody"));
      mockProvider.parse.mockResolvedValue(mockParsed);
      mockPrisma.knowledgeDocumentParse.create.mockResolvedValue({
        id: "parse-1",
        documentId: "doc-1",
        status: "Processing",
        mimeType: "text/markdown",
      });
      mockPrisma.knowledgeDocumentParse.update.mockResolvedValue({
        id: "parse-1",
        documentId: "doc-1",
        status: "Completed",
        parser: "markdown",
        parserVersion: "1.0.0",
        mimeType: "text/markdown",
        extractedText: "parsed text",
        language: "en",
        pageCount: 1,
        sectionCount: 1,
        headings: mockParsed.headings,
        tables: mockParsed.tables,
        sections: mockParsed.sections,
        statistics: mockParsed.statistics,
        metadata: mockParsed.metadata,
        processingTimeMs: 5,
        errorMessage: null,
        createdAt: new Date(),
      });

      const result = await service.parseDocument("doc-1", "org-1");

      expect(result.status).toBe("Completed");
      expect(result.extractedText).toBe("parsed text");
      expect(result.sections).toHaveLength(1);
      expect(result.headings).toHaveLength(1);
      expect(result.metadata).toEqual({ title: "Doc Title", creator: "Doc Author", publisher: "Doc Press" });

      expect(mockPrisma.knowledgeDocumentParse.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ metadata: expect.objectContaining({ title: "Doc Title" }) }),
        }),
      );
      expect(mockMetaService.mergeMetadata).toHaveBeenCalledWith(
        "doc-1",
        "org-1",
        expect.objectContaining({
          parsed: true,
          "parse.title": "Doc Title",
          "parse.author": "Doc Author",
          "parse.publisher": "Doc Press",
        }),
      );
    });

    it("should return cached result when already completed", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument());
      mockPrisma.knowledgeDocumentParse.findFirst.mockResolvedValue({
        id: "parse-1",
        documentId: "doc-1",
        status: "Completed",
        parser: "markdown",
        parserVersion: "1.0.0",
        mimeType: "text/markdown",
        extractedText: "cached",
        language: "en",
        pageCount: 1,
        sectionCount: 1,
        headings: mockParsed.headings,
        tables: mockParsed.tables,
        sections: mockParsed.sections,
        statistics: mockParsed.statistics,
        processingTimeMs: 5,
        errorMessage: null,
        createdAt: new Date(),
      });

      const result = await service.parseDocument("doc-1", "org-1");

      expect(result.extractedText).toBe("cached");
      expect(mockProvider.parse).not.toHaveBeenCalled();
    });

    it("should mark the record failed when parsing throws", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument());
      mockProvider.supports.mockReturnValue(true);
      mockFileStorage.retrieve.mockResolvedValue(Buffer.from("data"));
      mockProvider.parse.mockRejectedValue(new Error("boom"));
      mockPrisma.knowledgeDocumentParse.create.mockResolvedValue({ id: "parse-1" });

      await expect(service.parseDocument("doc-1", "org-1")).rejects.toThrow("Parsing failed: boom");
      expect(mockPrisma.knowledgeDocumentParse.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "parse-1" }, data: expect.objectContaining({ status: "Failed" }) }),
      );
    });
  });

  describe("getParseResult", () => {
    it("should return null when document missing", async () => {
      mockDocService.findById.mockResolvedValue(null);
      expect(await service.getParseResult("doc-1", "org-1")).toBeNull();
    });

    it("should return null when no parse record exists", async () => {
      mockDocService.findById.mockResolvedValue(mockDocument());
      mockPrisma.knowledgeDocumentParse.findFirst.mockResolvedValue(null);
      expect(await service.getParseResult("doc-1", "org-1")).toBeNull();
    });
  });
});
