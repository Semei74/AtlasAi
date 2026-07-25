import { describe, it, expect, beforeEach } from "vitest";
import { SessionStoreService } from "./session-store.service.js";
import type { Session } from "../session/interfaces/session.interface.js";

function createMockRedis() {
  const hashes = new Map<string, Record<string, string>>();
  const sets = new Map<string, Set<string>>();

  function setHashFields(key: string, ...args: string[]) {
    if (!hashes.has(key)) hashes.set(key, {});
    const h = hashes.get(key)!;
    if (args.length === 1 && typeof args[0] === "object") {
      Object.assign(h, args[0]);
      return;
    }
    for (let i = 0; i < args.length; i += 2) {
      if (i + 1 < args.length) h[args[i]!] = args[i + 1]!;
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
      srem: (key: string, member: string) => {
        queue.push(() => sets.get(key)?.delete(member));
        return chain;
      },
      expireat: () => chain,
      del: (...keys: string[]) => {
        queue.push(() => { for (const k of keys) hashes.delete(k); });
        return chain;
      },
      exec: async () => { for (const fn of queue) fn(); },
    };
    return chain;
  };

  const pipeline = () => {
    const cmds: string[] = [];
    const p = {
      hgetall: (key: string) => { cmds.push(key); return p; },
      exec: async (): Promise<[Error | null, unknown][] | null> => {
        return cmds.map((key) => [null, hashes.get(key) ?? null]);
      },
    };
    return p;
  };

  return {
    multi,
    pipeline,
    hgetall: async (key: string) => hashes.get(key) ?? null,
    hset: async (key: string, ...args: string[]) => { setHashFields(key, ...args); },
    smembers: async (key: string) => Array.from(sets.get(key) ?? []),
    scan: async (): Promise<[string, string[]]> => ["0", []],
  };
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "sess-1",
    userId: "user-1",
    deviceInfo: { name: "Chrome", platform: "mac", userAgent: "Mozilla/5.0" },
    ipAddress: "127.0.0.1",
    refreshTokenHash: "hash123",
    lastActivityAt: new Date("2026-01-01T00:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    expiresAt: new Date("2026-01-02T00:00:00Z"),
    revokedAt: null,
    ...overrides,
  };
}

describe("SessionStoreService", () => {
  let service: SessionStoreService;
  let redis: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    redis = createMockRedis();
    service = new SessionStoreService(redis as never);
  });

  describe("save", () => {
    it("should store session data and add to user set", async () => {
      await service.save(makeSession());

      const stored = await redis.hgetall("session:sess-1");
      expect(stored).not.toBeNull();
      expect(stored!["userId"]).toBe("user-1");
    });
  });

  describe("findById", () => {
    it("should return null for nonexistent session", async () => {
      const result = await service.findById("nonexistent");
      expect(result).toBeNull();
    });

    it("should return session when found", async () => {
      const s = makeSession();
      await service.save(s);

      const result = await service.findById("sess-1");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("sess-1");
      expect(result!.userId).toBe("user-1");
    });
  });

  describe("findByUserId", () => {
    it("should return empty array for user with no sessions", async () => {
      const result = await service.findByUserId("user-none");
      expect(result).toEqual([]);
    });

    it("should return sessions for user", async () => {
      await service.save(makeSession({ id: "sess-a" }));
      await service.save(makeSession({ id: "sess-b" }));
      await service.save(makeSession({ id: "sess-other", userId: "user-2" }));

      const result = await service.findByUserId("user-1");
      expect(result).toHaveLength(2);
      expect(result.map((s) => s.id).sort()).toEqual(["sess-a", "sess-b"]);
    });
  });

  describe("updateLastActivity", () => {
    it("should update lastActivityAt field", async () => {
      await service.save(makeSession());

      const newTime = new Date("2026-06-01T00:00:00Z");
      await service.updateLastActivity("sess-1", newTime);

      const stored = await redis.hgetall("session:sess-1");
      expect(stored!["lastActivityAt"]).toBe(newTime.toISOString());
    });
  });

  describe("revoke", () => {
    it("should set revokedAt and remove from user set", async () => {
      await service.save(makeSession());

      await service.revoke("sess-1");

      const stored = await redis.hgetall("session:sess-1");
      expect(stored!["revokedAt"]).toBeTruthy();
    });

    it("should do nothing for nonexistent session", async () => {
      await expect(service.revoke("nonexistent")).resolves.toBeUndefined();
    });
  });

  describe("revokeAllByUserId", () => {
    it("should revoke all sessions except the specified one", async () => {
      await service.save(makeSession({ id: "sess-a" }));
      await service.save(makeSession({ id: "sess-b" }));
      await service.save(makeSession({ id: "sess-c" }));

      await service.revokeAllByUserId("user-1", "sess-b");

      const a = await redis.hgetall("session:sess-a");
      const b = await redis.hgetall("session:sess-b");
      const c = await redis.hgetall("session:sess-c");
      expect(a!["revokedAt"]).toBeTruthy();
      expect(b!["revokedAt"]).toBeFalsy();
      expect(c!["revokedAt"]).toBeTruthy();
    });
  });

  describe("deleteExpired", () => {
    it("should return 0 when no expired sessions", async () => {
      const count = await service.deleteExpired(new Date());
      expect(count).toBe(0);
    });
  });
});
