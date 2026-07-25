import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaPromptRepository } from "./prompt.repository.js";
import type { PrismaService } from "../../../prisma/prisma.service.js";
import type { PromptStatus } from "../../../generated/prisma/enums.js";

function createMockPrisma(
  mockCreate: ReturnType<typeof vi.fn>,
  mockFindUnique: ReturnType<typeof vi.fn>,
  mockFindFirst: ReturnType<typeof vi.fn>,
  mockUpdate: ReturnType<typeof vi.fn>,
  mockFindMany: ReturnType<typeof vi.fn>,
  mockCount: ReturnType<typeof vi.fn>,
): PrismaService {
  return {
    prompt: {
      create: mockCreate,
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      update: mockUpdate,
      findMany: mockFindMany,
      count: mockCount,
    },
  } as unknown as PrismaService;
}

describe("PrismaPromptRepository", () => {
  let mockPrisma: PrismaService;
  let repo: PrismaPromptRepository;
  let mockPromptCreate: ReturnType<typeof vi.fn>;
  let mockPromptFindUnique: ReturnType<typeof vi.fn>;
  let mockPromptFindFirst: ReturnType<typeof vi.fn>;
  let mockPromptUpdate: ReturnType<typeof vi.fn>;
  let mockPromptFindMany: ReturnType<typeof vi.fn>;
  let mockPromptCount: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPromptCreate = vi.fn();
    mockPromptFindUnique = vi.fn();
    mockPromptFindFirst = vi.fn();
    mockPromptUpdate = vi.fn();
    mockPromptFindMany = vi.fn();
    mockPromptCount = vi.fn();
    mockPrisma = createMockPrisma(
      mockPromptCreate,
      mockPromptFindUnique,
      mockPromptFindFirst,
      mockPromptUpdate,
      mockPromptFindMany,
      mockPromptCount,
    );
    repo = new PrismaPromptRepository(mockPrisma);
  });

  describe("create", () => {
    it("should create a prompt with all fields and verify the data passed to Prisma", async () => {
      const dto = {
        slug: "test-prompt",
        name: "Test Prompt",
        description: "A test description",
        categoryId: "cat-1",
        ownerId: "user-1",
        organizationId: "org-1",
        workspaceId: "ws-1",
        visibility: "Everyone" as const,
        tags: ["ai", "test"],
        metadata: { env: "prod" },
      };
      const expected = { id: "prompt-1", ...dto };
      mockPromptCreate.mockResolvedValue(expected);

      const result = await repo.create(dto as never);

      expect(mockPromptCreate).toHaveBeenCalledWith({
        data: {
          slug: "test-prompt",
          name: "Test Prompt",
          description: "A test description",
          categoryId: "cat-1",
          ownerId: "user-1",
          organizationId: "org-1",
          workspaceId: "ws-1",
          visibility: "Everyone",
          tags: ["ai", "test"],
          metadata: { env: "prod" },
        },
      });
      expect(result).toEqual(expected);
    });

    it("should create with default visibility and tags", async () => {
      const dto = {
        slug: "default-prompt",
        name: "Default",
        categoryId: "cat-1",
        ownerId: "user-1",
      };
      mockPromptCreate.mockResolvedValue({ id: "prompt-2" });

      await repo.create(dto);

      expect(mockPromptCreate).toHaveBeenCalledWith({
        data: {
          slug: "default-prompt",
          name: "Default",
          description: undefined,
          categoryId: "cat-1",
          ownerId: "user-1",
          organizationId: undefined,
          workspaceId: undefined,
          visibility: "Workspace",
          tags: [],
          metadata: {},
        },
      });
    });
  });

  describe("findById", () => {
    it("should return prompt when found", async () => {
      const expected = { id: "prompt-1", name: "Test" };
      mockPromptFindUnique.mockResolvedValue(expected);

      const result = await repo.findById("prompt-1");

      expect(mockPromptFindUnique).toHaveBeenCalledWith({
        where: { id: "prompt-1", deletedAt: null },
      });
      expect(result).toEqual(expected);
    });

    it("should return null when not found", async () => {
      mockPromptFindUnique.mockResolvedValue(null);

      const result = await repo.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findBySlug", () => {
    it("should return prompt when found", async () => {
      const expected = { id: "prompt-1", slug: "my-prompt" };
      mockPromptFindFirst.mockResolvedValue(expected);

      const result = await repo.findBySlug("my-prompt", "org-1");

      expect(mockPromptFindFirst).toHaveBeenCalledWith({
        where: { slug: "my-prompt", organizationId: "org-1", deletedAt: null },
      });
      expect(result).toEqual(expected);
    });

    it("should return null when not found", async () => {
      mockPromptFindFirst.mockResolvedValue(null);

      const result = await repo.findBySlug("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update with partial data", async () => {
      const dto = { name: "Updated", description: "New desc" };
      const expected = { id: "prompt-1", name: "Updated", description: "New desc" };
      mockPromptUpdate.mockResolvedValue(expected);

      const result = await repo.update("prompt-1", dto);

      expect(mockPromptUpdate).toHaveBeenCalledWith({
        where: { id: "prompt-1" },
        data: { name: "Updated", description: "New desc" },
      });
      expect(result).toEqual(expected);
    });

    it("should handle undefined fields (not passed to Prisma)", async () => {
      const dto = { visibility: "Everyone" as const };
      mockPromptUpdate.mockResolvedValue({ id: "prompt-1" });

      await repo.update("prompt-1", dto as never);

      expect(mockPromptUpdate).toHaveBeenCalledWith({
        where: { id: "prompt-1" },
        data: { visibility: "Everyone" },
      });
    });
  });

  describe("updateStatus", () => {
    it("should update status", async () => {
      const expected = { id: "prompt-1", status: "Active" };
      mockPromptUpdate.mockResolvedValue(expected);

      const result = await repo.updateStatus("prompt-1", "Active");

      expect(mockPromptUpdate).toHaveBeenCalledWith({
        where: { id: "prompt-1" },
        data: { status: "Active" },
      });
      expect(result).toEqual(expected);
    });
  });

  describe("setCurrentVersion", () => {
    it("should set current version", async () => {
      mockPromptUpdate.mockResolvedValue(undefined);

      await repo.setCurrentVersion("prompt-1", "version-1");

      expect(mockPromptUpdate).toHaveBeenCalledWith({
        where: { id: "prompt-1" },
        data: { currentVersionId: "version-1" },
      });
    });
  });

  describe("softDelete", () => {
    it("should set deletedAt", async () => {
      const now = new Date("2026-07-12");
      vi.useFakeTimers();
      vi.setSystemTime(now);
      mockPromptUpdate.mockResolvedValue(undefined);

      await repo.softDelete("prompt-1");

      expect(mockPromptUpdate).toHaveBeenCalledWith({
        where: { id: "prompt-1" },
        data: { deletedAt: now },
      });
      vi.useRealTimers();
    });
  });

  describe("findMany", () => {
    it("should return paginated results with default pagination", async () => {
      const data = [{ id: "prompt-1" }, { id: "prompt-2" }];
      mockPromptFindMany.mockResolvedValue(data);
      mockPromptCount.mockResolvedValue(2);

      const result = await repo.findMany({});

      expect(mockPromptFindMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 20,
        orderBy: { updatedAt: "desc" },
      });
      expect(result).toEqual({
        data,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it("should filter by status", async () => {
      mockPromptFindMany.mockResolvedValue([]);
      mockPromptCount.mockResolvedValue(0);

      await repo.findMany({ status: "Active" as PromptStatus, page: 1, limit: 10 });

      expect(mockPromptFindMany).toHaveBeenCalledWith({
        where: { deletedAt: null, status: "Active" },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: "desc" },
      });
    });

    it("should filter by search", async () => {
      mockPromptFindMany.mockResolvedValue([]);
      mockPromptCount.mockResolvedValue(0);

      await repo.findMany({ search: "test" });

      expect(mockPromptFindMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: "test", mode: "insensitive" } },
            { description: { contains: "test", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 20,
        orderBy: { updatedAt: "desc" },
      });
    });

    it("should filter by tags", async () => {
      mockPromptFindMany.mockResolvedValue([]);
      mockPromptCount.mockResolvedValue(0);

      await repo.findMany({ tags: ["tag1", "tag2"] });

      expect(mockPromptFindMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          tags: { hasSome: ["tag1", "tag2"] },
        },
        skip: 0,
        take: 20,
        orderBy: { updatedAt: "desc" },
      });
    });
  });
});
