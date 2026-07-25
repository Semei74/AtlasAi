import { describe, it, expect, beforeEach } from "vitest";
import { ContextNormalizerService } from "./context-normalizer.service.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";

function createItem(overrides?: Partial<ContextItem>): ContextItem {
  return {
    id: "item-1",
    sourceType: ContextSourceType.System,
    content: "test content",
    metadata: {},
    tokenCount: 3,
    priority: 50,
    score: 0,
    freshness: new Date(),
    permissions: [],
    ...overrides,
  };
}

describe("ContextNormalizerService", () => {
  let service: ContextNormalizerService;

  beforeEach(() => {
    service = new ContextNormalizerService();
  });

  describe("normalize", () => {
    it("should trim content", () => {
      const item = createItem({ content: "  hello world  " });
      const result = service.normalize([item]);
      expect(result[0]?.content).toBe("hello world");
    });

    it("should remove empty items after trimming", () => {
      const emptyItem = createItem({ content: "   " });
      const validItem = createItem({ id: "valid", content: "valid" });
      const result = service.normalize([emptyItem, validItem]);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("valid");
    });

    it("should deduplicate items with same source and content", () => {
      const item1 = createItem({ id: "a", content: "duplicate" });
      const item2 = createItem({ id: "b", content: "duplicate" });
      const result = service.normalize([item1, item2]);
      expect(result).toHaveLength(1);
    });

    it("should keep items with same content but different sources", () => {
      const sys = createItem({ id: "sys", sourceType: ContextSourceType.System, content: "same" });
      const user = createItem({ id: "user", sourceType: ContextSourceType.User, content: "same" });
      const result = service.normalize([sys, user]);
      expect(result).toHaveLength(2);
    });

    it("should estimate token count", () => {
      const item = createItem({ content: "hello world", tokenCount: 0 });
      const result = service.normalize([item]);
      expect(result[0]?.tokenCount).toBe(3);
    });
  });

  describe("estimateTokens", () => {
    it("should return 0 for empty string", () => {
      expect(service.estimateTokens("")).toBe(0);
    });

    it("should estimate ~1 token per 4 characters", () => {
      expect(service.estimateTokens("abcd")).toBe(1);
      expect(service.estimateTokens("abcdefgh")).toBe(2);
    });
  });
});
