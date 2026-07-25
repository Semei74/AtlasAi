import { describe, it, expect, beforeEach } from "vitest";
import { RagRankerService } from "./rag-ranker.service.js";
import type { RagChunk } from "../../providers/interfaces/rag-engine.interface.js";

function createChunk(overrides?: Partial<RagChunk>): RagChunk {
  return {
    id: "chunk-1",
    content: "test content",
    sourceId: "src-1",
    score: 0.5,
    metadata: {},
    ...overrides,
  };
}

describe("RagRankerService", () => {
  let service: RagRankerService;

  beforeEach(() => {
    service = new RagRankerService();
  });

  describe("rerank", () => {
    it("should sort chunks by finalScore descending", () => {
      const chunks = [
        createChunk({ id: "a", score: 0.5 }),
        createChunk({ id: "b", score: 0.9 }),
      ];
      const ranked = service.rerank(chunks, "test");
      expect(ranked[0]?.id).toBe("b");
      expect(ranked[0]?.finalScore).toBeGreaterThan(ranked[1]?.finalScore ?? 0);
    });

    it("should boost chunks with keyword matches", () => {
      const chunks = [
        createChunk({ id: "a", content: "machine learning algorithms", score: 0.5 }),
        createChunk({ id: "b", content: "cooking recipes", score: 0.5 }),
      ];
      const ranked = service.rerank(chunks, "machine learning");
      expect(ranked[0]?.id).toBe("a");
    });

    it("should apply freshness penalty for old content", () => {
      const oldDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const freshDate = new Date().toISOString();
      const chunks = [
        createChunk({
          id: "old",
          content: "some content",
          score: 0.8,
          metadata: { timestamp: oldDate },
        }),
        createChunk({
          id: "fresh",
          content: "some content",
          score: 0.8,
          metadata: { timestamp: freshDate },
        }),
      ];

      const ranked = service.rerank(chunks, "some content");
      const oldChunk = ranked.find((c) => c.id === "old");
      const freshChunk = ranked.find((c) => c.id === "fresh");
      expect((freshChunk?.finalScore ?? 0)).toBeGreaterThan(oldChunk?.finalScore ?? 0);
    });

    it("should handle empty chunks", () => {
      const ranked = service.rerank([], "test");
      expect(ranked).toHaveLength(0);
    });
  });
});
