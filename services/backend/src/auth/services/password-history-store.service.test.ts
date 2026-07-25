import { describe, it, expect, beforeEach } from "vitest";
import { PasswordHistoryStoreService } from "./password-history-store.service.js";

let time = 1000000;

function createMockPrisma() {
  const records: { userId: string; passwordHash: string; createdAt: Date }[] = [];

  return {
    passwordHistory: {
      create: async (args: { data: { userId: string; passwordHash: string } }): Promise<void> => {
        records.push({ ...args.data, createdAt: new Date(time++) });
      },
      findMany: async (args: {
        where: { userId: string };
        orderBy: { createdAt: "desc" };
        take: number;
        select: { passwordHash: true };
      }): Promise<{ passwordHash: string }[]> => {
        return records
          .filter((r) => r.userId === args.where.userId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, args.take)
          .map((r) => ({ passwordHash: r.passwordHash }));
      },
    },
  } as never;
}

describe("PasswordHistoryStoreService", () => {
  let service: PasswordHistoryStoreService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new PasswordHistoryStoreService(mockPrisma);
  });

  describe("add", () => {
    it("should store a password hash for the user", async () => {
      await service.add("user-1", "hash-1");
      const history = await service.getAll("user-1");
      expect(history).toContain("hash-1");
    });

    it("should store multiple hashes in order", async () => {
      await service.add("user-1", "hash-old");
      await service.add("user-1", "hash-new");
      const history = await service.getAll("user-1");
      expect(history).toEqual(["hash-new", "hash-old"]);
    });
  });

  describe("getAll", () => {
    it("should return empty array for user with no history", async () => {
      const history = await service.getAll("user-none");
      expect(history).toEqual([]);
    });

    it("should return at most 10 most recent hashes", async () => {
      for (let i = 0; i < 15; i++) {
        await service.add("user-1", `hash-${i}`);
      }
      const history = await service.getAll("user-1");
      expect(history.length).toBeLessThanOrEqual(10);
    });

    it("should return only hashes for the specified user", async () => {
      await service.add("user-1", "hash-u1");
      await service.add("user-2", "hash-u2");
      const history = await service.getAll("user-1");
      expect(history).toEqual(["hash-u1"]);
    });
  });
});
