import { describe, it, expect, beforeEach } from "vitest";
import { RagEngineService } from "./rag-engine.service.js";
import { RetrieverService } from "./retriever.service.js";
import { RagRankerService } from "./rag-ranker.service.js";
import { RagContextComposerService } from "./rag-context-composer.service.js";
import { QueryProcessorService } from "./query-processor.service.js";
import { VectorSearchServiceImpl } from "../../vector-search/services/vector-search.service.js";
import { InMemoryVectorStore } from "../../vector-search/services/in-memory-vector-store.js";
import type { RagConfig } from "../interfaces/rag-config.interface.js";
import type { RagQuery } from "../../providers/interfaces/rag-engine.interface.js";

describe("RagEngineService", () => {
  let service: RagEngineService;
  let vectorSearch: VectorSearchServiceImpl;

  const config: RagConfig = {
    defaultTopK: 5,
    defaultMinScore: 0.5,
    maxContextTokens: 2000,
    enableQueryExpansion: true,
    enableHybridSearch: true,
  };

  beforeEach(async () => {
    const store = new InMemoryVectorStore();
    vectorSearch = new VectorSearchServiceImpl(store);
    const queryProcessor = new QueryProcessorService();
    const retriever = new RetrieverService(vectorSearch, queryProcessor);
    const ranker = new RagRankerService();
    const composer = new RagContextComposerService();
    service = new RagEngineService(retriever, ranker, composer, config);

    await vectorSearch.indexText("chunk-1", "machine learning and neural networks", "kb", "kb-1", { sourceName: "AI Guide" });
    await vectorSearch.indexText("chunk-2", "deep learning algorithms for AI systems", "kb", "kb-1", { sourceName: "AI Guide" });
  });

  describe("query", () => {
    it("should return relevant chunks", async () => {
      const query: RagQuery = {
        query: "machine learning",
        sourceIds: [],
        topK: 5,
        minScore: 0,
        filter: null,
      };

      const result = await service.query(query);
      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.totalChunks).toBeGreaterThan(0);
      expect(result.queryTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("should respect topK parameter", async () => {
      const query: RagQuery = {
        query: "learning",
        sourceIds: [],
        topK: 1,
        minScore: 0,
        filter: null,
      };

      const result = await service.query(query);
      expect(result.chunks).toHaveLength(1);
    });
  });

  describe("indexSource / removeSource", () => {
    it("should track sources", async () => {
      await service.indexSource({ id: "kb-1", name: "AI Guide", type: "knowledge_base", enabled: true });
      await service.removeSource("kb-1");
    });
  });

  describe("getMetrics", () => {
    it("should return initial zero metrics", () => {
      const metrics = service.getMetrics();
      expect(metrics.queryCount).toBe(0);
      expect(metrics.totalChunksRetrieved).toBe(0);
    });

    it("should track metrics after queries", async () => {
      await service.query({
        query: "machine learning", sourceIds: [], topK: 5, minScore: 0, filter: null,
      });
      const metrics = service.getMetrics();
      expect(metrics.queryCount).toBe(1);
      expect(metrics.totalChunksRetrieved).toBeGreaterThan(0);
      expect(metrics.averageRetrievalTimeMs).toBeGreaterThanOrEqual(0);
    });
  });
});
