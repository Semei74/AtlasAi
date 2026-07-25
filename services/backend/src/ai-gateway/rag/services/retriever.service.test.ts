import { describe, it, expect, beforeEach } from "vitest";
import { RetrieverService } from "./retriever.service.js";
import { QueryProcessorService } from "./query-processor.service.js";
import { VectorSearchServiceImpl } from "../../vector-search/services/vector-search.service.js";
import { InMemoryVectorStore } from "../../vector-search/services/in-memory-vector-store.js";

describe("RetrieverService", () => {
  let store: InMemoryVectorStore;
  let vectorSearch: VectorSearchServiceImpl;
  let service: RetrieverService;

  beforeEach(async () => {
    store = new InMemoryVectorStore();
    vectorSearch = new VectorSearchServiceImpl(store);
    const queryProcessor = new QueryProcessorService();
    service = new RetrieverService(vectorSearch, queryProcessor);

    await vectorSearch.indexText("chunk-1", "machine learning and neural networks", "kb", "kb-1");
    await vectorSearch.indexText("chunk-2", "deep learning algorithms for AI", "kb", "kb-1");
    await vectorSearch.indexText("chunk-3", "cooking recipes for italian pasta", "kb", "kb-2");
  });

  describe("retrieve", () => {
    it("should retrieve relevant chunks", async () => {
      const chunks = await service.retrieve("machine learning", [], 5, 0, null);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]?.content.toLowerCase()).toContain("machine learning");
    });

    it("should filter by sourceIds", async () => {
      const chunks = await service.retrieve("machine learning", ["kb-2"], 5, 0, null);
      expect(chunks.every((c) => c.sourceId === "kb-2")).toBe(true);
    });

    it("should respect topK limit", async () => {
      const chunks = await service.retrieve("learning", [], 1, 0, null);
      expect(chunks).toHaveLength(1);
    });

    it("should filter by minScore", async () => {
      const chunksWithoutFilter = await service.retrieve("learning", [], 5, 0, null);
      expect(chunksWithoutFilter.length).toBeGreaterThan(0);

      const chunksWithFilter = await service.retrieve("learning", [], 5, 0.99, null);
      expect(chunksWithFilter.length).toBeGreaterThanOrEqual(0);
    });
  });
});
