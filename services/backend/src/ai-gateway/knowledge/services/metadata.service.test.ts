import { describe, it, expect, beforeEach, vi } from "vitest";
import { MetadataService } from "./metadata.service.js";
import type { PrismaService } from "../../../prisma/prisma.service.js";

function createMockPrisma() {
  const metadataHistory = {
    create: vi.fn().mockResolvedValue({ id: "hist-1" }),
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    count: vi.fn().mockResolvedValue(0),
  };

  const knowledgeDocument = {
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    update: vi.fn(),
    count: vi.fn().mockResolvedValue(0),
  };

  return {
    knowledgeDocumentMetadataHistory: metadataHistory,
    knowledgeDocument,
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  } as unknown as PrismaService;
}

function createDocument(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    id: "doc-1",
    organizationId: "org-1",
    workspaceId: null,
    ownerId: "user-1",
    originalName: "report.pdf",
    mimeType: "application/pdf",
    size: 1024,
    storagePath: "doc-1/uuid.pdf",
    checksum: "abc123def",
    metadata: {},
    classification: "internal",
    tags: ["important", "finance"],
    status: "Ready",
    version: 3,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

describe("MetadataService", () => {
  let service: MetadataService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new MetadataService(mockPrisma);
  });

  describe("getMetadata", () => {
    it("should return document metadata with auto and custom fields", async () => {
      const doc = createDocument({
        metadata: { department: "engineering", project: "atlas" },
      });
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);

      const result = await service.getMetadata("doc-1", "org-1");

      expect(result.auto.title).toBe("report");
      expect(result.auto.filename).toBe("report.pdf");
      expect(result.auto.extension).toBe("pdf");
      expect(result.auto.mimeType).toBe("application/pdf");
      expect(result.auto.size).toBe(1024);
      expect(result.auto.checksum).toBe("abc123def");
      expect(result.auto.documentVersion).toBe(3);
      expect(result.auto.uploadedBy).toBe("user-1");
      expect(result.custom).toEqual({ department: "engineering", project: "atlas" });
      expect(result.classification).toBe("internal");
      expect(result.tags).toEqual(["important", "finance"]);
      expect(result.status).toBe("Ready");
    });

    it("should throw when document not found", async () => {
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(null);

      await expect(service.getMetadata("doc-1", "org-1")).rejects.toThrow("Document not found");
    });

    it("should handle documents with null checksum", async () => {
      const doc = createDocument({ checksum: null });
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);

      const result = await service.getMetadata("doc-1", "org-1");

      expect(result.auto.checksum).toBeNull();
    });

    it("should handle documents without custom metadata", async () => {
      const doc = createDocument({ metadata: null });
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);

      const result = await service.getMetadata("doc-1", "org-1");

      expect(result.custom).toEqual({});
    });
  });

  describe("updateMetadata (overwrite)", () => {
    it("should overwrite custom metadata and increment version", async () => {
      const doc = createDocument({ metadata: { old: "value" } });
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);
      mockPrisma.knowledgeDocumentMetadataHistory.count = vi.fn().mockResolvedValue(0);
      mockPrisma.knowledgeDocumentMetadataHistory.create = vi.fn().mockResolvedValue({ id: "hist-1" });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({
        ...doc,
        metadata: { new: "data" },
        version: 4,
      });

      const result = await service.updateMetadata("doc-1", "org-1", { new: "data" });

      expect(result.custom).toEqual({ new: "data" });
      expect(result.auto.documentVersion).toBe(4);
      expect(mockPrisma.knowledgeDocument.update).toHaveBeenCalledWith({
        where: { id: "doc-1" },
        data: { metadata: { new: "data" }, version: 4 },
      });
    });

    it("should reject reserved metadata keys", async () => {
      await expect(
        service.updateMetadata("doc-1", "org-1", { title: "bad" }),
      ).rejects.toThrow('Invalid metadata: "title" is a reserved metadata key');
    });

    it("should reject oversized metadata", async () => {
      const big = "x".repeat(70_000);
      await expect(
        service.updateMetadata("doc-1", "org-1", { big }),
      ).rejects.toThrow("exceeds maximum size");
    });

    it("should reject invalid key format", async () => {
      await expect(
        service.updateMetadata("doc-1", "org-1", { "": "empty" }),
      ).rejects.toThrow("Metadata key must be a non-empty string");
    });

    it("should save history before overwriting", async () => {
      const doc = createDocument({ metadata: { old: "value" }, version: 3 });
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);
      mockPrisma.knowledgeDocumentMetadataHistory.count = vi.fn().mockResolvedValue(0);
      mockPrisma.knowledgeDocumentMetadataHistory.create = vi.fn().mockResolvedValue({ id: "hist-1" });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({
        ...doc,
        metadata: { new: "data" },
        version: 4,
      });

      await service.updateMetadata("doc-1", "org-1", { new: "data" });

      expect(mockPrisma.knowledgeDocumentMetadataHistory.create).toHaveBeenCalledWith({
        data: {
          documentId: "doc-1",
          version: 3,
          custom: { old: "value" },
        },
      });
    });
  });

  describe("mergeMetadata", () => {
    it("should merge new metadata with existing", async () => {
      const doc = createDocument({ metadata: { existing: "keep" } });
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);
      mockPrisma.knowledgeDocumentMetadataHistory.count = vi.fn().mockResolvedValue(0);
      mockPrisma.knowledgeDocumentMetadataHistory.create = vi.fn().mockResolvedValue({ id: "hist-1" });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({
        ...doc,
        metadata: { existing: "keep", new: "added" },
        version: 4,
      });

      const result = await service.mergeMetadata("doc-1", "org-1", { new: "added" });

      expect(result.custom).toEqual({ existing: "keep", new: "added" });
    });

    it("should overwrite existing keys on merge", async () => {
      const doc = createDocument({ metadata: { key: "old" } });
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);
      mockPrisma.knowledgeDocumentMetadataHistory.count = vi.fn().mockResolvedValue(0);
      mockPrisma.knowledgeDocumentMetadataHistory.create = vi.fn().mockResolvedValue({ id: "hist-1" });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({
        ...doc,
        metadata: { key: "new" },
        version: 4,
      });

      const result = await service.mergeMetadata("doc-1", "org-1", { key: "new" });

      expect(result.custom["key"]).toBe("new");
    });
  });

  describe("deleteMetadata", () => {
    it("should delete specified keys from custom metadata", async () => {
      const doc = createDocument({ metadata: { keep: "stay", remove: "go" } });
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);
      mockPrisma.knowledgeDocumentMetadataHistory.count = vi.fn().mockResolvedValue(0);
      mockPrisma.knowledgeDocumentMetadataHistory.create = vi.fn().mockResolvedValue({ id: "hist-1" });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({
        ...doc,
        metadata: { keep: "stay" },
        version: 4,
      });

      const result = await service.deleteMetadata("doc-1", "org-1", ["remove"]);

      expect(result.custom).toEqual({ keep: "stay" });
    });
  });

  describe("rebuildMetadata", () => {
    it("should remove invalid entries from custom metadata", async () => {
      const doc = createDocument({
        metadata: {
          valid: "string",
          reserved: "bad",
          func: () => true,
        },
      });
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);
      mockPrisma.knowledgeDocumentMetadataHistory.count = vi.fn().mockResolvedValue(0);
      mockPrisma.knowledgeDocumentMetadataHistory.create = vi.fn().mockResolvedValue({ id: "hist-1" });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({
        ...doc,
        metadata: { valid: "string" },
        version: 4,
      });

      const result = await service.rebuildMetadata("doc-1", "org-1");

      expect(result.custom["valid"]).toBe("string");
      expect(Object.keys(result.custom)).not.toContain("func");
      expect(Object.keys(result.custom)).not.toContain("reserved");
    });
  });

  describe("validateMetadata", () => {
    it("should accept valid metadata", () => {
      const result = service.validateMetadata({
        name: "test",
        count: 42,
        enabled: true,
        category: ["a", "b"],
        nested: { inner: "value" },
      });

      expect(result.valid).toBe(true);
    });

    it("should reject reserved keys", () => {
      const result = service.validateMetadata({ title: "bad" });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("reserved");
    });

    it("should reject Date objects as metadata values", () => {
      const result = service.validateMetadata({
        timestamp: new Date(),
      });
      expect(result.valid).toBe(false);
    });

    it("should reject oversized metadata", () => {
      const result = service.validateMetadata({ data: "x".repeat(70_000) });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("exceeds maximum size");
    });

    it("should reject invalid key format", () => {
      const result = service.validateMetadata({ "😀": "emoji" });
      expect(result.valid).toBe(false);
    });

    it("should reject function values", () => {
      const result = service.validateMetadata({ fn: () => true });
      expect(result.valid).toBe(false);
    });
  });

  describe("getMetadataHistory", () => {
    it("should return metadata version history", async () => {
      const doc = createDocument();
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);
      const now = new Date();
      mockPrisma.knowledgeDocumentMetadataHistory.findMany = vi.fn().mockResolvedValue([
        { id: "hist-1", documentId: "doc-1", version: 1, custom: { initial: "data" }, createdAt: now },
        { id: "hist-2", documentId: "doc-1", version: 2, custom: { updated: "data" }, createdAt: now },
      ]);

      const result = await service.getMetadataHistory("doc-1", "org-1");

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ version: 1, custom: { initial: "data" } });
    });
  });

  describe("rollbackMetadata", () => {
    it("should rollback to the specified version", async () => {
      const doc = createDocument({ metadata: { current: "data" }, version: 3 });
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);
      mockPrisma.knowledgeDocumentMetadataHistory.findUnique = vi.fn().mockResolvedValue({
        id: "hist-1",
        documentId: "doc-1",
        version: 1,
        custom: { initial: "data" },
        createdAt: new Date(),
      });
      mockPrisma.knowledgeDocumentMetadataHistory.count = vi.fn().mockResolvedValue(1);
      mockPrisma.knowledgeDocumentMetadataHistory.findFirst = vi.fn().mockResolvedValue({
        id: "hist-2",
        version: 3,
      });
      mockPrisma.knowledgeDocumentMetadataHistory.create = vi.fn().mockResolvedValue({ id: "hist-3" });
      mockPrisma.knowledgeDocument.update = vi.fn().mockResolvedValue({
        ...doc,
        metadata: { initial: "data" },
        version: 4,
      });

      const result = await service.rollbackMetadata("doc-1", "org-1", 1);

      expect(result.custom).toEqual({ initial: "data" });
      expect(result.auto.documentVersion).toBe(4);
    });

    it("should throw when history version not found", async () => {
      const doc = createDocument();
      mockPrisma.knowledgeDocument.findFirst = vi.fn().mockResolvedValue(doc);
      mockPrisma.knowledgeDocumentMetadataHistory.findUnique = vi.fn().mockResolvedValue(null);

      await expect(service.rollbackMetadata("doc-1", "org-1", 99)).rejects.toThrow(
        "not found",
      );
    });
  });

  describe("searchByMetadata", () => {
    it("should filter by mime type", async () => {
      mockPrisma.knowledgeDocument.findMany = vi.fn().mockResolvedValue([createDocument()]);
      mockPrisma.knowledgeDocument.count = vi.fn().mockResolvedValue(1);

      const result = await service.searchByMetadata({
        organizationId: "org-1",
        mimeType: "application/pdf",
      });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should filter by status", async () => {
      mockPrisma.knowledgeDocument.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.knowledgeDocument.count = vi.fn().mockResolvedValue(0);

      await service.searchByMetadata({
        organizationId: "org-1",
        status: "Archived",
      });

      expect(mockPrisma.knowledgeDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "Archived" }),
        }),
      );
    });

    it("should filter by tags", async () => {
      mockPrisma.knowledgeDocument.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.knowledgeDocument.count = vi.fn().mockResolvedValue(0);

      await service.searchByMetadata({
        organizationId: "org-1",
        tags: ["finance", "urgent"],
      });

      expect(mockPrisma.knowledgeDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: { hasSome: ["finance", "urgent"] },
          }),
        }),
      );
    });

    it("should filter by owner", async () => {
      mockPrisma.knowledgeDocument.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.knowledgeDocument.count = vi.fn().mockResolvedValue(0);

      await service.searchByMetadata({
        organizationId: "org-1",
        ownerId: "user-1",
      });

      expect(mockPrisma.knowledgeDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ ownerId: "user-1" }),
        }),
      );
    });

    it("should filter by version", async () => {
      mockPrisma.knowledgeDocument.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.knowledgeDocument.count = vi.fn().mockResolvedValue(0);

      await service.searchByMetadata({
        organizationId: "org-1",
        version: 2,
      });

      expect(mockPrisma.knowledgeDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ version: 2 }),
        }),
      );
    });

    it("should filter by upload date range", async () => {
      mockPrisma.knowledgeDocument.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.knowledgeDocument.count = vi.fn().mockResolvedValue(0);

      await service.searchByMetadata({
        organizationId: "org-1",
        uploadedAfter: "2024-01-01T00:00:00Z",
        uploadedBefore: "2025-01-01T00:00:00Z",
      });

      expect(mockPrisma.knowledgeDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date("2024-01-01T00:00:00Z"),
              lte: new Date("2025-01-01T00:00:00Z"),
            },
          }),
        }),
      );
    });

    it("should paginate results", async () => {
      mockPrisma.knowledgeDocument.findMany = vi.fn().mockResolvedValue([createDocument()]);
      mockPrisma.knowledgeDocument.count = vi.fn().mockResolvedValue(10);

      const result = await service.searchByMetadata({
        organizationId: "org-1",
        offset: 5,
        limit: 5,
      });

      expect(result.offset).toBe(5);
      expect(result.limit).toBe(5);
      expect(result.total).toBe(10);
    });

    it("should return empty results for no matches", async () => {
      mockPrisma.knowledgeDocument.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.knowledgeDocument.count = vi.fn().mockResolvedValue(0);

      const result = await service.searchByMetadata({
        organizationId: "org-1",
        mimeType: "image/png",
      });

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
