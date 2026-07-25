import { describe, it, expect, beforeEach } from "vitest";
import { ExecutionLimitsService } from "./execution-limits.service.js";
import { AgentState } from "../../interfaces/agent-state.enum.js";
import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentPolicy } from "../../interfaces/agent-policy.interface.js";

function createValidDefinition(overrides?: Partial<AgentDefinition>): AgentDefinition {
  return {
    id: "agent-1",
    name: "Agent One",
    description: "A test agent",
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
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createValidPolicy(overrides?: Partial<AgentPolicy>): AgentPolicy {
  return {
    agentId: "agent-1",
    organizationId: "org-1",
    workspaceId: null,
    permissions: {
      allowedTools: [],
      allowedContextSources: [],
      allowedMemoryTypes: [],
      maxTokensPerExecution: 10000,
      maxStepsPerExecution: 50,
      requireHumanApproval: false,
      requireApprovalForTools: [],
    },
    rateLimit: {
      executionsPerMinute: 10,
      executionsPerHour: 100,
      executionsPerDay: 1000,
    },
    resourceLimits: {
      maxMemoryMb: 512,
      maxStorageMb: 1024,
      maxInputTokens: 8000,
      maxOutputTokens: 2000,
    },
    enabled: true,
    ...overrides,
  };
}

describe("ExecutionLimitsService", () => {
  let service: ExecutionLimitsService;

  beforeEach(() => {
    service = new ExecutionLimitsService();
  });

  describe("buildLimits", () => {
    it("should build limits from agent and policy defaults", () => {
      const limits = service.buildLimits(createValidDefinition(), createValidPolicy());
      expect(limits.timeoutMs).toBe(30000);
      expect(limits.maxTokens).toBe(10000);
      expect(limits.maxSteps).toBe(50);
      expect(limits.maxRetries).toBe(3);
      expect(limits.allowedProviders).toEqual(["openai"]);
      expect(limits.allowedModels).toEqual(["gpt-4"]);
      expect(limits.requireHumanApproval).toBe(false);
    });

    it("should use requested provider and model when provided", () => {
      const limits = service.buildLimits(createValidDefinition(), createValidPolicy(), "anthropic", "claude-3");
      expect(limits.allowedProviders).toEqual(["anthropic"]);
      expect(limits.allowedModels).toEqual(["claude-3"]);
    });

    it("should compute maxTokens from policy resource limits", () => {
      const policy = createValidPolicy({ resourceLimits: { maxMemoryMb: 512, maxStorageMb: 1024, maxInputTokens: 4000, maxOutputTokens: 1000 } });
      const limits = service.buildLimits(createValidDefinition(), policy);
      expect(limits.maxTokens).toBe(5000);
    });
  });

  describe("validateLimits", () => {
    it("should pass valid limits", () => {
      const limits = service.buildLimits(createValidDefinition(), createValidPolicy());
      const result = service.validateLimits(limits, "openai", "gpt-4");
      expect(result.withinLimits).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should fail if timeoutMs < 1000", () => {
      const limits = service.buildLimits(createValidDefinition(), createValidPolicy());
      const lowTimeout = { ...limits, timeoutMs: 500 };
      const result = service.validateLimits(lowTimeout, "openai", "gpt-4");
      expect(result.withinLimits).toBe(false);
      expect(result.violations.some((v) => v.includes("Timeout"))).toBe(true);
    });

    it("should fail if maxTokens < 1", () => {
      const limits = service.buildLimits(createValidDefinition(), createValidPolicy());
      const noTokens = { ...limits, maxTokens: 0 };
      const result = service.validateLimits(noTokens, "openai", "gpt-4");
      expect(result.withinLimits).toBe(false);
      expect(result.violations.some((v) => v.includes("tokens"))).toBe(true);
    });

    it("should fail if provider not allowed", () => {
      const limits = service.buildLimits(createValidDefinition(), createValidPolicy());
      const result = service.validateLimits(limits, "groq", "gpt-4");
      expect(result.withinLimits).toBe(false);
      expect(result.violations.some((v) => v.includes("Provider"))).toBe(true);
    });

    it("should fail if model not allowed", () => {
      const limits = service.buildLimits(createValidDefinition(), createValidPolicy());
      const result = service.validateLimits(limits, "openai", "claude-3");
      expect(result.withinLimits).toBe(false);
      expect(result.violations.some((v) => v.includes("Model"))).toBe(true);
    });

    it("should collect multiple violations", () => {
      const limits = service.buildLimits(createValidDefinition(), createValidPolicy());
      const bad = { ...limits, timeoutMs: 500, maxTokens: 0 };
      const result = service.validateLimits(bad, "groq", "unknown");
      expect(result.violations.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("isTimeout", () => {
    it("should return true if elapsed >= timeout", () => {
      const limits = service.buildLimits(createValidDefinition(), createValidPolicy());
      expect(service.isTimeout(limits, 30000)).toBe(true);
      expect(service.isTimeout(limits, 35000)).toBe(true);
    });

    it("should return false if elapsed < timeout", () => {
      const limits = service.buildLimits(createValidDefinition(), createValidPolicy());
      expect(service.isTimeout(limits, 29999)).toBe(false);
    });
  });
});
