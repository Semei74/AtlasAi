import { describe, it, expect, beforeEach } from "vitest";
import { PasswordResetStoreService } from "./password-reset-store.service.js";

function createMockPrisma() {
  const records = new Map<string, {
    token: string;
    userId: string;
    expiresAt: Date;
    consumed: boolean;
  }>();

  return {
    passwordResetToken: {
      create: async (args: {
        data: { token: string; userId: string; expiresAt: Date };
      }): Promise<void> => {
        records.set(args.data.token, {
          token: args.data.token,
          userId: args.data.userId,
          expiresAt: args.data.expiresAt,
          consumed: false,
        });
      },
      findUnique: async (args: {
        where: { token: string };
      }): Promise<{
        token: string;
        userId: string;
        expiresAt: Date;
        consumed: boolean;
      } | null> => {
        return records.get(args.where.token) ?? null;
      },
      update: async (args: {
        where: { token: string };
        data: { consumed: boolean };
      }): Promise<void> => {
        const existing = records.get(args.where.token);
        if (existing) {
          records.set(args.where.token, { ...existing, consumed: args.data.consumed });
        }
      },
      updateMany: async (args: {
        where: { userId: string; consumed: boolean };
        data: { consumed: boolean };
      }): Promise<void> => {
        for (const [token, record] of records) {
          if (record.userId === args.where.userId && record.consumed === args.where.consumed) {
            records.set(token, { ...record, consumed: args.data.consumed });
          }
        }
      },
    },
  } as never;
}

describe("PasswordResetStoreService", () => {
  let service: PasswordResetStoreService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new PasswordResetStoreService(mockPrisma);
  });

  describe("save", () => {
    it("should store a reset token", async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      await service.save("token-1", "user-1", expiresAt);

      const data = await service.find("token-1");
      expect(data).not.toBeNull();
      expect(data!.userId).toBe("user-1");
      expect(data!.consumed).toBe(false);
    });
  });

  describe("find", () => {
    it("should return null for nonexistent token", async () => {
      const result = await service.find("nonexistent");
      expect(result).toBeNull();
    });

    it("should return token data when found", async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      await service.save("token-1", "user-1", expiresAt);

      const result = await service.find("token-1");
      expect(result).not.toBeNull();
      expect(result!.userId).toBe("user-1");
    });
  });

  describe("markConsumed", () => {
    it("should mark token as consumed", async () => {
      await service.save("token-1", "user-1", new Date(Date.now() + 3600000));
      await service.markConsumed("token-1");

      const data = await service.find("token-1");
      expect(data!.consumed).toBe(true);
    });
  });

  describe("invalidateByUser", () => {
    it("should mark all unconsumed tokens as consumed for user", async () => {
      await service.save("token-1", "user-1", new Date(Date.now() + 3600000));
      await service.save("token-2", "user-1", new Date(Date.now() + 3600000));
      await service.save("token-3", "user-2", new Date(Date.now() + 3600000));

      await service.invalidateByUser("user-1");

      const t1 = await service.find("token-1");
      const t2 = await service.find("token-2");
      const t3 = await service.find("token-3");
      expect(t1!.consumed).toBe(true);
      expect(t2!.consumed).toBe(true);
      expect(t3!.consumed).toBe(false);
    });

    it("should do nothing for user with no tokens", async () => {
      await expect(service.invalidateByUser("user-none")).resolves.toBeUndefined();
    });
  });
});
