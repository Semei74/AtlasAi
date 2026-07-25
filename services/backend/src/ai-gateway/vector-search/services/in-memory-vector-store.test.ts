import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryVectorStore } from "./in-memory-vector-store.js";
import type { VectorRecord } from "../interfaces/vector-store.interface.js";

function createRecord(overrides?: Partial<VectorRecord>): VectorRecord {
  return {
    id: "rec-1",
    vector: [1, 0, 0],
    content: "test content",
    metadata: {},
    sourceType: "document",
    sourceId: "doc-1",
    ...overrides,
  };
}

describe("InMemoryVectorStore", () => {
  let store: InMemoryVectorStore;

  beforeEach(() => {
    store = new InMemoryVectorStore();
  });

  describe("upsert", () => {
    it("should insert a record", async () => {
      await store.upsert(createRecord());
      expect(await store.size()).toBe(1);
    });

    it("should update an existing record", async () => {
      await store.upsert(createRecord({ id: "rec-1", content: "v1" }));
      await store.upsert(createRecord({ id: "rec-1", content: "v2" }));
      expect(await store.size()).toBe(1);
    });
  });

  describe("batchUpsert", () => {
    it("should insert multiple records", async () => {
      await store.batchUpsert([
        createRecord({ id: "a" }),
        createRecord({ id: "b" }),
        createRecord({ id: "c" }),
      ]);
      expect(await store.size()).toBe(3);
    });
  });

  describe("search", () => {
    it("should return results sorted by similarity", async () => {
      await store.upsert(createRecord({ id: "close", vector: [0.9, 0.1, 0] }));
      await store.upsert(createRecord({ id: "far", vector: [0.1, 0.9, 0] }));

      const results = await store.search([1, 0, 0], 10);
      expect(results).toHaveLength(2);
      expect(results[0]?.record.id).toBe("close");
      expect(results[0]?.score).toBeGreaterThan(results[1]?.score ?? 0);
    });

    it("should respect topK limit", async () => {
      await store.upsert(createRecord({ id: "a", vector: [1, 0, 0] }));
      await store.upsert(createRecord({ id: "b", vector: [0, 1, 0] }));

      const results = await store.search([1, 0, 0], 1);
      expect(results).toHaveLength(1);
    });

    it("should filter by metadata", async () => {
      await store.upsert(createRecord({ id: "a", metadata: { project: "alpha" } }));
      await store.upsert(createRecord({ id: "b", metadata: { project: "beta" } }));

      const results = await store.search([1, 0, 0], 10, { project: "alpha" });
      expect(results).toHaveLength(1);
      expect(results[0]?.record.id).toBe("a");
    });

    it("should filter by sourceType", async () => {
      await store.upsert(createRecord({ id: "a", sourceType: "doc" }));
      await store.upsert(createRecord({ id: "b", sourceType: "kb" }));

      const results = await store.search([1, 0, 0], 10, { sourceType: "doc" });
      expect(results).toHaveLength(1);
    });

    it("should return empty for no matches", async () => {
      const results = await store.search([1, 0, 0], 10);
      expect(results).toHaveLength(0);
    });
  });

  describe("remove", () => {
    it("should remove a record", async () => {
      await store.upsert(createRecord({ id: "to-remove" }));
      const removed = await store.remove("to-remove");
      expect(removed).toBe(true);
      expect(await store.size()).toBe(0);
    });

    it("should return false for non-existent record", async () => {
      const removed = await store.remove("non-existent");
      expect(removed).toBe(false);
    });
  });

  describe("clear", () => {
    it("should remove all records", async () => {
      await store.upsert(createRecord({ id: "a" }));
      await store.upsert(createRecord({ id: "b" }));
      await store.clear();
      expect(await store.size()).toBe(0);
    });
  });
});
