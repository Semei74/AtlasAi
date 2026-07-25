import { describe, it, expect, beforeEach } from "vitest";
import { AgentDiscoveryService } from "./agent-discovery.service.js";
import { AgentState } from "../../interfaces/agent-state.enum.js";
import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentHealthStatus } from "../interfaces/agent-health.interface.js";

function createAgent(id: string, overrides?: Partial<AgentDefinition>): AgentDefinition {
  return {
    id,
    name: `Agent ${id}`,
    description: `Description for ${id}`,
    version: "1.0.0",
    capabilities: {
      reasoning: true, planning: false, toolExecution: false,
      fileAnalysis: false, codeGeneration: false, knowledgeRetrieval: true,
      workflowExecution: false, collaboration: false, memory: false, streaming: false,
    },
    supportedModels: ["gpt-4"],
    supportedProviders: ["openai"],
    defaultModel: "gpt-4",
    defaultProvider: "openai",
    maxConcurrency: 5,
    timeoutMs: 30000,
    maxRetries: 3,
    state: AgentState.Ready,
    enabled: true,
    tags: ["org:org-1", "ws:ws-1"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

describe("AgentDiscoveryService", () => {
  let service: AgentDiscoveryService;

  beforeEach(() => {
    service = new AgentDiscoveryService();
  });

  describe("toDescriptor", () => {
    it("should map AgentDefinition to AgentDescriptor", () => {
      const agent = createAgent("test-1");
      const descriptor = service.toDescriptor(agent, null);
      expect(descriptor.id).toBe("test-1");
      expect(descriptor.name).toBe("Agent test-1");
      expect(descriptor.version).toBe("1.0.0");
      expect(descriptor.health.status).toBe("unknown");
    });

    it("should include health when provided", () => {
      const agent = createAgent("test-1");
      const health: AgentHealthStatus = { status: "healthy", lastChecked: new Date(), responseTimeMs: 100, lastError: null, consecutiveFailures: 0 };
      const descriptor = service.toDescriptor(agent, health);
      expect(descriptor.health.status).toBe("healthy");
      expect(descriptor.health.responseTimeMs).toBe(100);
    });
  });

  describe("search", () => {
    it("should return all agents when no options", () => {
      const agents = [createAgent("a"), createAgent("b")];
      const result = service.search(agents, new Map(), { offset: 0, limit: 100 });
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should filter by query text (name)", () => {
      const agents = [createAgent("a", { name: "Alpha" }), createAgent("b", { name: "Beta" })];
      const result = service.search(agents, new Map(), { query: "Alpha", offset: 0, limit: 100 });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe("a");
    });

    it("should filter by query text (id)", () => {
      const agents = [createAgent("alpha-agent"), createAgent("beta-agent")];
      const result = service.search(agents, new Map(), { query: "alpha", offset: 0, limit: 100 });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe("alpha-agent");
    });

    it("should filter by query text (description)", () => {
      const agents = [createAgent("a", { description: "Unique desc" }), createAgent("b")];
      const result = service.search(agents, new Map(), { query: "Unique", offset: 0, limit: 100 });
      expect(result.items).toHaveLength(1);
    });

    it("should apply filter options", () => {
      const agents = [createAgent("a", { enabled: true }), createAgent("b", { enabled: false })];
      const result = service.search(agents, new Map(), {
        offset: 0, limit: 100,
        filter: { enabled: true },
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe("a");
    });

    it("should paginate results", () => {
      const agents = [createAgent("a"), createAgent("b"), createAgent("c")];
      const result = service.search(agents, new Map(), { offset: 1, limit: 1 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(result.offset).toBe(1);
      expect(result.limit).toBe(1);
    });

    it("should sort by name ascending", () => {
      const agents = [createAgent("b", { name: "Beta" }), createAgent("a", { name: "Alpha" })];
      const result = service.search(agents, new Map(), {
        offset: 0, limit: 100,
        sort: "name", sortOrder: "asc",
      });
      expect(result.items[0]?.name).toBe("Alpha");
      expect(result.items[1]?.name).toBe("Beta");
    });

    it("should sort by name descending", () => {
      const agents = [createAgent("a", { name: "Alpha" }), createAgent("b", { name: "Beta" })];
      const result = service.search(agents, new Map(), {
        offset: 0, limit: 100,
        sort: "name", sortOrder: "desc",
      });
      expect(result.items[0]?.name).toBe("Beta");
    });
  });

  describe("filter", () => {
    it("should filter by capabilities", () => {
      const agents = [
        createAgent("a", { capabilities: { ...createAgent("a").capabilities, reasoning: true } }),
        createAgent("b", { capabilities: { ...createAgent("a").capabilities, reasoning: false } }),
      ];
      const result = service.filter(agents, new Map(), { capabilities: { reasoning: true } });
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("a");
    });

    it("should filter by providers", () => {
      const agents = [
        createAgent("a", { supportedProviders: ["openai"] }),
        createAgent("b", { supportedProviders: ["anthropic"] }),
      ];
      const result = service.filter(agents, new Map(), { providers: ["openai"] });
      expect(result).toHaveLength(1);
    });

    it("should filter by models", () => {
      const agents = [
        createAgent("a", { supportedModels: ["gpt-4"] }),
        createAgent("b", { supportedModels: ["claude-3"] }),
      ];
      const result = service.filter(agents, new Map(), { models: ["claude-3"] });
      expect(result).toHaveLength(1);
    });

    it("should filter by tags", () => {
      const agents = [
        createAgent("a", { tags: ["tag1", "tag2"] }),
        createAgent("b", { tags: ["tag1"] }),
      ];
      const result = service.filter(agents, new Map(), { tags: ["tag1", "tag2"] });
      expect(result).toHaveLength(1);
    });

    it("should filter by organizationId", () => {
      const agents = [
        createAgent("a", { tags: ["org:org-1"] }),
        createAgent("b", { tags: ["org:org-2"] }),
      ];
      const result = service.filter(agents, new Map(), { organizationId: "org-1" });
      expect(result).toHaveLength(1);
    });

    it("should filter by workspaceId", () => {
      const agents = [
        createAgent("a", { tags: ["ws:ws-1"] }),
        createAgent("b", { tags: ["ws:ws-2"] }),
      ];
      const result = service.filter(agents, new Map(), { workspaceId: "ws-1" });
      expect(result).toHaveLength(1);
    });

    it("should filter by state", () => {
      const agents = [
        createAgent("a", { state: AgentState.Ready }),
        createAgent("b", { state: AgentState.Disabled }),
      ];
      const result = service.filter(agents, new Map(), { state: AgentState.Disabled });
      expect(result).toHaveLength(1);
    });

    it("should filter by version", () => {
      const agents = [
        createAgent("a", { version: "1.0.0" }),
        createAgent("b", { version: "2.0.0" }),
      ];
      const result = service.filter(agents, new Map(), { version: "2.0.0" });
      expect(result).toHaveLength(1);
    });

    it("should return empty for no match", () => {
      const agents = [createAgent("a")];
      const result = service.filter(agents, new Map(), { version: "9.9.9" });
      expect(result).toHaveLength(0);
    });
  });
});
