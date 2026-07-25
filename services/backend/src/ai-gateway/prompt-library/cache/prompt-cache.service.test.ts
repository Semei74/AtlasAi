import { describe, it, expect, beforeEach, vi } from "vitest";
import { PromptLibraryCacheService } from "./prompt-cache.service.js";

/* ====================================================================== */
/*  Helpers                                                                */
/* ====================================================================== */

function createScanStreamMock(keys: string[][]): { [Symbol.asyncIterator]: () => AsyncIterator<string[]> } {
  let index = 0;
  return {
    [Symbol.asyncIterator]: () => ({
      next: (): Promise<IteratorResult<string[], unknown>> => {
        if (index < keys.length) {
          return Promise.resolve({ value: keys[index++], done: false } as IteratorResult<string[], unknown>);
        }
        return Promise.resolve({ value: undefined, done: true });
      },
    }),
  };
}

/* ====================================================================== */
/*  Mock RedisService                                                       */
/* ====================================================================== */

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  scanStream: vi.fn(),
};

vi.mock("../../../redis/redis.service.js", () => ({
  RedisService: vi.fn(() => mockRedis),
}));

/* ====================================================================== */
/*  Constants                                                              */
/* ====================================================================== */

const PROMPT_ID = "prompt-123";
const VERSION = "1.0.0";
const VARIABLES_HASH = "abc123def456";

/* ====================================================================== */
/*  Tests                                                                  */
/* ====================================================================== */

