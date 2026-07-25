import { describe, it, expect, beforeEach } from "vitest";
import { RagContextComposerService } from "./rag-context-composer.service.js";
import type { RankedChunk } from "./rag-ranker.service.js";

function createChunk(overrides?: Partial<RankedChunk>): RankedChunk {
  return {
    id: "chunk-1",
    content: "test content",
    sourceId: "src-1",
    score: 0.5,
    finalScore: 0.5,
    metadata: {},
    ...overrides,
  };
}

describe("RagContextComposerService", () => {
  let service: RagContextComposerService;

  beforeEach(() => {
    service = new RagContextComposerService();
  });

  describe("compose", () => {
    it("should format chunks with source attribution", () => {
      const result = service.compose([createChunk()], 1000);
      expect(result.context).toContain("[Source:");
      expect(result.context).toContain("test content");
      expect(result.context).toContain("[Score:");
    });

    it("should include source name from metadata", () => {
      const chunk = createChunk({ metadata: { sourceName: "My Document" } });
      const result = service.compose([chunk], 1000);
      expect(result.context).toContain("My Document");
    });

    it("should respect maxTokens limit", () => {
      const chunks = [
        createChunk({ id: "a", content: "x".repeat(80) }),
        createChunk({ id: "b", content: "y".repeat(80) }),
      ];
      const result = service.compose(chunks, 30);
      expect(result.usedChunks).toHaveLength(1);
      expect(result.truncated).toBe(true);
    });

    it("should use all chunks within budget", () => {
      const chunks = [
        createChunk({ id: "a", content: "short" }),
        createChunk({ id: "b", content: "short" }),
      ];
      const result = service.compose(chunks, 1000);
      expect(result.usedChunks).toHaveLength(2);
      expect(result.truncated).toBe(false);
    });

    it("should handle empty chunks", () => {
      const result = service.compose([], 1000);
      expect(result.context).toBe("");
      expect(result.usedChunks).toHaveLength(0);
      expect(result.truncated).toBe(false);
    });
  });
});
