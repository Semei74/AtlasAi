import { describe, it, expect, beforeEach } from "vitest";
import { VectorSearchServiceImpl } from "./vector-search.service.js";
import { InMemoryVectorStore } from "./in-memory-vector-store.js";

describe("VectorSearchServiceImpl", () => {
  let store: InMemoryVectorStore;
  let service: VectorSearchServiceImpl;

  beforeEach(() => {
    store = new InMemoryVectorStore();
    service = new VectorSearchServiceImpl(store);
  });

  describe("indexText", () => {
    it("should index text for search", async () => {
      await service.indexText("doc-1", "machine learning algorithms", "document", "source-1");
      expect(await store.size()).toBe(1);
    });
  });

  describe("search", () => {
    it("should find semantically similar text", async () => {
      await service.indexText("doc-1", "machine learning neural networks", "document", "src-1");
      await service.indexText("doc-2", "cooking recipes pasta italian", "document", "src-2");

      const results = await service.search({
        queryText: "machine learning",
        topK: 5,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.id).toBe("doc-1");
    });

    it("should respect topK parameter", async () => {
      await service.indexText("a", "content one", "doc", "s1");
      await service.indexText("b", "content two", "doc", "s2");
      await service.indexText("c", "content three", "doc", "s3");

      const results = await service.search({ queryText: "content", topK: 2 });
      expect(results).toHaveLength(2);
    });

    it("should filter by minScore", async () => {
      await service.indexText("a", "unique content here", "doc", "s1");

      const results = await service.search({
        queryText: "unique content here",
        topK: 5,
        minScore: 0.99,
      });
      expect(results.length).toBeGreaterThan(0);
    });

    it("should filter by sourceTypes", async () => {
      await service.indexText("a", "some content", "wiki", "s1");
      await service.indexText("b", "some content", "doc", "s2");

      const results = await service.search({
        queryText: "content",
        topK: 5,
        sourceTypes: ["wiki"],
      });
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe("a");
    });
  });

  describe("remove", () => {
    it("should remove an indexed document", async () => {
      await service.indexText("doc-1", "content", "doc", "s1");
      const removed = await service.remove("doc-1");
      expect(removed).toBe(true);
      expect(await store.size()).toBe(0);
    });
  });

  describe("clear", () => {
    it("should remove all indexed documents", async () => {
      await service.indexText("a", "content", "doc", "s1");
      await service.indexText("b", "content", "doc", "s2");
      await service.clear();
      expect(await store.size()).toBe(0);
    });
  });
});
