import { describe, it, expect, beforeEach } from "vitest";
import { ContextComposerService } from "./context-composer.service.js";
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

describe("ContextComposerService", () => {
  let service: ContextComposerService;

  beforeEach(() => {
    service = new ContextComposerService();
  });

  describe("compose", () => {
    it("should format a single item", () => {
      const item = createItem({ content: "Hello world", sourceType: ContextSourceType.System });
      const result = service.compose([item]);
      expect(result).toContain("Hello world");
      expect(result).toContain("System Context");
    });

    it("should group items by source type", () => {
      const sysItem = createItem({ id: "s1", content: "System info", sourceType: ContextSourceType.System });
      const userItem = createItem({ id: "u1", content: "User info", sourceType: ContextSourceType.User });
      const result = service.compose([sysItem, userItem]);
      expect(result).toContain("System Context");
      expect(result).toContain("User Context");
    });

    it("should include label metadata when present", () => {
      const item = createItem({
        content: "Item content",
        metadata: { label: "Custom Label" },
      });
      const result = service.compose([item]);
      expect(result).toContain("[Custom Label]");
      expect(result).toContain("Item content");
    });
  });

  describe("computeSourceBreakdown", () => {
    it("should compute token counts per source", () => {
      const sysItems = [
        createItem({ id: "s1", tokenCount: 10, sourceType: ContextSourceType.System }),
        createItem({ id: "s2", tokenCount: 20, sourceType: ContextSourceType.System }),
      ];
      const userItem = createItem({ id: "u1", tokenCount: 30, sourceType: ContextSourceType.User });
      const breakdown = service.computeSourceBreakdown([...sysItems, userItem]);
      expect(breakdown["system"]).toBe(30);
      expect(breakdown["user"]).toBe(30);
    });

    it("should return empty record for empty items", () => {
      const breakdown = service.computeSourceBreakdown([]);
      expect(Object.keys(breakdown)).toHaveLength(0);
    });
  });
});
