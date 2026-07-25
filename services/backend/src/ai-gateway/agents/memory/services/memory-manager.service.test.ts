import { describe, it, expect, beforeEach } from "vitest";
import { MemoryManagerService } from "./memory-manager.service.js";
import { InMemoryMemoryStore } from "./in-memory-memory-store.service.js";
import { DefaultMemoryStrategyService } from "./default-memory-strategy.service.js";
import { MemorySummarizerService } from "./memory-summarizer.service.js";
import { MemoryPolicyService } from "./memory-policy.service.js";
import { MemoryLimitsService } from "./memory-limits.service.js";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";

function createContext(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    agentId: "agent-1",
    userId: "user-1",
    organizationId: "org-1",
    workspaceId: null,
    conversationId: null,
    requestId: "req-1",
    input: "",
    metadata: {},
    ...overrides,
  };
}

describe("MemoryManagerService", () => {
  let manager: MemoryManagerService;
  let store: InMemoryMemoryStore;
  let strategy: DefaultMemoryStrategyService;
  let summarizer: MemorySummarizerService;
  let policy: MemoryPolicyService;
  let limits: MemoryLimitsService;

  beforeEach(() => {
    store = new InMemoryMemoryStore();
    strategy = new DefaultMemoryStrategyService();
    summarizer = new MemorySummarizerService();
    policy = new MemoryPolicyService();
    limits = new MemoryLimitsService(strategy);
    manager = new MemoryManagerService(store, strategy, summarizer, policy, limits);
  });

  describe("remember", () => {
    it("should store an entry and return it", async () => {
      const ctx = createContext();
      const entry = await manager.remember(ctx, "session", "my-key", "my-value");

      expect(entry.key).toBe("my-key");
      expect(entry.value).toBe("my-value");
      expect(entry.agentId).toBe("agent-1");
      expect(entry.id).toBeTruthy();
    });

    it("should trim oldest entries when over limit", async () => {
      const ctx = createContext();
      const cfg = strategy.getLimits("session");

      for (let idx = 0; idx < cfg.maxEntries; idx++) {
        await manager.remember(ctx, "session", `key-${String(idx)}`, `value-${String(idx)}`);
      }

      const window = await manager.getWindow(ctx, "session");
      expect(window.entryCount).toBe(cfg.maxEntries);

      await manager.remember(ctx, "session", "new-key", "new-value");

      const updatedWindow = await manager.getWindow(ctx, "session");
      expect(updatedWindow.entryCount).toBeLessThanOrEqual(cfg.maxEntries);
    });

    it("should store metadata", async () => {
      const ctx = createContext();
      const entry = await manager.remember(ctx, "session", "key", "value", { source: "test" });
      expect(entry.metadata).toEqual({ source: "test" });
    });
  });

  describe("recall", () => {
    it("should retrieve an entry by key", async () => {
      const ctx = createContext();
      await manager.remember(ctx, "session", "my-key", "my-value");

      const found = await manager.recall(ctx, "session", "my-key");
      expect(found?.value).toBe("my-value");
    });

    it("should return null for unknown key", async () => {
      const ctx = createContext();
      const found = await manager.recall(ctx, "session", "unknown");
      expect(found).toBeNull();
    });

    it("should enforce tenant isolation", async () => {
      const ctx1 = createContext({ organizationId: "org-1" });
      const ctx2 = createContext({ organizationId: "org-2", agentId: "agent-1" });

      await manager.remember(ctx1, "session", "my-key", "my-value");
      const found = await manager.recall(ctx2, "session", "my-key");
      expect(found).toBeNull();
    });
  });

  describe("search", () => {
    it("should find entries matching query", async () => {
      const ctx = createContext();
      await manager.remember(ctx, "session", "alpha", "hello world");
      await manager.remember(ctx, "session", "beta", "goodbye world");

      const results = await manager.search(ctx, "session", "hello");
      expect(results).toHaveLength(1);
      expect(results[0]?.key).toBe("alpha");
    });

    it("should return empty array for no match", async () => {
      const ctx = createContext();
      const results = await manager.search(ctx, "session", "nonexistent");
      expect(results).toHaveLength(0);
    });

    it("should filter results by tenant", async () => {
      const ctx1 = createContext({ organizationId: "org-1" });
      const ctx2 = createContext({ organizationId: "org-2", agentId: "agent-1" });

      await manager.remember(ctx1, "session", "key", "shared term");
      const results = await manager.search(ctx2, "session", "shared");
      expect(results).toHaveLength(0);
    });
  });

  describe("getWindow", () => {
    it("should return a window with all entries", async () => {
      const ctx = createContext();
      await manager.remember(ctx, "session", "k1", "v1");
      await manager.remember(ctx, "session", "k2", "v2");

      const window = await manager.getWindow(ctx, "session");
      expect(window.entryCount).toBe(2);
      expect(window.agentId).toBe("agent-1");
      expect(window.type).toBe("session");
      expect(window.summary).toBeNull();
    });

    it("should return empty window when no entries", async () => {
      const ctx = createContext();
      const window = await manager.getWindow(ctx, "session");
      expect(window.entryCount).toBe(0);
      expect(window.entries).toHaveLength(0);
    });
  });

  describe("summarizeWindow", () => {
    it("should return window with summary text", async () => {
      const ctx = createContext();
      const longValue1 = "a".repeat(400);
      const longValue2 = "b".repeat(400);
      await manager.remember(ctx, "session", "k1", longValue1);
      await manager.remember(ctx, "session", "k2", longValue2);

      const window = await manager.summarizeWindow(ctx, "session");
      expect(window.summary).not.toBeNull();
      expect(window.summary).toContain("<summary of");
      expect(window.summary).toContain("session memory");
      expect(window.summary).toContain("agent-1");
    });
  });

  describe("forget", () => {
    it("should delete an entry by id", async () => {
      const ctx = createContext();
      const entry = await manager.remember(ctx, "session", "key", "value");

      const deleted = await manager.forget(ctx, entry.id);
      expect(deleted).toBe(true);

      const found = await manager.recall(ctx, "session", "key");
      expect(found).toBeNull();
    });

    it("should return false for unknown id", async () => {
      const ctx = createContext();
      const deleted = await manager.forget(ctx, "nonexistent");
      expect(deleted).toBe(false);
    });

    it("should deny deletion across organizations", async () => {
      const ctx1 = createContext({ organizationId: "org-1" });
      const ctx2 = createContext({ organizationId: "org-2", agentId: "agent-1" });

      const entry = await manager.remember(ctx1, "session", "key", "value");
      const deleted = await manager.forget(ctx2, entry.id);
      expect(deleted).toBe(false);
    });
  });

  describe("clear", () => {
    it("should clear all memory for an agent", async () => {
      const ctx = createContext();
      await manager.remember(ctx, "session", "k1", "v1");
      await manager.remember(ctx, "conversation", "k2", "v2");

      await manager.clear(ctx);
      expect(await manager.getMemoryUsage(ctx)).toEqual({
        session: 0,
        conversation: 0,
        workspace: 0,
        longTerm: 0,
        vector: 0,
      });
    });

    it("should clear specific memory type", async () => {
      const ctx = createContext();
      await manager.remember(ctx, "session", "k1", "v1");
      await manager.remember(ctx, "conversation", "k2", "v2");

      await manager.clear(ctx, "session");
      expect(await manager.getMemoryUsage(ctx)).toEqual({
        session: 0,
        conversation: 1,
        workspace: 0,
        longTerm: 0,
        vector: 0,
      });
    });
  });

  describe("getMemoryUsage", () => {
    it("should return counts for all memory types", async () => {
      const ctx = createContext();
      await manager.remember(ctx, "session", "k1", "v1");
      await manager.remember(ctx, "conversation", "k2", "v2");

      const usage = await manager.getMemoryUsage(ctx);
      expect(usage.session).toBe(1);
      expect(usage.conversation).toBe(1);
      expect(usage.workspace).toBe(0);
      expect(usage.longTerm).toBe(0);
      expect(usage.vector).toBe(0);
    });
  });

  describe("default-memory-strategy", () => {
    it("should have correct default limits for all types", () => {
      expect(strategy.getLimits("session").maxEntries).toBe(50);
      expect(strategy.getLimits("conversation").maxEntries).toBe(100);
      expect(strategy.getLimits("workspace").maxEntries).toBe(200);
      expect(strategy.getLimits("longTerm").maxEntries).toBe(500);
      expect(strategy.getLimits("vector").maxEntries).toBe(1000);

      expect(strategy.getLimits("session").maxTokens).toBe(2000);
      expect(strategy.getLimits("conversation").maxTokens).toBe(4000);
      expect(strategy.getLimits("longTerm").maxTokens).toBe(16000);
    });

    it("should estimate tokens from text length", () => {
      expect(strategy.estimateTokens("hello")).toBe(2);
      expect(strategy.estimateTokens("a")).toBe(1);
      expect(strategy.estimateTokens("")).toBe(0);
    });

    it("should trigger summarization at threshold", () => {
      expect(strategy.shouldSummarize("session", 0, 1400)).toBe(true);
      expect(strategy.shouldSummarize("session", 0, 100)).toBe(false);
    });

    it("should trigger trim at limits", () => {
      expect(strategy.shouldTrim("session", 50, 0)).toBe(true);
      expect(strategy.shouldTrim("session", 0, 2000)).toBe(true);
      expect(strategy.shouldTrim("session", 10, 500)).toBe(false);
    });
  });
});
