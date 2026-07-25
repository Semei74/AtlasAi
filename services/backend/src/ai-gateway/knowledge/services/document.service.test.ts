import { describe, it, expect, beforeEach, vi } from "vitest";
import { DocumentService } from "./document.service.js";
import type { FileStorage } from "../interfaces/file-storage.interface.js";
import type { PrismaService } from "../../../prisma/prisma.service.js";

interface MockPrismaDoc {
  knowledgeDocument: {
    create: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
}

describe("DocumentService", () => {
  let service: DocumentService;
  let mockStorage: FileStorage;
  let mockPrisma: MockPrismaDoc;

  beforeEach(() => {
    mockStorage = {
      store: vi.fn().mockResolvedValue({ storagePath: "doc-1/uuid.txt", checksum: "abc123" }),
      retrieve: vi.fn().mockResolvedValue(Buffer.from("file content")),
      delete: vi.fn().mockResolvedValue(undefined),
      getPath: vi.fn().mockReturnValue("doc-1/uuid.txt"),
      exists: vi.fn().mockResolvedValue(true),
      getSignedUrl: vi.fn().mockResolvedValue(null),
    };

    mockPrisma = {
      knowledgeDocument: {
        create: vi.fn().mockResolvedValue({
          id: "doc-1",
          organizationId: "org-1",
          workspaceId: null,
          ownerId: "user-1",
          originalName: "test.txt",
          mimeType: "text/plain",
          size: 100,
          storagePath: "",
          checksum: null,
          metadata: {},
          classification: null,
          tags: [],
          status: "Uploading",
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new DocumentService(mockStorage, mockPrisma as unknown as PrismaService);
  });

  describe("create", () => {
    it("should create a document record and store the file", async () => {
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({
        id: "doc-1",
        organizationId: "org-1",
        workspaceId: null,
        ownerId: "user-1",
        originalName: "test.txt",
        mimeType: "text/plain",
        size: 100,
        storagePath: "doc-1/uuid.txt",
        checksum: "abc123",
        metadata: {},
        classification: null,
        tags: [],
        status: "Ready",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await service.create(
        { originalName: "test.txt", mimeType: "text/plain", size: 100, buffer: Buffer.from("data") },
        { organizationId: "org-1", ownerId: "user-1" },
      );

      expect(mockStorage.store).toHaveBeenCalled();
      expect(result.status).toBe("Ready");
      expect(result.storagePath).toBe("doc-1/uuid.txt");
    });
  });

  describe("findById", () => {
    it("should return null for non-existent document", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(null);

      const result = await service.findById("nonexistent", "org-1");
      expect(result).toBeNull();
    });

    it("should return document when found", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue({
        id: "doc-1",
        organizationId: "org-1",
        originalName: "test.txt",
        deletedAt: null,
      });

      const result = await service.findById("doc-1", "org-1");
      expect(result).not.toBeNull();
      expect((result as Record<string, unknown>)["id"]).toBe("doc-1");
    });

    it("should filter by organizationId", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(null);

      const result = await service.findById("doc-1", "wrong-org");
      expect(result).toBeNull();
      expect(mockPrisma.knowledgeDocument.findFirst).toHaveBeenCalledWith({
        where: { id: "doc-1", organizationId: "wrong-org", deletedAt: null },
      });
    });
  });

  describe("findMany", () => {
    it("should return paginated results", async () => {
      mockPrisma.knowledgeDocument.findMany = vi.fn().mockResolvedValue([
        { id: "doc-1", originalName: "a.txt" },
        { id: "doc-2", originalName: "b.txt" },
      ]);
      mockPrisma.knowledgeDocument.count = vi.fn().mockResolvedValue(2);

      const result = await service.findMany({ organizationId: "org-1" });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(20);
    });

    it("should apply search filter", async () => {
      mockPrisma.knowledgeDocument.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.knowledgeDocument.count = vi.fn().mockResolvedValue(0);

      await service.findMany({ organizationId: "org-1", search: "report" });

      expect(mockPrisma.knowledgeDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { originalName: { contains: "report", mode: "insensitive" } },
            ]),
          }),
        }),
      );
    });
  });

  describe("delete / restore", () => {
    it("should soft-delete a document", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue({
        id: "doc-1",
        organizationId: "org-1",
        deletedAt: null,
      });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({});

      await service.delete("doc-1", "org-1");

      expect(mockPrisma.knowledgeDocument.update).toHaveBeenCalledWith({
        where: { id: "doc-1" },
        data: expect.objectContaining({ deletedAt: expect.any(Date), status: "Deleted" }),
      });
    });

    it("should restore a soft-deleted document", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue({
        id: "doc-1",
        organizationId: "org-1",
        deletedAt: new Date(),
      });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({});

      await service.restore("doc-1", "org-1");

      expect(mockPrisma.knowledgeDocument.update).toHaveBeenCalledWith({
        where: { id: "doc-1" },
        data: { deletedAt: null, status: "Ready" },
      });
    });

    it("should throw when restoring a non-deleted document", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(null);

      await expect(service.restore("doc-1", "org-1")).rejects.toThrow("not found");
    });
  });

  describe("archive", () => {
    it("should archive a document", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue({
        id: "doc-1",
        organizationId: "org-1",
        deletedAt: null,
      });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({});

      await service.archive("doc-1", "org-1");

      expect(mockPrisma.knowledgeDocument.update).toHaveBeenCalledWith({
        where: { id: "doc-1" },
        data: { status: "Archived" },
      });
    });
  });

  describe("download", () => {
    it("should return file buffer and metadata", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue({
        id: "doc-1",
        organizationId: "org-1",
        originalName: "test.txt",
        mimeType: "text/plain",
        storagePath: "doc-1/file.txt",
        deletedAt: null,
      });

      const result = await service.download("doc-1", "org-1");

      expect(result.stream.toString()).toBe("file content");
      expect(result.mimeType).toBe("text/plain");
      expect(result.originalName).toBe("test.txt");
    });
  });

  describe("update", () => {
    it("should update document metadata", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue({
        id: "doc-1",
        organizationId: "org-1",
        deletedAt: null,
      });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({});

      await service.update("doc-1", "org-1", {
        classification: "internal",
        tags: ["important"],
      });

      expect(mockPrisma.knowledgeDocument.update).toHaveBeenCalledWith({
        where: { id: "doc-1" },
        data: { classification: "internal", tags: ["important"] },
      });
    });

    it("should throw when document not found", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(null);

      await expect(service.update("doc-1", "org-1", { classification: "x" })).rejects.toThrow("not found");
    });
  });
});
