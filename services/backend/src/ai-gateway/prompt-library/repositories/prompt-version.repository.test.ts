import { describe, it, expect, beforeEach, vi } from "vitest";
import { createHash } from "node:crypto";
import { PrismaPromptVersionRepository } from "./prompt-version.repository.js";
import type { PrismaService } from "../../../prisma/prisma.service.js";

function createMockPrisma(
  mockCreate: ReturnType<typeof vi.fn>,
  mockFindUnique: ReturnType<typeof vi.fn>,
  mockFindFirst: ReturnType<typeof vi.fn>,
  mockFindMany: ReturnType<typeof vi.fn>,
  mockCount: ReturnType<typeof vi.fn>,
): PrismaService {
  return {
    promptVersion: {
      create: mockCreate,
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      findMany: mockFindMany,
      count: mockCount,
    },
  } as unknown as PrismaService;
}

describe("PrismaPromptVersionRepository", () => {
  let mockPrisma: PrismaService;
  let repo: PrismaPromptVersionRepository;
  let mockVersionFindFirst: ReturnType<typeof vi.fn>;
  let mockVersionCreate: ReturnType<typeof vi.fn>;
  let mockVersionFindUnique: ReturnType<typeof vi.fn>;
  let mockVersionFindMany: ReturnType<typeof vi.fn>;
  let mockVersionCount: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVersionCreate = vi.fn();
    mockVersionFindUnique = vi.fn();
    mockVersionFindFirst = vi.fn();
    mockVersionFindMany = vi.fn();
    mockVersionCount = vi.fn();
    mockPrisma = createMockPrisma(
      mockVersionCreate,
      mockVersionFindUnique,
      mockVersionFindFirst,
      mockVersionFindMany,
      mockVersionCount,
    );
    repo = new PrismaPromptVersionRepository(mockPrisma);
  });

  describe("create", () => {
    it("should create first version as 1.0.0", async () => {
      mockVersionFindFirst.mockResolvedValue(null);
      const expected = { id: "ver-1", version: "1.0.0" };
      mockVersionCreate.mockResolvedValue(expected);

      const result = await repo.create("prompt-1", {
        systemTemplate: "Hi {{name}}",
        userTemplate: "Hello",
        assistantTemplate: "World",
        variables: [{ name: "name", type: "string", required: true }],
        changelog: "Initial version",
        createdBy: "user-1",
      });

      expect(mockVersionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: "1.0.0" }),
        }),
      );
      expect(result).toEqual(expected);
    });

    it("should auto-increment patch version on subsequent versions", async () => {
      mockVersionFindFirst.mockResolvedValue({ version: "1.0.0" });
      const expected = { id: "ver-2", version: "1.0.1" };
      mockVersionCreate.mockResolvedValue(expected);

      const result = await repo.create("prompt-1", {
        systemTemplate: "Updated system template",
        createdBy: "user-1",
      });

      expect(mockVersionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: "1.0.1" }),
        }),
      );
      expect(result).toEqual(expected);
    });

    it("should compute checksum correctly", async () => {
      mockVersionFindFirst.mockResolvedValue(null);
      mockVersionCreate.mockResolvedValue({ id: "ver-1" });

      const dto = {
        systemTemplate: "Hello {{name}}",
        userTemplate: "User input",
        assistantTemplate: "AI response",
        createdBy: "user-1",
      };
      await repo.create("prompt-1", dto);

      const combined = "Hello {{name}}|User input|AI response";
      const expectedChecksum = createHash("sha256").update(combined).digest("hex");
      expect(mockVersionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ checksum: expectedChecksum }),
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return version when found", async () => {
      const expected = { id: "ver-1", version: "1.0.0" };
      mockVersionFindUnique.mockResolvedValue(expected);

      const result = await repo.findById("ver-1");

      expect(mockVersionFindUnique).toHaveBeenCalledWith({ where: { id: "ver-1" } });
      expect(result).toEqual(expected);
    });

    it("should return null when not found", async () => {
      mockVersionFindUnique.mockResolvedValue(null);

      const result = await repo.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findByVersion", () => {
    it("should return specific version", async () => {
      const expected = { id: "ver-1", version: "1.0.0" };
      mockVersionFindUnique.mockResolvedValue(expected);

      const result = await repo.findByVersion("prompt-1", "1.0.0");

      expect(mockVersionFindUnique).toHaveBeenCalledWith({
        where: { promptId_version: { promptId: "prompt-1", version: "1.0.0" } },
      });
      expect(result).toEqual(expected);
    });
  });

  describe("findLatest", () => {
    it("should return most recent version", async () => {
      const expected = { id: "ver-2", version: "1.0.1" };
      mockVersionFindFirst.mockResolvedValue(expected);

      const result = await repo.findLatest("prompt-1");

      expect(mockVersionFindFirst).toHaveBeenCalledWith({
        where: { promptId: "prompt-1" },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(expected);
    });
  });

  describe("findMany", () => {
    it("should return all versions for a prompt ordered by createdAt desc", async () => {
      const expected = [
        { id: "ver-2", version: "1.0.1" },
        { id: "ver-1", version: "1.0.0" },
      ];
      mockVersionFindMany.mockResolvedValue(expected);

      const result = await repo.findMany("prompt-1");

      expect(mockVersionFindMany).toHaveBeenCalledWith({
        where: { promptId: "prompt-1" },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(expected);
    });
  });

  describe("compareVersions", () => {
    it("should detect changes between versions", async () => {
      const versionA = {
        systemTemplate: "old system",
        userTemplate: "same user",
        assistantTemplate: "same assistant",
        variables: [{ name: "a", type: "string", required: true }],
        schema: { x: 1 },
      };
      const versionB = {
        systemTemplate: "new system",
        userTemplate: "same user",
        assistantTemplate: "same assistant",
        variables: [{ name: "b", type: "string", required: true }],
        schema: { x: 2 },
      };
      mockVersionFindUnique
        .mockResolvedValueOnce(versionA)
        .mockResolvedValueOnce(versionB);

      const result = await repo.compareVersions("prompt-1", "1.0.0", "1.0.1");

      expect(result).toEqual({
        versionA: "1.0.0",
        versionB: "1.0.1",
        systemChanged: true,
        userChanged: false,
        assistantChanged: false,
        variablesChanged: true,
        schemaChanged: true,
      });
    });

    it("should throw if version not found", async () => {
      mockVersionFindUnique.mockResolvedValue(null);

      await expect(repo.compareVersions("prompt-1", "1.0.0", "2.0.0")).rejects.toThrow("Version not found");
    });
  });

  describe("existsWithChecksum", () => {
    it("should return true when checksum matches", async () => {
      mockVersionCount.mockResolvedValue(1);

      const result = await repo.existsWithChecksum("prompt-1", "abc123");

      expect(mockVersionCount).toHaveBeenCalledWith({
        where: { promptId: "prompt-1", checksum: "abc123" },
      });
      expect(result).toBe(true);
    });

    it("should return false when no match", async () => {
      mockVersionCount.mockResolvedValue(0);

      const result = await repo.existsWithChecksum("prompt-1", "nonexistent");

      expect(result).toBe(false);
    });
  });
});
