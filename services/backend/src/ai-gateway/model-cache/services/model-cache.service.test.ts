import { describe, it, expect, beforeEach, vi } from "vitest";
import { ModelCacheServiceImpl } from "./model-cache.service.js";

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  scanStream: vi.fn(),
};

vi.mock("../../../redis/redis.service.js", () => ({
  RedisService: vi.fn(() => mockRedis),
}));

describe("ModelCacheServiceImpl", () => {
  let service: ModelCacheServiceImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ModelCacheServiceImpl(mockRedis as never);
  });

  it("should return null on cache miss", async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await service.get("nonexistent");
    expect(result).toBeNull();
  });

  it("should return cached value on hit", async () => {
    const cachedEntry = {
      key: "test-key",
      value: { data: "test" },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 300000),
      accessCount: 1,
    };
    mockRedis.get.mockResolvedValue(JSON.stringify(cachedEntry));

    const result = await service.get("test-key");
    expect(result).toEqual({ data: "test" });
  });

  it("should store values in cache", async () => {
    mockRedis.set.mockResolvedValue("OK");
    await service.set("test-key", { data: "test" });
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it("should check key existence", async () => {
    mockRedis.exists.mockResolvedValue(1);
    const exists = await service.exists("test-key");
    expect(exists).toBe(true);
  });

  it("should delete keys", async () => {
    mockRedis.del.mockResolvedValue(1);
    await service.delete("test-key");
    expect(mockRedis.del).toHaveBeenCalled();
  });

  it("should track cache stats", () => {
    const stats = service.getStats();
    expect(stats).toHaveProperty("hits");
    expect(stats).toHaveProperty("misses");
    expect(stats).toHaveProperty("sets");
    expect(stats).toHaveProperty("evictions");
  });

  it("should handle get errors gracefully", async () => {
    mockRedis.get.mockRejectedValue(new Error("Redis error"));
    const result = await service.get("test-key");
    expect(result).toBeNull();
  });

  it("should have default config", () => {
    expect(service.config.ttlMs).toBe(300000);
    expect(service.config.keyPrefix).toBe("model-cache:");
  });
});
