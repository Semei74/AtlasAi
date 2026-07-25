import { describe, it, expect, beforeEach } from "vitest";
import { AgentContextBuilderService } from "./agent-context-builder.service.js";
import { ContextSourceType } from "../../context/interfaces/context-source-type.enum.js";
import { ContextEngineService } from "../../context/services/context-engine.service.js";
import { ContextCollectorService } from "../../context/services/context-collector.service.js";
import { ContextNormalizerService } from "../../context/services/context-normalizer.service.js";
import { ContextFilterService } from "../../context/services/context-filter.service.js";
import { ContextRankerService } from "../../context/services/context-ranker.service.js";
import { ContextOptimizerService } from "../../context/services/context-optimizer.service.js";
import { ContextComposerService } from "../../context/services/context-composer.service.js";
import { RagEngineService } from "../../rag/services/rag-engine.service.js";
import { RetrieverService } from "../../rag/services/retriever.service.js";
import { RagRankerService } from "../../rag/services/rag-ranker.service.js";
import { RagContextComposerService } from "../../rag/services/rag-context-composer.service.js";
import { QueryProcessorService } from "../../rag/services/query-processor.service.js";
import { VectorSearchServiceImpl } from "../../vector-search/services/vector-search.service.js";
import { InMemoryVectorStore } from "../../vector-search/services/in-memory-vector-store.js";

describe("AgentContextBuilderService", () => {
  let builder: AgentContextBuilderService;
  let contextEngine: ContextEngineService;
  let ragEngine: RagEngineService;
  let vectorSearch: VectorSearchServiceImpl;

  beforeEach(() => {
    const store = new InMemoryVectorStore();
    vectorSearch = new VectorSearchServiceImpl(store);

    const collector = new ContextCollectorService();
    const normalizer = new ContextNormalizerService();
    const filter = new ContextFilterService();
    const ranker = new ContextRankerService();
    const optimizer = new ContextOptimizerService();
    const composer = new ContextComposerService();
    const cache = {
      get: () => Promise.resolve(null),
      set: () => Promise.resolve(),
      invalidate: () => Promise.resolve(),
      acquireLockWithRetry: () => Promise.resolve(null),
      releaseLock: () => Promise.resolve(),
    } as never;
    contextEngine = new ContextEngineService(collector, normalizer, filter, ranker, optimizer, composer, cache);

    const queryProcessor = new QueryProcessorService();
    const retriever = new RetrieverService(vectorSearch, queryProcessor);
    const ragRanker = new RagRankerService();
    const ragComposer = new RagContextComposerService();
    ragEngine = new RagEngineService(retriever, ragRanker, ragComposer, {
      defaultTopK: 5,
      defaultMinScore: 0.5,
      maxContextTokens: 2000,
      enableQueryExpansion: true,
      enableHybridSearch: true,
    });

    builder = new AgentContextBuilderService(contextEngine, ragEngine, vectorSearch);
  });

  describe("buildContext", () => {
    it("should build an AgentContext with all required fields", async () => {
      const context = await builder.buildContext(
        "agent-1",
        "user-1",
        "org-1",
        "ws-1",
        "conv-1",
        "Hello, agent!",
        { source: "test" },
      );

      expect(context.agentId).toBe("agent-1");
      expect(context.userId).toBe("user-1");
      expect(context.organizationId).toBe("org-1");
      expect(context.workspaceId).toBe("ws-1");
      expect(context.conversationId).toBe("conv-1");
      expect(context.input).toBe("Hello, agent!");
      expect(context.requestId).toBeDefined();
      expect(context.requestId.length).toBeGreaterThan(0);
      expect(context.metadata).toEqual({ source: "test" });
    });

    it("should allow null workspaceId and conversationId", async () => {
      const context = await builder.buildContext(
        "agent-1", "user-1", "org-1", null, null, "hello",
      );
      expect(context.workspaceId).toBeNull();
      expect(context.conversationId).toBeNull();
    });

    it("should generate unique requestId each time", async () => {
      const c1 = await builder.buildContext("agent-1", "u-1", "org-1", null, null, "hello");
      const c2 = await builder.buildContext("agent-1", "u-1", "org-1", null, null, "hello");
      expect(c1.requestId).not.toBe(c2.requestId);
    });
  });

  describe("buildContextEngineContext", () => {
    it("should build a context result from the Context Engine", async () => {
      const agentCtx = await builder.buildContext("agent-1", "u-1", "org-1", null, null, "machine learning");
      const result = await builder.buildContextEngineContext(agentCtx);
      expect(result).toBeDefined();
      expect(result.composedContext).toBeDefined();
      expect(typeof result.composedContext).toBe("string");
      expect(result.tokenCount).toBeGreaterThanOrEqual(0);
    });

    it("should support optional requiredSources", async () => {
      const agentCtx = await builder.buildContext("agent-1", "u-1", "org-1", null, null, "test");
      const result = await builder.buildContextEngineContext(agentCtx, [ContextSourceType.User]);
      expect(result.sourceBreakdown).toBeDefined();
    });
  });

  describe("buildRagContext", () => {
    it("should build a rag result", async () => {
      const agentCtx = await builder.buildContext("agent-1", "u-1", "org-1", null, null, "machine learning");
      const result = await builder.buildRagContext(agentCtx);
      expect(result.chunks).toBeDefined();
      expect(result.totalChunks).toBeGreaterThanOrEqual(0);
      expect(result.queryTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("should accept an optional custom query", async () => {
      const agentCtx = await builder.buildContext("agent-1", "u-1", "org-1", null, null, "hello");
      const result = await builder.buildRagContext(agentCtx, "neural networks");
      expect(result.totalChunks).toBeGreaterThanOrEqual(0);
    });
  });

  describe("buildVectorSearchContext", () => {
    it("should perform vector search", async () => {
      await vectorSearch.indexText(
        "chunk-1",
        "machine learning algorithms",
        "kb",
        "kb-1",
        { sourceName: "AI Guide" },
      );

      const agentCtx = await builder.buildContext("agent-1", "u-1", "org-1", null, null, "machine learning");
      const results = await builder.buildVectorSearchContext(agentCtx);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.content).toContain("machine learning");
    });

    it("should filter by sourceTypes", async () => {
      await vectorSearch.indexText("doc-1", "react components", "ui", "doc-1");

      const agentCtx = await builder.buildContext("agent-1", "u-1", "org-1", null, null, "react");
      const results = await builder.buildVectorSearchContext(agentCtx, "react", ["ui"]);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.sourceType).toBe("ui");
    });

    it("should support custom query text", async () => {
      const agentCtx = await builder.buildContext("agent-1", "u-1", "org-1", null, null, "irrelevant");
      const results = await builder.buildVectorSearchContext(agentCtx, "machine learning");
      expect(results).toBeDefined();
    });
  });
});
