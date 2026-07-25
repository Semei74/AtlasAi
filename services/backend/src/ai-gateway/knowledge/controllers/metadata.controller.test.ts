import { describe, it, expect, beforeEach, vi } from "vitest";
import { MetadataController } from "./metadata.controller.js";
import type { MetadataService } from "../interfaces/metadata-service.interface.js";

describe("MetadataController", () => {
  let controller: MetadataController;
  let mockService: MetadataService;

  function mockRequest(): { user: { sub: string; organizationId: string } } {
    return { user: { sub: "user-1", organizationId: "org-1" } };
  }

  beforeEach(() => {
    mockService = {
      getMetadata: vi.fn().mockResolvedValue({
        auto: {
          title: "report",
          filename: "report.pdf",
          extension: "pdf",
          mimeType: "application/pdf",
          size: 1024,
          checksum: null,
          language: null,
          encoding: null,
          pageCount: null,
          wordCount: null,
          characterCount: null,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          uploadedBy: "user-1",
          documentVersion: 1,
        },
        custom: {},
        classification: null,
        tags: [],
        status: "Ready",
      }),
      updateMetadata: vi.fn().mockResolvedValue({}),
      mergeMetadata: vi.fn().mockResolvedValue({}),
      deleteMetadata: vi.fn().mockResolvedValue({}),
      rebuildMetadata: vi.fn().mockResolvedValue({}),
      validateMetadata: vi.fn().mockReturnValue({ valid: true, errors: [] }),
      getMetadataHistory: vi.fn().mockResolvedValue([]),
      rollbackMetadata: vi.fn().mockResolvedValue({}),
      searchByMetadata: vi.fn().mockResolvedValue({ items: [], total: 0, offset: 0, limit: 20 }),
    };

    controller = new MetadataController(mockService);
  });

  describe("getMetadata", () => {
    it("should return metadata for a document", async () => {
      const result = await controller.getMetadata("doc-1", mockRequest() as never);
      expect(result).toHaveProperty("auto");
      expect(result).toHaveProperty("custom");
    });

    it("should throw when user not authenticated", async () => {
      await expect(controller.getMetadata("doc-1", { user: undefined } as never)).rejects.toThrow(
        "User not authenticated",
      );
    });
  });

  describe("updateMetadata", () => {
    it("should overwrite custom metadata", async () => {
      await controller.updateMetadata("doc-1", { metadata: { key: "value" } }, mockRequest() as never);
      expect(mockService.updateMetadata).toHaveBeenCalledWith("doc-1", "org-1", { key: "value" });
    });
  });

  describe("mergeMetadata", () => {
    it("should merge custom metadata", async () => {
      await controller.mergeMetadata("doc-1", { metadata: { key: "value" } }, mockRequest() as never);
      expect(mockService.mergeMetadata).toHaveBeenCalledWith("doc-1", "org-1", { key: "value" });
    });
  });

  describe("deleteMetadata", () => {
    it("should delete specified metadata keys", async () => {
      await controller.deleteMetadata("doc-1", { keys: ["oldKey"] }, mockRequest() as never);
      expect(mockService.deleteMetadata).toHaveBeenCalledWith("doc-1", "org-1", ["oldKey"]);
    });
  });

  describe("rebuildMetadata", () => {
    it("should rebuild custom metadata", async () => {
      await controller.rebuildMetadata("doc-1", mockRequest() as never);
      expect(mockService.rebuildMetadata).toHaveBeenCalledWith("doc-1", "org-1");
    });
  });

  describe("getMetadataHistory", () => {
    it("should return metadata history", async () => {
      await controller.getMetadataHistory("doc-1", mockRequest() as never);
      expect(mockService.getMetadataHistory).toHaveBeenCalledWith("doc-1", "org-1");
    });
  });

  describe("rollbackMetadata", () => {
    it("should rollback to specified version", async () => {
      await controller.rollbackMetadata("doc-1", 1, mockRequest() as never);
      expect(mockService.rollbackMetadata).toHaveBeenCalledWith("doc-1", "org-1", 1);
    });
  });
});
