import { describe, it, expect, beforeEach, vi } from "vitest";
import { RagContextSource } from "./rag-context.source.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { RagEngineService } from "../../rag/services/rag-engine.service.js";

describe("RagContextSource", () => {
  let source: RagContextSource;
  let mockRagEngine: { query: ReturnType<typeof vi.fn> };

  function makeRequest(overrides?: Partial<ContextRequest>): ContextRequest {
    return {
      userId: "user-1",
      organizationId: "org-1",
      workspaceId: "ws-1",
      query: "test query",
      maxTokens: 1000,
      ...overrides,
    };
  }

  beforeEach(() => {
    mockRagEngine = {
      query: vi.fn(),
    };
    source = new RagContextSource(mockRagEngine as unknown as RagEngineService);
  });

  it("should have correct type and name", () => {
    expect(source.type).toBe(ContextSourceType.KnowledgeBase);
    expect(source.name).toBe("Knowledge Base (RAG)");
  });

  it("should query RAG engine and return chunks", async () => {
    mockRagEngine.query.mockResolvedValue({
      chunks: [
        { id: "chunk-1", content: "RAG result content", sourceId: "doc-1", score: 0.95, metadata: { title: "Doc 1" } },
        { id: "chunk-2", content: "Second result", sourceId: "doc-2", score: 0.85, metadata: { title: "Doc 2" } },
      ],
      totalChunks: 2,
      queryTimeMs: 100,
    });

    const items = await source.collect(makeRequest());

    expect(items).toHaveLength(2);
    expect(items[0]?.sourceType).toBe(ContextSourceType.KnowledgeBase);
    expect(items[0]?.content).toBe("RAG result content");
    expect(items[0]?.priority).toBe(95);
    expect(items[0]?.score).toBe(0.95);
    expect(items[1]?.content).toBe("Second result");
    expect(items[1]?.priority).toBe(85);
  });

  it("should call RAG engine with correct query parameters", async () => {
    mockRagEngine.query.mockResolvedValue({ chunks: [], totalChunks: 0, queryTimeMs: 0 });

    await source.collect(makeRequest());

    expect(mockRagEngine.query).toHaveBeenCalledWith({
      query: "test query",
      sourceIds: [],
      topK: 5,
      minScore: 0.5,
      filter: { organizationId: "org-1" },
    });
  });

  it("should return empty when no query provided", async () => {
    const items = await source.collect({ userId: "user-1", organizationId: "org-1", maxTokens: 1000 });
    expect(items).toHaveLength(0);
    expect(mockRagEngine.query).not.toHaveBeenCalled();
  });

  it("should return empty when query is empty string", async () => {
    const items = await source.collect(makeRequest({ query: "" }));
    expect(items).toHaveLength(0);
    expect(mockRagEngine.query).not.toHaveBeenCalled();
  });

  it("should include chunk metadata in returned items", async () => {
    mockRagEngine.query.mockResolvedValue({
      chunks: [
        { id: "chunk-3", content: "Content", sourceId: "doc-3", score: 0.9, metadata: { title: "Doc 3", page: 5 } },
      ],
      totalChunks: 1,
      queryTimeMs: 50,
    });

    const items = await source.collect(makeRequest());
    const meta = items[0]?.metadata as Record<string, unknown>;

    expect(meta["sourceId"]).toBe("doc-3");
    expect(meta["score"]).toBe(0.9);
    expect(meta["title"]).toBe("Doc 3");
    expect(meta["page"]).toBe(5);
    expect(meta["label"]).toBe("Knowledge Result 1");
  });

  it("should compute token count from content length", async () => {
    mockRagEngine.query.mockResolvedValue({
      chunks: [
        { id: "c1", content: "x".repeat(20), sourceId: "d1", score: 0.5, metadata: {} },
      ],
      totalChunks: 1,
      queryTimeMs: 0,
    });

    const items = await source.collect(makeRequest());
    expect(items[0]?.tokenCount).toBe(5);
  });

  it("should always be available", () => {
    expect(source.isAvailable()).toBe(true);
  });
});
