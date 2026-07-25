import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaWorkspaceRepository } from "./prisma-workspace.repository.js";
import type { PrismaService } from "../../prisma/prisma.service.js";

function createMockPrisma(): PrismaService {
  return {
    workspace: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaService;
}

const DB_ROW = {
  id: "ws-1",
  organizationId: "org-1",
  name: "Test Workspace",
  description: "A workspace",
  color: "blue",
  icon: "star",
  settings: { config: {}, ai: {}, storage: {}, promptLibraryIds: [] },
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("PrismaWorkspaceRepository", () => {
  let mockPrisma: PrismaService;
  let repo: PrismaWorkspaceRepository;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    repo = new PrismaWorkspaceRepository(mockPrisma);
  });

  describe("findById", () => {
    it("should return workspace when found", async () => {
      (mockPrisma.workspace.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(DB_ROW);
      const result = await repo.findById("ws-1");
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Test Workspace");
    });

    it("should return null when not found", async () => {
      (mockPrisma.workspace.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const result = await repo.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByOrganizationId", () => {
    it("should return workspaces for organization", async () => {
      (mockPrisma.workspace.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([DB_ROW]);
      const results = await repo.findByOrganizationId("org-1");
      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe("Test Workspace");
    });

    it("should return empty array when none found", async () => {
      (mockPrisma.workspace.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      const results = await repo.findByOrganizationId("org-1");
      expect(results).toHaveLength(0);
    });
  });

  describe("create", () => {
    it("should create and return workspace", async () => {
      (mockPrisma.workspace.create as ReturnType<typeof vi.fn>).mockResolvedValue(DB_ROW);
      const result = await repo.create({
        organizationId: "org-1",
        name: "Test Workspace",
        description: null,
        color: null,
        icon: null,
        settings: { config: {}, ai: {}, storage: {}, promptLibraryIds: [] },
      });
      expect(result.id).toBe("ws-1");
    });
  });

  describe("update", () => {
    it("should update and return workspace", async () => {
      const updated = { ...DB_ROW, name: "Updated" };
      (mockPrisma.workspace.update as ReturnType<typeof vi.fn>).mockResolvedValue(updated);
      const result = await repo.update("ws-1", { name: "Updated" });
      expect(result.name).toBe("Updated");
    });
  });

  describe("delete", () => {
    it("should delete workspace", async () => {
      (mockPrisma.workspace.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      await expect(repo.delete("ws-1")).resolves.toBeUndefined();
    });
  });
});
