import { describe, it, expect, beforeEach } from "vitest";
import { ContextOptimizerService } from "./context-optimizer.service.js";
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

describe("ContextOptimizerService", () => {
  let service: ContextOptimizerService;

  beforeEach(() => {
    service = new ContextOptimizerService();
  });

  describe("optimize", () => {
    it("should keep all items within token budget", () => {
      const items = [
        createItem({ id: "a", tokenCount: 100, score: 50 }),
        createItem({ id: "b", tokenCount: 100, score: 50 }),
      ];
      const result = service.optimize(items, 1000);
      expect(result.items).toHaveLength(2);
      expect(result.truncated).toBe(false);
    });

    it("should truncate when exceeding token budget", () => {
      const items = [
        createItem({ id: "a", tokenCount: 100, score: 10 }),
        createItem({ id: "b", tokenCount: 100, score: 50 }),
      ];
      const result = service.optimize(items, 150);
      expect(result.items).toHaveLength(1);
      expect(result.truncated).toBe(true);
    });

    it("should prioritize higher scored items", () => {
      const items = [
        createItem({ id: "low", tokenCount: 100, score: 10 }),
        createItem({ id: "high", tokenCount: 100, score: 90 }),
      ];
      const result = service.optimize(items, 150);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe("high");
    });

    it("should truncate a single large item that exceeds budget", () => {
      const items = [
        createItem({ id: "big", content: "x".repeat(400), tokenCount: 100, score: 50 }),
      ];
      const result = service.optimize(items, 50);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.content).toContain("[TRUNCATED]");
      expect(result.truncated).toBe(true);
    });

    it("should return truncated single item when it exceeds max tokens", () => {
      const items = [
        createItem({ id: "a", tokenCount: 1000, score: 50 }),
      ];
      const result = service.optimize(items, 100);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.content).toContain("[TRUNCATED]");
      expect(result.truncated).toBe(true);
    });

    it("should remove single-character low-value items", () => {
      const items = [
        createItem({ id: "low-value", content: "x", tokenCount: 1, score: 0, priority: 1 }),
        createItem({ id: "good", content: "meaningful content", tokenCount: 5, score: 50 }),
      ];
      const result = service.optimize(items, 1000);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe("good");
    });
  });
});
