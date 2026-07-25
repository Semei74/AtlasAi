import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryMemoryStore } from "./in-memory-memory-store.service.js";
import type { AgentMemoryEntry } from "../../interfaces/agent-memory.interface.js";

function createTestEntry(overrides: Partial<AgentMemoryEntry> & { agentId: string }): AgentMemoryEntry {
  const base: AgentMemoryEntry = {
    id: "entry-1",
    agentId: overrides.agentId,
    type: "session",
    key: "test-key",
    value: "test-value",
    context: {
      agentId: overrides.agentId,
      userId: "user-1",
      organizationId: "org-1",
      workspaceId: null,
      conversationId: null,
      requestId: "req-1",
      input: "",
      metadata: {},
    },
    timestamp: new Date(),
    ttl: null,
    metadata: {},
  };
  return { ...base, ...overrides };
}

describe("InMemoryMemoryStore", () => {
  let store: InMemoryMemoryStore;

  beforeEach(() => {
    store = new InMemoryMemoryStore();
  });

  describe("save", () => {
    it("should save and return an entry", async () => {
      const entry = createTestEntry({ agentId: "agent-1" });
      const saved = await store.save(entry);
      expect(saved.id).toBe("entry-1");
      expect(saved.agentId).toBe("agent-1");
    });

    it("should generate an id if none provided", async () => {
      const entry = createTestEntry({ id: "", agentId: "agent-1" });
      const saved = await store.save(entry);
      expect(saved.id).toBeTruthy();
      expect(saved.id).not.toBe("");
    });
  });

  describe("get", () => {
    it("should retrieve an entry by id", async () => {
      await store.save(createTestEntry({ agentId: "agent-1" }));
      const found = await store.get("entry-1");
      expect(found?.key).toBe("test-key");
    });

    it("should return null for unknown id", async () => {
      const found = await store.get("nonexistent");
      expect(found).toBeNull();
    });
  });

  describe("findByKey", () => {
    it("should find entry by agentId, key, and type", async () => {
      await store.save(createTestEntry({ agentId: "agent-1", key: "my-key", type: "session" }));
      const found = await store.findByKey("agent-1", "my-key", "session");
      expect(found?.key).toBe("my-key");
    });

    it("should return null if no match", async () => {
      const found = await store.findByKey("agent-1", "unknown", "session");
      expect(found).toBeNull();
    });
  });

  describe("findByAgent", () => {
    it("should return all entries for an agent", async () => {
      await store.save(createTestEntry({ id: "e1", agentId: "agent-1", type: "session" }));
      await store.save(createTestEntry({ id: "e2", agentId: "agent-1", type: "conversation" }));
      await store.save(createTestEntry({ id: "e3", agentId: "agent-2", type: "session" }));

      const results = await store.findByAgent("agent-1");
      expect(results).toHaveLength(2);
    });

    it("should filter by type", async () => {
      await store.save(createTestEntry({ id: "e1", agentId: "agent-1", type: "session" }));
      await store.save(createTestEntry({ id: "e2", agentId: "agent-1", type: "conversation" }));

      const results = await store.findByAgent("agent-1", "session");
      expect(results).toHaveLength(1);
      expect(results[0]?.type).toBe("session");
    });
  });

  describe("findRecent", () => {
    it("should return most recent entries up to limit", async () => {
      const old = createTestEntry({ id: "e1", agentId: "agent-1", timestamp: new Date("2020-01-01") });
      const mid = createTestEntry({ id: "e2", agentId: "agent-1", timestamp: new Date("2021-01-01") });
      const recent = createTestEntry({ id: "e3", agentId: "agent-1", timestamp: new Date("2022-01-01") });
      await store.save(old);
      await store.save(mid);
      await store.save(recent);

      const results = await store.findRecent("agent-1", "session", 2);
      expect(results).toHaveLength(2);
      expect(results[0]?.id).toBe("e3");
      expect(results[1]?.id).toBe("e2");
    });
  });

  describe("search", () => {
    it("should find entries matching query in key or value", async () => {
      await store.save(createTestEntry({ id: "e1", agentId: "agent-1", key: "alpha", value: "hello world" }));
      await store.save(createTestEntry({ id: "e2", agentId: "agent-1", key: "beta", value: "goodbye world" }));
      await store.save(createTestEntry({ id: "e3", agentId: "agent-1", key: "gamma", value: "nothing" }));

      const results = await store.search("agent-1", "hello", "session");
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe("e1");
    });

    it("should return empty array for no matches", async () => {
      const results = await store.search("agent-1", "zzz", "session");
      expect(results).toHaveLength(0);
    });
  });

  describe("delete", () => {
    it("should delete an entry by id", async () => {
      await store.save(createTestEntry({ agentId: "agent-1" }));
      const deleted = await store.delete("entry-1");
      expect(deleted).toBe(true);
      const found = await store.get("entry-1");
      expect(found).toBeNull();
    });

    it("should return false for unknown id", async () => {
      const deleted = await store.delete("nonexistent");
      expect(deleted).toBe(false);
    });
  });

  describe("deleteByAgent", () => {
    it("should delete all entries for an agent", async () => {
      await store.save(createTestEntry({ id: "e1", agentId: "agent-1" }));
      await store.save(createTestEntry({ id: "e2", agentId: "agent-1" }));
      await store.save(createTestEntry({ id: "e3", agentId: "agent-2" }));

      await store.deleteByAgent("agent-1");
      expect(await store.findByAgent("agent-1")).toHaveLength(0);
      expect(await store.findByAgent("agent-2")).toHaveLength(1);
    });

    it("should delete entries of specific type", async () => {
      await store.save(createTestEntry({ id: "e1", agentId: "agent-1", type: "session" }));
      await store.save(createTestEntry({ id: "e2", agentId: "agent-1", type: "conversation" }));

      await store.deleteByAgent("agent-1", "session");
      expect(await store.findByAgent("agent-1", "session")).toHaveLength(0);
      expect(await store.findByAgent("agent-1", "conversation")).toHaveLength(1);
    });
  });

  describe("count", () => {
    it("should count entries for an agent", async () => {
      await store.save(createTestEntry({ id: "e1", agentId: "agent-1" }));
      await store.save(createTestEntry({ id: "e2", agentId: "agent-1" }));
      expect(await store.count("agent-1")).toBe(2);
    });

    it("should count entries of specific type", async () => {
      await store.save(createTestEntry({ id: "e1", agentId: "agent-1", type: "session" }));
      await store.save(createTestEntry({ id: "e2", agentId: "agent-1", type: "conversation" }));
      expect(await store.count("agent-1", "session")).toBe(1);
    });
  });

  describe("clear", () => {
    it("should remove all entries", async () => {
      await store.save(createTestEntry({ id: "e1", agentId: "agent-1" }));
      await store.save(createTestEntry({ id: "e2", agentId: "agent-2" }));
      await store.clear();
      expect(await store.count("agent-1")).toBe(0);
      expect(await store.count("agent-2")).toBe(0);
    });
  });
});
