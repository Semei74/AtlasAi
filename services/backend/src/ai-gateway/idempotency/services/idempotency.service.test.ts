import { describe, it, expect, beforeEach, vi } from "vitest";
import { IdempotencyServiceImpl } from "./idempotency.service.js";

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  exists: vi.fn(),
  del: vi.fn(),
};

vi.mock("../../../redis/redis.service.js", () => ({
  RedisService: vi.fn(() => mockRedis),
}));

describe("IdempotencyServiceImpl", () => {
  let service: IdempotencyServiceImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new IdempotencyServiceImpl(mockRedis as never);
  });

  it("should return null when key not found", async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await service.get("nonexistent");
    expect(result).toBeNull();
  });

  it("should store and retrieve values", async () => {
    mockRedis.set.mockResolvedValue("OK");
    mockRedis.get.mockResolvedValue(JSON.stringify({
      key: "test-key",
      result: { message: "hello" },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    }));

    await service.set("test-key", { message: "hello" });
    const result = await service.get("test-key");

    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.result).toEqual({ message: "hello" });
    }
  });

  it("should check key existence", async () => {
    mockRedis.exists.mockResolvedValue(1);
    const exists = await service.exists("test-key");
    expect(exists).toBe(true);
  });

  it("should delete keys", async () => {
    mockRedis.del.mockResolvedValue(1);
    await service.delete("test-key");
    expect(mockRedis.del).toHaveBeenCalledWith(expect.stringContaining("test-key"));
  });

  it("should have default config", () => {
    expect(service.config.ttlMs).toBe(3600000);
    expect(service.config.keyPrefix).toBe("idempotency:");
  });
});
