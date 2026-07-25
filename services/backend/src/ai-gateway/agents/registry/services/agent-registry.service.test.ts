import { describe, it, expect, beforeEach } from "vitest";
import { AgentRegistryService } from "./agent-registry.service.js";
import { AgentDiscoveryService } from "./agent-discovery.service.js";
import { AgentHealthService } from "./agent-health.service.js";
import { AgentVersionService } from "./agent-version.service.js";
import { AgentState } from "../../interfaces/agent-state.enum.js";
import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentRegistration } from "../interfaces/agent-registration.interface.js";

function createTestAgent(overrides?: Partial<AgentDefinition>): AgentDefinition {
  return {
    id: "test-agent-1",
    name: "Test Agent",
    description: "An agent for testing",
    version: "1.0.0",
    capabilities: {
      reasoning: true, planning: false, toolExecution: false,
      fileAnalysis: false, codeGeneration: false, knowledgeRetrieval: true,
      workflowExecution: false, collaboration: false, memory: false, streaming: true,
    },
    supportedModels: ["gpt-4", "gpt-3.5"],
    supportedProviders: ["openai", "stub"],
    defaultModel: "gpt-4",
    defaultProvider: "stub",
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

function createRegistration(overrides?: Partial<AgentRegistration>): AgentRegistration {
  return {
    name: "New Agent",
    description: "A newly registered agent",
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
    tags: ["org:org-1"],
    metadata: { department: "engineering" },
    ...overrides,
  };
}

describe("AgentRegistryService", () => {
  let registry: AgentRegistryService;

  beforeEach(() => {
    registry = new AgentRegistryService(
      new AgentDiscoveryService(),
      new AgentHealthService(),
      new AgentVersionService(),
    );
  });

  describe("register (AgentDefinition)", () => {
    it("should register a valid agent", async () => {
      await registry.register(createTestAgent());
      const result = await registry.get("test-agent-1");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("test-agent-1");
    });

    it("should reject duplicate ids", async () => {
      await registry.register(createTestAgent());
      await expect(registry.register(createTestAgent())).rejects.toThrow("already registered");
    });
  });

  describe("registerFromRegistration", () => {
    it("should create an agent from registration data", async () => {
      const id = await registry.registerFromRegistration(createRegistration());
      expect(id).toContain("new-agent");

      const agent = await registry.get(id);
      expect(agent).not.toBeNull();
      expect(agent?.name).toBe("New Agent");
      expect(agent?.enabled).toBe(true);
      expect(agent?.state).toBe(AgentState.Ready);
    });

    it("should store metadata from registration", async () => {
      const id = await registry.registerFromRegistration(createRegistration());
      const metadata = await registry.getMetadata(id);
      expect(metadata).toEqual({ department: "engineering" });
    });

    it("should create version entry from registration", async () => {
      const id = await registry.registerFromRegistration(createRegistration());
      const latest = await registry.getLatestVersion(id);
      expect(latest).not.toBeNull();
      expect(latest?.version).toBe("1.0.0");
    });

    it("should detect duplicate ids between registration and direct register", async () => {
      const id = await registry.registerFromRegistration(createRegistration());
      await expect(registry.register(createTestAgent({ id }))).rejects.toThrow("already registered");
    });
  });

  describe("unregister", () => {
    it("should remove a registered agent", async () => {
      await registry.register(createTestAgent());
      const deleted = await registry.unregister("test-agent-1");
      expect(deleted).toBe(true);
      expect(await registry.get("test-agent-1")).toBeNull();
    });

    it("should return false for non-existent agent", async () => {
      const deleted = await registry.unregister("nonexistent");
      expect(deleted).toBe(false);
    });

    it("should clean up metadata on unregister", async () => {
      const id = await registry.registerFromRegistration(createRegistration());
      await registry.unregister(id);
      expect(await registry.getMetadata(id)).toBeNull();
    });

    it("should clean up versions on unregister", async () => {
      const id = await registry.registerFromRegistration(createRegistration());
      await registry.unregister(id);
      const versions = await registry.getVersionHistory(id);
      expect(versions).toHaveLength(0);
    });
  });

  describe("get / exists", () => {
    it("should return null for non-existent agent", async () => {
      expect(await registry.get("unknown")).toBeNull();
    });

    it("should check existence", async () => {
      await registry.register(createTestAgent());
      expect(await registry.exists("test-agent-1")).toBe(true);
      expect(await registry.exists("unknown")).toBe(false);
    });
  });

  describe("list", () => {
    it("should list all registered agents", async () => {
      await registry.register(createTestAgent({ id: "a", name: "A" }));
      await registry.register(createTestAgent({ id: "b", name: "B" }));
      const agents = await registry.list();
      expect(agents).toHaveLength(2);
    });

    it("should return empty initially", async () => {
      expect(await registry.list()).toHaveLength(0);
    });
  });

  describe("listByCapability", () => {
    it("should filter enabled agents by capability", async () => {
      await registry.register(createTestAgent({ id: "a", capabilities: { ...createTestAgent().capabilities, reasoning: true } }));
      await registry.register(createTestAgent({ id: "disabled", enabled: false, capabilities: { ...createTestAgent().capabilities, reasoning: true } }));
      await registry.register(createTestAgent({ id: "b", capabilities: { ...createTestAgent().capabilities, reasoning: false } }));
      const withReasoning = await registry.listByCapability("reasoning");
      expect(withReasoning).toHaveLength(1);
      expect(withReasoning[0]?.id).toBe("a");
    });
  });

  describe("listByOrganization / listByWorkspace", () => {
    it("should filter by org tag", async () => {
      await registry.register(createTestAgent({ id: "a", tags: ["org:org-1"] }));
      await registry.register(createTestAgent({ id: "b", tags: ["org:org-2"] }));
      const org1 = await registry.listByOrganization("org-1");
      expect(org1).toHaveLength(1);
    });

    it("should filter by ws tag", async () => {
      await registry.register(createTestAgent({ id: "a", tags: ["ws:ws-1"] }));
      await registry.register(createTestAgent({ id: "b", tags: ["ws:ws-2"] }));
      const ws1 = await registry.listByWorkspace("ws-1");
      expect(ws1).toHaveLength(1);
    });
  });

  describe("findByProvider / findByModel", () => {
    it("should filter by provider", async () => {
      await registry.register(createTestAgent({ id: "a", supportedProviders: ["openai"] }));
      await registry.register(createTestAgent({ id: "disabled", enabled: false, supportedProviders: ["openai"] }));
      await registry.register(createTestAgent({ id: "b", supportedProviders: ["anthropic"] }));
      const openai = await registry.findByProvider("openai");
      expect(openai).toHaveLength(1);
    });

    it("should filter by model", async () => {
      await registry.register(createTestAgent({ id: "a", supportedModels: ["gpt-4"] }));
      await registry.register(createTestAgent({ id: "b", supportedModels: ["claude-3"] }));
      const gpt4 = await registry.findByModel("gpt-4");
      expect(gpt4).toHaveLength(1);
    });
  });

  describe("enable / disable", () => {
    it("should enable an agent", async () => {
      await registry.register(createTestAgent({ enabled: false, state: AgentState.Disabled }));
      await registry.enable("test-agent-1");
      const agent = await registry.get("test-agent-1");
      expect(agent?.enabled).toBe(true);
      expect(agent?.state).toBe(AgentState.Ready);
    });

    it("should disable an agent", async () => {
      await registry.register(createTestAgent());
      await registry.disable("test-agent-1");
      const agent = await registry.get("test-agent-1");
      expect(agent?.enabled).toBe(false);
      expect(agent?.state).toBe(AgentState.Disabled);
    });

    it("should throw on enable non-existent", async () => {
      await expect(registry.enable("unknown")).rejects.toThrow("not found");
    });

    it("should throw on disable non-existent", async () => {
      await expect(registry.disable("unknown")).rejects.toThrow("not found");
    });
  });

  describe("getDescriptor", () => {
    it("should return descriptor for existing agent", async () => {
      await registry.register(createTestAgent());
      const desc = await registry.getDescriptor("test-agent-1");
      expect(desc?.id).toBe("test-agent-1");
      expect(desc?.health.status).toBe("unknown");
    });

    it("should return null for non-existent", async () => {
      expect(await registry.getDescriptor("unknown")).toBeNull();
    });
  });

  describe("search", () => {
    it("should search by query text", async () => {
      await registry.register(createTestAgent({ id: "alpha" }));
      await registry.register(createTestAgent({ id: "beta" }));
      const result = await registry.search({ query: "alpha", offset: 0, limit: 100 });
      expect(result.items).toHaveLength(1);
    });

    it("should filter and paginate", async () => {
      await registry.register(createTestAgent({ id: "a", enabled: true }));
      await registry.register(createTestAgent({ id: "b", enabled: false }));
      const result = await registry.search({
        offset: 0, limit: 100,
        filter: { enabled: true },
      });
      expect(result.items).toHaveLength(1);
    });
  });

  describe("filter", () => {
    it("should filter agents", async () => {
      await registry.register(createTestAgent({ id: "a", state: AgentState.Ready }));
      await registry.register(createTestAgent({ id: "b", state: AgentState.Disabled }));
      const result = await registry.filter({ state: AgentState.Disabled });
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("b");
    });
  });

  describe("health", () => {
    it("should get and update health", async () => {
      await registry.register(createTestAgent());
      await registry.updateHealth("test-agent-1", { status: "healthy", responseTimeMs: 50 });
      const health = await registry.getHealth("test-agent-1");
      expect(health.status).toBe("healthy");
      expect(health.responseTimeMs).toBe(50);
    });
  });

  describe("version", () => {
    it("should manage version history", async () => {
      const id = await registry.registerFromRegistration(createRegistration());
      const history = await registry.getVersionHistory(id);
      expect(history).toHaveLength(1);

      await registry.deprecateVersion(id, "1.0.0", "Use 2.0.0");
      const updated = await registry.getVersionHistory(id);
      expect(updated[0]?.deprecated).toBe(true);
    });
  });

  describe("metadata", () => {
    it("should get and update metadata", async () => {
      const id = await registry.registerFromRegistration(createRegistration());
      expect(await registry.getMetadata(id)).toEqual({ department: "engineering" });

      await registry.updateMetadata(id, { department: "data-science" });
      expect(await registry.getMetadata(id)).toEqual({ department: "data-science" });
    });

    it("should return null for non-existent agent metadata", async () => {
      expect(await registry.getMetadata("unknown")).toBeNull();
    });

    it("should throw on update for non-existent agent", async () => {
      await expect(registry.updateMetadata("unknown", {})).rejects.toThrow("not found");
    });
  });
});
