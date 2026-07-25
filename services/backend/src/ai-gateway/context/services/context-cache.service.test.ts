import { describe, it, expect, beforeEach, vi } from "vitest";
import { ContextCacheService } from "./context-cache.service.js";
import type { ContextResult } from "../interfaces/context-result.interface.js";
import type { RedisService } from "../../../redis/redis.service.js";

interface MockRedis {
  get: ReturnType<typeof vi.fn>;
  setex: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
  scanStream: ReturnType<typeof vi.fn>;
}

function createMockRedis(): MockRedis {
  return {
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    scanStream: vi.fn().mockReturnValue({
      [Symbol.asyncIterator]: () => {
        let done = false;
      return {
        next: async (): Promise<{ value: string[]; done: boolean }> => {
          await Promise.resolve();
          if (!done) {
            done = true;
            return { value: ["ctx-key-1", "ctx-key-2"], done: false };
          }
          return { value: [], done: true };
        },
      };
      },
    }),
  };
}

function createSampleResult(): ContextResult {
  return {
    items: [],
    composedContext: "test context",
    tokenCount: 10,
    sourceBreakdown: { system: 10 },
    pipelineTiming: {
      collectTime: 5,
      normalizeTime: 2,
      filterTime: 1,
      rankTime: 1,
      optimizeTime: 1,
      composeTime: 1,
      totalTime: 11,
    },
    truncated: false,
  };
}

describe("ContextCacheService", () => {
  let service: ContextCacheService;
  let mockRedis: MockRedis;

  beforeEach(() => {
    mockRedis = createMockRedis();
    service = new ContextCacheService(mockRedis as unknown as RedisService);
  });

  describe("get", () => {
    it("should return null when cache miss", async () => {
      const result = await service.get("org-1", "user-1");
      expect(result).toBeNull();
    });

    it("should return parsed result when cache hit", async () => {
      const sample = createSampleResult();
      mockRedis.get.mockResolvedValue(JSON.stringify({ result: sample, cachedAt: new Date().toISOString() }));

      const result = await service.get("org-1", "user-1");
      expect(result).not.toBeNull();
      if (result !== null) {
        expect(result.composedContext).toBe("test context");
        expect(result.tokenCount).toBe(10);
      }
    });

    it("should return null on parse error", async () => {
      mockRedis.get.mockResolvedValue("invalid-json");

      const result = await service.get("org-1", "user-1");
      expect(result).toBeNull();
    });

    it("should include workspace in cache key", async () => {
      const sample = createSampleResult();
      mockRedis.get.mockResolvedValue(JSON.stringify({ result: sample, cachedAt: new Date().toISOString() }));

      await service.get("org-1", "user-1", "ws-1");
      expect(mockRedis.get).toHaveBeenCalledWith(expect.stringContaining("ws:ws-1"));
    });

    it("should include conversation in cache key", async () => {
      const sample = createSampleResult();
      mockRedis.get.mockResolvedValue(JSON.stringify({ result: sample, cachedAt: new Date().toISOString() }));

      await service.get("org-1", "user-1", undefined, "conv-1");
      expect(mockRedis.get).toHaveBeenCalledWith(expect.stringContaining("conv:conv-1"));
    });
  });

  describe("set", () => {
    it("should store result with TTL", async () => {
      const sample = createSampleResult();
      await service.set(sample, "org-1", "user-1");

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining("org-1:user-1"),
        300,
        expect.any(String),
      );
    });

    it("should use custom TTL when provided", async () => {
      const sample = createSampleResult();
      await service.set(sample, "org-1", "user-1", undefined, undefined, undefined, 600);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.any(String),
        600,
        expect.any(String),
      );
    });
  });

  describe("invalidate", () => {
    it("should scan and delete matching keys", async () => {
      await service.invalidate("org-1", "user-1");
      expect(mockRedis.del).toHaveBeenCalledWith("ctx-key-1", "ctx-key-2");
    });
  });
});
