import { describe, it, expect, beforeEach } from "vitest";
import { RefreshTokenStoreService } from "./refresh-token-store.service.js";

function createMockRedis() {
  const hashes = new Map<string, Record<string, string>>();
  const sets = new Map<string, Set<string>>();

  function setHashFields(key: string, ...args: string[]) {
    if (!hashes.has(key)) hashes.set(key, {});
    const h = hashes.get(key)!;
    // hset(key, obj) — single object arg
    if (args.length === 1 && typeof args[0] === "object") {
      Object.assign(h, args[0]);
      return;
    }
    // hset(key, field, value, field, value, ...)
    for (let i = 0; i < args.length; i += 2) {
      if (i + 1 < args.length) {
        h[args[i]!] = args[i + 1]!;
      }
    }
  }

  const multi = () => {
    const queue: (() => void)[] = [];
    const chain = {
      hset: (key: string, ...args: string[]) => {
        queue.push(() => { setHashFields(key, ...args); });
        return chain;
      },
      sadd: (key: string, member: string) => {
        queue.push(() => {
          if (!sets.has(key)) sets.set(key, new Set());
          sets.get(key)!.add(member);
        });
        return chain;
      },
      expireat: () => chain,
      del: (...keys: string[]) => {
        queue.push(() => {
          for (const k of keys) hashes.delete(k);
        });
        return chain;
      },
      exec: async () => { for (const fn of queue) fn(); },
    };
    return chain;
  };

  return {
    multi,
    hgetall: async (key: string) => hashes.get(key) ?? null,
    hset: async (key: string, ...args: string[]) => { setHashFields(key, ...args); },
    smembers: async (key: string) => Array.from(sets.get(key) ?? []),
  };
}

describe("RefreshTokenStoreService", () => {
  let service: RefreshTokenStoreService;
  let mockRedis: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    mockRedis = createMockRedis();
    service = new RefreshTokenStoreService(mockRedis as never);
  });

  describe("save", () => {
    it("should store token data and add to user set", async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      await service.save("token-1", "user-1", expiresAt, "family-1");

      const data = await mockRedis.hgetall("refresh_token:token-1");
      expect(data).not.toBeNull();
      expect(data!["userId"]).toBe("user-1");
      expect(data!["consumed"]).toBe("false");
      expect(data!["tokenFamily"]).toBe("family-1");
    });
  });

  describe("find", () => {
    it("should return null for nonexistent token", async () => {
      const result = await service.find("nonexistent");
      expect(result).toBeNull();
    });

    it("should return token data when found", async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      await service.save("token-1", "user-1", expiresAt, "family-1");

      const result = await service.find("token-1");
      expect(result).not.toBeNull();
      expect(result!.userId).toBe("user-1");
      expect(result!.consumed).toBe(false);
      expect(result!.tokenFamily).toBe("family-1");
    });
  });

  describe("markConsumed", () => {
    it("should mark token as consumed", async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      await service.save("token-1", "user-1", expiresAt, "family-1");

      await service.markConsumed("token-1");
      const data = await service.find("token-1");
      expect(data!.consumed).toBe(true);
    });

    it("should set replacedBy when provided", async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      await service.save("token-1", "user-1", expiresAt, "family-1");

      await service.markConsumed("token-1", "token-2");
      const data = await service.find("token-1");
      expect(data!.replacedBy).toBe("token-2");
    });
  });

  describe("invalidateByUser", () => {
    it("should delete all tokens for a user", async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      await service.save("token-1", "user-1", expiresAt, "family-1");
      await service.save("token-2", "user-1", expiresAt, "family-2");

      await service.invalidateByUser("user-1");

      const t1 = await service.find("token-1");
      const t2 = await service.find("token-2");
      expect(t1).toBeNull();
      expect(t2).toBeNull();
    });

    it("should do nothing for user with no tokens", async () => {
      await expect(service.invalidateByUser("user-none")).resolves.toBeUndefined();
    });
  });
});