describe("PromptLibraryCacheService", () => {
  let service: PromptLibraryCacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PromptLibraryCacheService(mockRedis as never);
  });

  /* ================================================================== */
  /*  Config                                                              */
  /* ================================================================== */

  describe("config", () => {
    it("should have default config values", () => {
      expect(service.config).toEqual({
        versionTtlMs: 300000,
        renderTtlMs: 60000,
        categoryTtlMs: 600000,
        keyPrefix: "prompt-library:",
      });
    });
  });

  /* ================================================================== */
  /*  getVersion                                                         */
  /* ================================================================== */

  describe("getVersion", () => {
    it("returns cached version when available", async () => {
      const cachedData = { template: "Hello {{name}}" };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getVersion("v1");

      expect(mockRedis.get).toHaveBeenCalledWith("prompt-library:version:v1");
      expect(result).toEqual(cachedData);
    });

    it("returns null when version not cached", async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.getVersion("v1");

      expect(result).toBeNull();
    });

    it("handles Redis errors gracefully", async () => {
      mockRedis.get.mockRejectedValue(new Error("Redis connection lost"));

      const result = await service.getVersion("v1");

      expect(result).toBeNull();
    });
  });

  /* ================================================================== */
  /*  setVersion                                                         */
  /* ================================================================== */

  describe("setVersion", () => {
    it("stores version with versionTtlMs", async () => {
      const data = { template: "Hello {{name}}" };
      mockRedis.set.mockResolvedValue("OK");

      await service.setVersion("v1", data);

      expect(mockRedis.set).toHaveBeenCalledWith(
        "prompt-library:version:v1",
        JSON.stringify(data),
        "PX",
        300000,
      );
    });

    it("handles Redis errors gracefully", async () => {
      mockRedis.set.mockRejectedValue(new Error("Redis error"));

      await expect(service.setVersion("v1", {})).resolves.toBeUndefined();
    });
  });

  /* ================================================================== */
  /*  invalidateVersion                                                  */
  /* ================================================================== */

  describe("invalidateVersion", () => {
    it("deletes version from cache", async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.invalidateVersion("v1");

      expect(mockRedis.del).toHaveBeenCalledWith("prompt-library:version:v1");
    });
  });

  /* ================================================================== */
  /*  getRender                                                          */
  /* ================================================================== */

  describe("getRender", () => {
    it("returns cached render result when available", async () => {
      const cachedRender = { content: "Hello World" };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedRender));

      const result = await service.getRender(PROMPT_ID, VERSION, VARIABLES_HASH);

      expect(mockRedis.get).toHaveBeenCalledWith(
        `prompt-library:render:${PROMPT_ID}:${VERSION}:${VARIABLES_HASH}`,
      );
      expect(result).toEqual(cachedRender);
    });

    it("returns null when render not cached", async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.getRender(PROMPT_ID, VERSION, VARIABLES_HASH);

      expect(result).toBeNull();
    });

    it("handles Redis errors gracefully", async () => {
      mockRedis.get.mockRejectedValue(new Error("Timeout"));

      const result = await service.getRender(PROMPT_ID, VERSION, VARIABLES_HASH);

      expect(result).toBeNull();
    });
  });

  /* ================================================================== */
  /*  setRender                                                          */
  /* ================================================================== */

  describe("setRender", () => {
    it("stores render result with renderTtlMs", async () => {
      const data = { content: "Hello World" };
      mockRedis.set.mockResolvedValue("OK");

      await service.setRender(PROMPT_ID, VERSION, VARIABLES_HASH, data);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `prompt-library:render:${PROMPT_ID}:${VERSION}:${VARIABLES_HASH}`,
        JSON.stringify(data),
        "PX",
        60000,
      );
    });

    it("handles null data", async () => {
      mockRedis.set.mockResolvedValue("OK");

      await service.setRender(PROMPT_ID, VERSION, VARIABLES_HASH, null);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `prompt-library:render:${PROMPT_ID}:${VERSION}:${VARIABLES_HASH}`,
        JSON.stringify(null),
        "PX",
        60000,
      );
    });

    it("handles Redis errors gracefully", async () => {
      mockRedis.set.mockRejectedValue(new Error("Redis error"));

      await expect(
        service.setRender(PROMPT_ID, VERSION, VARIABLES_HASH, {}),
      ).resolves.toBeUndefined();
    });
  });

  /* ================================================================== */
  /*  invalidateRender                                                   */
  /* ================================================================== */

  describe("invalidateRender", () => {
    it("removes all render entries for a prompt by pattern", async () => {
      const foundKeys = [
        `prompt-library:render:${PROMPT_ID}:1.0.0:hash1`,
        `prompt-library:render:${PROMPT_ID}:1.0.1:hash2`,
      ];
      mockRedis.scanStream.mockReturnValue(
        createScanStreamMock([foundKeys]),
      );
      mockRedis.del.mockResolvedValue(2);

      await service.invalidateRender(PROMPT_ID);

      expect(mockRedis.scanStream).toHaveBeenCalledWith({
        match: `prompt-library:render:${PROMPT_ID}:*`,
      });
      expect(mockRedis.del).toHaveBeenCalledWith(...foundKeys);
    });

    it("handles scanStream returning empty results gracefully", async () => {
      mockRedis.scanStream.mockReturnValue(createScanStreamMock([]));

      await service.invalidateRender(PROMPT_ID);

      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it("handles scanStream with multiple batches", async () => {
      const batch1 = [`prompt-library:render:${PROMPT_ID}:1.0.0:hash1`];
      const batch2 = [`prompt-library:render:${PROMPT_ID}:1.0.1:hash2`];
      mockRedis.scanStream.mockReturnValue(
        createScanStreamMock([batch1, batch2]),
      );
      mockRedis.del.mockResolvedValue(1);

      await service.invalidateRender(PROMPT_ID);

      expect(mockRedis.del).toHaveBeenCalledTimes(2);
      expect(mockRedis.del).toHaveBeenCalledWith(...batch1);
      expect(mockRedis.del).toHaveBeenCalledWith(...batch2);
    });
  });

  /* ================================================================== */
  /*  getCategories                                                      */
  /* ================================================================== */

  describe("getCategories", () => {
    it("returns cached categories when available", async () => {
      const categories = [
        { id: "cat-1", name: "General" },
        { id: "cat-2", name: "Support" },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(categories));

      const result = await service.getCategories();

      expect(mockRedis.get).toHaveBeenCalledWith("prompt-library:categories");
      expect(result).toEqual(categories);
    });

    it("returns null when categories not cached", async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.getCategories();

      expect(result).toBeNull();
    });

    it("handles Redis errors gracefully", async () => {
      mockRedis.get.mockRejectedValue(new Error("Connection refused"));

      const result = await service.getCategories();

      expect(result).toBeNull();
    });
  });

  /* ================================================================== */
  /*  setCategories                                                      */
  /* ================================================================== */

  describe("setCategories", () => {
    it("stores categories with categoryTtlMs", async () => {
      const data = [{ id: "cat-1", name: "General" }];
      mockRedis.set.mockResolvedValue("OK");

      await service.setCategories(data);

      expect(mockRedis.set).toHaveBeenCalledWith(
        "prompt-library:categories",
        JSON.stringify(data),
        "PX",
        600000,
      );
    });

    it("handles empty array", async () => {
      mockRedis.set.mockResolvedValue("OK");

      await service.setCategories([]);

      expect(mockRedis.set).toHaveBeenCalledWith(
        "prompt-library:categories",
        JSON.stringify([]),
        "PX",
        600000,
      );
    });
  });

  /* ================================================================== */
  /*  invalidateCategories                                               */
  /* ================================================================== */

  describe("invalidateCategories", () => {
    it("removes categories from cache", async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.invalidateCategories();

      expect(mockRedis.del).toHaveBeenCalledWith("prompt-library:categories");
    });
  });

  /* ================================================================== */
  /*  invalidatePrompt                                                   */
  /* ================================================================== */

  describe("invalidatePrompt", () => {
    it("removes version and render entries for a prompt", async () => {
      const versionKeys = [
        `prompt-library:version:${PROMPT_ID}:1.0.0`,
        `prompt-library:version:${PROMPT_ID}:1.0.1`,
      ];
      const renderKeys = [
        `prompt-library:render:${PROMPT_ID}:1.0.0:hash1`,
      ];

      mockRedis.scanStream
        .mockReturnValueOnce(createScanStreamMock([versionKeys]))
        .mockReturnValueOnce(createScanStreamMock([renderKeys]));
      mockRedis.del.mockResolvedValue(1);

      await service.invalidatePrompt(PROMPT_ID);

      expect(mockRedis.scanStream).toHaveBeenNthCalledWith(1, {
        match: `prompt-library:version:${PROMPT_ID}:*`,
      });
      expect(mockRedis.scanStream).toHaveBeenNthCalledWith(2, {
        match: `prompt-library:render:${PROMPT_ID}:*`,
      });
      expect(mockRedis.del).toHaveBeenCalledWith(...versionKeys);
      expect(mockRedis.del).toHaveBeenCalledWith(...renderKeys);
    });

    it("handles prompt with no cached entries", async () => {
      mockRedis.scanStream
        .mockReturnValueOnce(createScanStreamMock([]))
        .mockReturnValueOnce(createScanStreamMock([]));

      await service.invalidatePrompt(PROMPT_ID);

      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  /* ================================================================== */
  /*  getStats                                                           */
  /* ================================================================== */

  describe("getStats", () => {
    it("returns initial zero stats", () => {
      const stats = service.getStats();

      expect(stats).toEqual({ hits: 0, misses: 0 });
    });

    it("increments hits on cache hit", async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: "value" }));

      await service.getRender(PROMPT_ID, VERSION, VARIABLES_HASH);

      expect(service.getStats()).toEqual({ hits: 1, misses: 0 });
    });

    it("increments misses on cache miss", async () => {
      mockRedis.get.mockResolvedValue(null);

      await service.getRender(PROMPT_ID, VERSION, VARIABLES_HASH);

      expect(service.getStats()).toEqual({ hits: 0, misses: 1 });
    });

    it("increments misses on Redis error", async () => {
      mockRedis.get.mockRejectedValue(new Error("Error"));

      await service.getRender(PROMPT_ID, VERSION, VARIABLES_HASH);

      expect(service.getStats()).toEqual({ hits: 0, misses: 1 });
    });
  });

  /* ================================================================== */
  /*  Edge cases                                                         */
  /* ================================================================== */

  describe("edge cases", () => {
    it("handles JSON parse failure gracefully", async () => {
      mockRedis.get.mockResolvedValue("{invalid json");

      const result = await service.getRender(PROMPT_ID, VERSION, VARIABLES_HASH);

      expect(result).toBeNull();
    });

    it("handles empty string data", async () => {
      mockRedis.set.mockResolvedValue("OK");

      await service.setRender(PROMPT_ID, VERSION, VARIABLES_HASH, "");

      expect(mockRedis.set).toHaveBeenCalledWith(
        `prompt-library:render:${PROMPT_ID}:${VERSION}:${VARIABLES_HASH}`,
        JSON.stringify(""),
        "PX",
        60000,
      );
    });

    it("handles undefined variables in getRender gracefully", async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.getRender("", "", "");

      expect(mockRedis.get).toHaveBeenCalledWith("prompt-library:render:::");
      expect(result).toBeNull();
    });
  });
});
