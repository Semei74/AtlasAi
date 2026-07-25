import { describe, it, expect, beforeEach } from "vitest";
import { AgentValidatorService } from "./agent-validator.service.js";
import { AgentState } from "../interfaces/agent-state.enum.js";
import type { AgentDefinition } from "../interfaces/agent-definition.interface.js";
import type { AgentPolicy } from "../interfaces/agent-policy.interface.js";
import type { AgentContext } from "../interfaces/agent-context.interface.js";

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

describe("AgentValidatorService", () => {
  let validator: AgentValidatorService;

  beforeEach(() => {
    validator = new AgentValidatorService();
  });

  describe("validateDefinition", () => {
    it("should pass a valid definition", () => {
      const result = validator.validateDefinition(createValidDefinition());
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should require id", () => {
      const result = validator.validateDefinition(createValidDefinition({ id: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "id")).toBe(true);
    });

    it("should require name", () => {
      const result = validator.validateDefinition(createValidDefinition({ name: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "name")).toBe(true);
    });

    it("should require version", () => {
      const result = validator.validateDefinition(createValidDefinition({ version: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "version")).toBe(true);
    });

    it("should require defaultModel", () => {
      const result = validator.validateDefinition(createValidDefinition({ defaultModel: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "defaultModel")).toBe(true);
    });

    it("should require defaultProvider", () => {
      const result = validator.validateDefinition(createValidDefinition({ defaultProvider: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "defaultProvider")).toBe(true);
    });

    it("should validate maxConcurrency >= 1", () => {
      const result = validator.validateDefinition(createValidDefinition({ maxConcurrency: 0 }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "maxConcurrency")).toBe(true);
    });

    it("should validate timeoutMs >= 1", () => {
      const result = validator.validateDefinition(createValidDefinition({ timeoutMs: 0 }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "timeoutMs")).toBe(true);
    });

    it("should validate maxRetries >= 0", () => {
      const result = validator.validateDefinition(createValidDefinition({ maxRetries: -1 }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "maxRetries")).toBe(true);
    });

    it("should fail on missing capability fields", () => {
      const def = createValidDefinition();
      const caps = { ...def.capabilities, reasoning: undefined as unknown as boolean };
      const result = validator.validateDefinition({ ...def, capabilities: caps });
      expect(result.valid).toBe(false);
    });
  });

  describe("validateCapabilities", () => {
    it("should pass valid capabilities", () => {
      const result = validator.validateCapabilities(createValidDefinition().capabilities);
      expect(result.valid).toBe(true);
    });

    it("should fail if a capability is not boolean", () => {
      const caps = { ...createValidDefinition().capabilities, reasoning: "yes" as unknown as boolean };
      const result = validator.validateCapabilities(caps);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "capabilities.reasoning")).toBe(true);
    });
  });

  describe("validatePolicy", () => {
    it("should pass a valid policy", () => {
      const result = validator.validatePolicy(createValidPolicy());
      expect(result.valid).toBe(true);
    });

    it("should require agentId", () => {
      const result = validator.validatePolicy(createValidPolicy({ agentId: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "agentId")).toBe(true);
    });

    it("should require organizationId", () => {
      const result = validator.validatePolicy(createValidPolicy({ organizationId: "" }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "organizationId")).toBe(true);
    });

    it("should validate maxTokensPerExecution", () => {
      const result = validator.validatePolicy(createValidPolicy({ permissions: { ...createValidPolicy().permissions, maxTokensPerExecution: 0 } }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "permissions.maxTokensPerExecution")).toBe(true);
    });

    it("should validate maxStepsPerExecution", () => {
      const result = validator.validatePolicy(createValidPolicy({ permissions: { ...createValidPolicy().permissions, maxStepsPerExecution: 0 } }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "permissions.maxStepsPerExecution")).toBe(true);
    });

    it("should validate enabled is boolean", () => {
      const result = validator.validatePolicy(createValidPolicy({ enabled: undefined as unknown as boolean }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "enabled")).toBe(true);
    });
  });

  describe("validateExecutionRequest", () => {
    it("should pass a valid context", () => {
      const context: AgentContext = {
        agentId: "agent-1", userId: "user-1", organizationId: "org-1",
        workspaceId: null, conversationId: null, requestId: "req-1",
        input: "do something", metadata: {},
      };
      const result = validator.validateExecutionRequest(context);
      expect(result.valid).toBe(true);
    });

    it("should require agentId", () => {
      const context: AgentContext = {
        agentId: "", userId: "user-1", organizationId: "org-1",
        workspaceId: null, conversationId: null, requestId: "req-1",
        input: "do something", metadata: {},
      };
      const result = validator.validateExecutionRequest(context);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "agentId")).toBe(true);
    });

    it("should require userId", () => {
      const context: AgentContext = {
        agentId: "agent-1", userId: "", organizationId: "org-1",
        workspaceId: null, conversationId: null, requestId: "req-1",
        input: "do something", metadata: {},
      };
      const result = validator.validateExecutionRequest(context);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "userId")).toBe(true);
    });

    it("should require organizationId", () => {
      const context: AgentContext = {
        agentId: "agent-1", userId: "user-1", organizationId: "",
        workspaceId: null, conversationId: null, requestId: "req-1",
        input: "do something", metadata: {},
      };
      const result = validator.validateExecutionRequest(context);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "organizationId")).toBe(true);
    });

    it("should require requestId", () => {
      const context: AgentContext = {
        agentId: "agent-1", userId: "user-1", organizationId: "org-1",
        workspaceId: null, conversationId: null, requestId: "",
        input: "do something", metadata: {},
      };
      const result = validator.validateExecutionRequest(context);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === "requestId")).toBe(true);
    });
  });
});
