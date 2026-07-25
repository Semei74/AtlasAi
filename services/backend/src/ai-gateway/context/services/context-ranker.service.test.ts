import { describe, it, expect, beforeEach } from "vitest";
import { ContextRankerService } from "./context-ranker.service.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";

function createItem(overrides?: Partial<ContextItem>): ContextItem {
  return {
    id: "item-1",
    sourceType: ContextSourceType.System,
    content: "default content",
    metadata: {},
    tokenCount: 3,
    priority: 50,
    score: 0,
    freshness: new Date(),
    permissions: [],
    ...overrides,
  };
}

function createRequest(overrides?: Partial<ContextRequest>): ContextRequest {
  return {
    userId: "user-1",
    organizationId: "org-1",
    maxTokens: 1000,
    ...overrides,
  };
}

describe("ContextRankerService", () => {
  let service: ContextRankerService;

  beforeEach(() => {
    service = new ContextRankerService();
  });

  describe("rank", () => {
    it("should sort items by score descending", () => {
      const low = createItem({ id: "low", priority: 10 });
      const high = createItem({ id: "high", priority: 90 });
      const result = service.rank([low, high], createRequest());
      expect(result[0]?.id).toBe("high");
      expect(result[1]?.id).toBe("low");
    });

    it("should boost items matching query", () => {
      const matching = createItem({
        id: "match",
        content: "The user asked about machine learning",
        priority: 0,
      });
      const nonMatching = createItem({
        id: "no-match",
        content: "Weather report for today",
        priority: 0,
      });
      const request = createRequest({ query: "machine learning" });
      const result = service.rank([nonMatching, matching], request);
      expect(result[0]?.id).toBe("match");
    });

    it("should boost fresh items when prioritizeFreshness is true", () => {
      const old = createItem({
        id: "old",
        freshness: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        priority: 0,
      });
      const fresh = createItem({
        id: "fresh",
        freshness: new Date(),
        priority: 0,
      });
      const request = createRequest({ options: { prioritizeFreshness: true } });
      const result = service.rank([old, fresh], request);
      expect(result[0]?.id).toBe("fresh");
    });

    it("should boost system context by default", () => {
      const regular = createItem({
        id: "regular",
        sourceType: ContextSourceType.User,
        priority: 0,
      });
      const system = createItem({
        id: "system",
        sourceType: ContextSourceType.System,
        priority: 0,
      });
      const result = service.rank([regular, system], createRequest());
      expect(result[0]?.id).toBe("system");
    });

    it("should boost conversation context by default", () => {
      const regular = createItem({
        id: "regular",
        sourceType: ContextSourceType.User,
        priority: 0,
      });
      const conv = createItem({
        id: "conversation",
        sourceType: ContextSourceType.Conversation,
        priority: 0,
      });
      const result = service.rank([regular, conv], createRequest());
      expect(result[0]?.id).toBe("conversation");
    });
  });
});
