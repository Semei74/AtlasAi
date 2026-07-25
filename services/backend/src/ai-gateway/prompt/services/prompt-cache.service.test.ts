import { describe, it, expect, beforeEach } from "vitest";
import { PromptCacheService } from "./prompt-cache.service.js";
import { PromptCategory } from "../interfaces/prompt-category.enum.js";
import { PromptStatus } from "../interfaces/prompt-status.enum.js";
import type { Prompt } from "../interfaces/prompt.interface.js";

function mockPrompt(id: string, version: string): Prompt {
  return {
    id,
    category: PromptCategory.System,
    status: PromptStatus.Published,
    content: "Test content",
    metadata: {
      name: "Test",
      description: "Test",
      version,
      author: "Tester",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      language: "en",
      providerCompatibility: [],
      modelCompatibility: [],
      variables: [],
    },
  };
}

describe("PromptCacheService", () => {
  let cache: PromptCacheService;

  beforeEach(() => {
    cache = new PromptCacheService(10_000, 100);
  });

  describe("get and set", () => {
    it("should store and retrieve a prompt", async () => {
      const prompt = mockPrompt("test.1", "1.0.0");
      await cache.set("test.1", "1.0.0", prompt);

      const result = await cache.get("test.1", "1.0.0");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("test.1");
    });

    it("should return null for uncached prompt", async () => {
      const result = await cache.get("non.existent", "1.0.0");
      expect(result).toBeNull();
    });

    it("should respect TTL expiration", async () => {
      const shortTtl = new PromptCacheService(1, 100);
      const prompt = mockPrompt("test.ttl", "1.0.0");

      await shortTtl.set("test.ttl", "1.0.0", prompt);
      await new Promise((r) => setTimeout(r, 5));

      const result = await shortTtl.get("test.ttl", "1.0.0");
      expect(result).toBeNull();
    });

    it("should differentiate prompts by version", async () => {
      const v1 = mockPrompt("test.versioned", "1.0.0");
      const v2 = mockPrompt("test.versioned", "2.0.0");
      const v2Updated = { ...v2, content: "Updated" };

      await cache.set("test.versioned", "1.0.0", v1);
      await cache.set("test.versioned", "2.0.0", v2Updated);

      const r1 = await cache.get("test.versioned", "1.0.0");
      const r2 = await cache.get("test.versioned", "2.0.0");

      expect(r1!.content).toBe("Test content");
      expect(r2!.content).toBe("Updated");
    });
  });

  describe("invalidate", () => {
    it("should invalidate all versions of a prompt", async () => {
      await cache.set("test.inv", "1.0.0", mockPrompt("test.inv", "1.0.0"));
      await cache.set("test.inv", "2.0.0", mockPrompt("test.inv", "2.0.0"));

      await cache.invalidate("test.inv");

      expect(await cache.get("test.inv", "1.0.0")).toBeNull();
      expect(await cache.get("test.inv", "2.0.0")).toBeNull();
    });

    it("should not invalidate other prompts", async () => {
      await cache.set("test.a", "1.0.0", mockPrompt("test.a", "1.0.0"));
      await cache.set("test.b", "1.0.0", mockPrompt("test.b", "1.0.0"));

      await cache.invalidate("test.a");

      expect(await cache.get("test.b", "1.0.0")).not.toBeNull();
    });
  });

  describe("invalidateAll", () => {
    it("should clear all cache entries", async () => {
      await cache.set("test.a", "1.0.0", mockPrompt("test.a", "1.0.0"));
      await cache.set("test.b", "1.0.0", mockPrompt("test.b", "1.0.0"));

      await cache.invalidateAll();

      expect(await cache.size()).toBe(0);
    });
  });

  describe("has", () => {
    it("should return true for cached prompt", async () => {
      await cache.set("test.has", "1.0.0", mockPrompt("test.has", "1.0.0"));
      expect(await cache.has("test.has", "1.0.0")).toBe(true);
    });

    it("should return false for uncached prompt", async () => {
      expect(await cache.has("test.no", "1.0.0")).toBe(false);
    });
  });

  describe("size", () => {
    it("should return the number of cached entries", async () => {
      await cache.set("test.a", "1.0.0", mockPrompt("test.a", "1.0.0"));
      await cache.set("test.b", "1.0.0", mockPrompt("test.b", "1.0.0"));

      expect(await cache.size()).toBe(2);
    });

    it("should enforce max entries limit", async () => {
      const small = new PromptCacheService(60_000, 3);
      await small.set("a", "1", mockPrompt("a", "1"));
      await small.set("b", "1", mockPrompt("b", "1"));
      await small.set("c", "1", mockPrompt("c", "1"));
      await small.set("d", "1", mockPrompt("d", "1"));

      const s = await small.size();
      expect(s).toBeLessThanOrEqual(3);
    });
  });
});
