import { describe, it, expect, beforeEach } from "vitest";
import { ExecutionValidatorService } from "./execution-validator.service.js";
import { AgentState } from "../../interfaces/agent-state.enum.js";
import type { AgentRegistry } from "../../interfaces/agent-registry.interface.js";
import type { AiPolicyEngine } from "../../../policy/interfaces/ai-policy-engine.interface.js";
import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentPolicy } from "../../interfaces/agent-policy.interface.js";
import type { AgentRuntimeContext } from "../interfaces/agent-runtime-context.interface.js";

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
    supportedModels: ["gpt-4", "gpt-4o"],
    supportedProviders: ["openai", "anthropic"],
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

function createValidPolicy(): AgentPolicy {
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
  };
}

function createContext(overrides?: Partial<AgentRuntimeContext>): AgentRuntimeContext {
  return {
    agent: createValidDefinition(),
    policy: createValidPolicy(),
    organizationId: "org-1",
    workspaceId: null,
    userId: "user-1",
    conversationId: null,
    input: "do something",
    metadata: {},
    ...overrides,
  };
}

describe("ExecutionValidatorService", () => {
  let registry: AgentRegistry;
  let policyEngine: AiPolicyEngine;
  let validator: ExecutionValidatorService;

  beforeEach(() => {
    registry = {
      exists: (id: string) => Promise.resolve(id === "agent-1"),
      get: (id: string) => Promise.resolve(id === "agent-1" ? createValidDefinition() : null),
      register: () => Promise.resolve(),
      unregister: () => Promise.resolve(true),
      list: () => Promise.resolve([]),
      listByCapability: () => Promise.resolve([]),
      listByOrganization: () => Promise.resolve([]),
      listByWorkspace: () => Promise.resolve([]),
      findByProvider: () => Promise.resolve([]),
      findByModel: () => Promise.resolve([]),
      enable: () => Promise.resolve(),
      disable: () => Promise.resolve(),
    } as never;
    policyEngine = {
      evaluate: () => Promise.resolve({
        allowed: true,
        violations: [],
        evaluatedPolicies: [],
      }),
    } as never;
    validator = new ExecutionValidatorService(registry, policyEngine);
  });

  describe("validate", () => {
    it("should pass a valid context", async () => {
      const result = await validator.validate(createContext());
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail if agent is not registered", async () => {
      const ctx = createContext({ agent: createValidDefinition({ id: "unknown" }) });
      const result = await validator.validate(ctx);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "agent")).toBe(true);
    });

    it("should fail if agent is disabled", async () => {
      (registry as { get: (id: string) => Promise<AgentDefinition | null> }).get = () => Promise.resolve(createValidDefinition({ enabled: false }));
      const result = await validator.validate(createContext());
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "agent")).toBe(true);
    });

    it("should fail if userId is empty", async () => {
      const result = await validator.validate(createContext({ userId: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "userId")).toBe(true);
    });

    it("should fail if organizationId is empty", async () => {
      const result = await validator.validate(createContext({ organizationId: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "organizationId")).toBe(true);
    });

    it("should fail if input is empty", async () => {
      const result = await validator.validate(createContext({ input: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "input")).toBe(true);
    });

    it("should fail if conversationId is empty string", async () => {
      const result = await validator.validate(createContext({ conversationId: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "conversationId")).toBe(true);
    });

    it("should fail if provider is not supported", async () => {
      const result = await validator.validate(createContext({ provider: "groq" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "provider")).toBe(true);
    });

    it("should fail if model is not supported", async () => {
      const result = await validator.validate(createContext({ model: "claude-3-opus" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "model")).toBe(true);
    });

    it("should fail on policy violation", async () => {
      (policyEngine as unknown as { evaluate: () => Promise<{ allowed: boolean; violations: readonly { policy: string; code: string; severity: string; reason: string }[]; evaluatedPolicies: readonly string[] }> }).evaluate = () => Promise.resolve({
        allowed: false,
        violations: [{ policy: "pol-1", code: "RATE_LIMIT", severity: "error" as const, reason: "Rate limit exceeded" }],
        evaluatedPolicies: [],
      });
      const result = await validator.validate(createContext());
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "policy")).toBe(true);
    });

    it("should skip policy violations with warning severity", async () => {
      (policyEngine as unknown as { evaluate: () => Promise<{ allowed: boolean; violations: readonly { policy: string; code: string; severity: string; reason: string }[]; evaluatedPolicies: readonly string[] }> }).evaluate = () => Promise.resolve({
        allowed: false,
        violations: [{ policy: "pol-1", code: "LIMIT_WARNING", severity: "warning" as const, reason: "Approaching limit" }],
        evaluatedPolicies: [],
      });
      const result = await validator.validate(createContext());
      expect(result.valid).toBe(true);
    });

    it("should collect multiple errors", async () => {
      const ctx = createContext({ userId: "", organizationId: "", input: "" });
      const result = await validator.validate(ctx);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
