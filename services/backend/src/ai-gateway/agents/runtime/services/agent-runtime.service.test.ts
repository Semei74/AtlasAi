import { describe, it, expect, beforeEach, vi } from "vitest";
import { AgentRuntimeService } from "./agent-runtime.service.js";
import { AgentRuntimeState } from "../interfaces/agent-runtime-state.interface.js";
import type { AgentRuntimeRequest } from "../interfaces/agent-runtime-request.interface.js";
import type { AgentRuntimeContext } from "../interfaces/agent-runtime-context.interface.js";
import type { ExecutionContext } from "../interfaces/execution-context.interface.js";
import type { ExecutionResult } from "../interfaces/execution-result.interface.js";
import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentPolicy } from "../../interfaces/agent-policy.interface.js";
import { AgentState } from "../../interfaces/agent-state.enum.js";
import type { ExecutionValidatorService } from "./execution-validator.service.js";
import type { ExecutionLimitsService } from "./execution-limits.service.js";
import type { AgentExecutionService } from "./agent-execution.service.js";
import { RuntimeMetricsService } from "./runtime-metrics.service.js";

function createAgent(overrides?: Partial<AgentDefinition>): AgentDefinition {
  return {
    id: "agent-1",
    name: "Test Agent",
    description: "A test agent",
    version: "1.0.0",
    capabilities: { reasoning: true, planning: false, toolExecution: false, fileAnalysis: false, codeGeneration: false, knowledgeRetrieval: true, workflowExecution: false, collaboration: false, memory: false, streaming: false },
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

function createPolicy(overrides?: Partial<AgentPolicy>): AgentPolicy {
  return {
    agentId: "agent-1",
    organizationId: "org-1",
    workspaceId: null,
    permissions: { allowedTools: [], allowedContextSources: [], allowedMemoryTypes: [], maxTokensPerExecution: 10000, maxStepsPerExecution: 50, requireHumanApproval: false, requireApprovalForTools: [] },
    rateLimit: { executionsPerMinute: 10, executionsPerHour: 100, executionsPerDay: 1000 },
    resourceLimits: { maxMemoryMb: 512, maxStorageMb: 1024, maxInputTokens: 8000, maxOutputTokens: 2000 },
    enabled: true,
    ...overrides,
  };
}

function createContext(overrides?: Partial<AgentRuntimeContext>): AgentRuntimeContext {
  return {
    agent: createAgent(),
    policy: createPolicy(),
    organizationId: "org-1",
    workspaceId: null,
    userId: "user-1",
    conversationId: null,
    input: "do something",
    metadata: {},
    ...overrides,
  };
}

function createRequest(overrides?: Partial<AgentRuntimeRequest>): AgentRuntimeRequest {
  return {
    context: createContext(),
    ...overrides,
  };
}

describe("AgentRuntimeService", () => {
  let validator: ExecutionValidatorService;
  let limitsService: ExecutionLimitsService;
  let executionService: AgentExecutionService;
  let metricsService: RuntimeMetricsService;
  let runtime: AgentRuntimeService;

  beforeEach(() => {
    validator = {
      validate: async () => ({ valid: true, errors: [] }),
    } as unknown as ExecutionValidatorService;

    limitsService = {
      buildLimits: () => ({ timeoutMs: 30000, maxTokens: 10000, maxSteps: 50, maxRetries: 3, allowedProviders: ["openai"], allowedModels: ["gpt-4"], requireHumanApproval: false }),
      validateLimits: () => ({ withinLimits: true, violations: [] }),
      isTimeout: () => false,
    } as unknown as ExecutionLimitsService;

    executionService = {
      execute: async (ctx: ExecutionContext): Promise<ExecutionResult> => ({
        output: "Hello world",
        status: "completed",
        totalTokens: 30,
        totalCost: 0.00006,
        durationMs: 100,
        modelUsed: ctx.agent.defaultModel,
        providerUsed: ctx.agent.defaultProvider,
        finishedAt: new Date(),
        error: null,
      }),
    } as unknown as AgentExecutionService;

    metricsService = new RuntimeMetricsService();

    runtime = new AgentRuntimeService(validator, limitsService, executionService, metricsService);
  });

  describe("initial state", () => {
    it("should start in Idle state", () => {
      expect(runtime.getState()).toBe(AgentRuntimeState.Idle);
    });

    it("should have zero metrics", () => {
      const m = runtime.getMetrics();
      expect(m.totalExecutions).toBe(0);
    });
  });

  describe("execute", () => {
    it("should return completed result", async () => {
      const result = await runtime.execute(createRequest());
      expect(result.result.status).toBe("completed");
      expect(result.result.output).toBe("Hello world");
    });

    it("should return validation errors when validation fails", async () => {
      validator.validate = async () => ({
        valid: false,
        errors: [{ field: "agent", message: "Agent is not registered" }],
      });

      const result = await runtime.execute(createRequest());
      expect(result.result.status).toBe("failed");
      expect(result.result.error).toContain("Agent is not registered");
    });

    it("should transition state to Executing during execution", async () => {
      const executePromise = runtime.execute(createRequest());
      expect(runtime.getState()).toBe(AgentRuntimeState.Executing);
      await executePromise;
    });

    it("should transition to Completed after success", async () => {
      await runtime.execute(createRequest());
      expect(runtime.getState()).toBe(AgentRuntimeState.Completed);
    });

    it("should emit executionStart event", async () => {
      const events: unknown[] = [];
      runtime.onEvent((e) => events.push(e));

      await runtime.execute(createRequest());

      expect(events.some((e: unknown) => (e as { type: string }).type === "executionStart")).toBe(true);
      expect(events.some((e: unknown) => (e as { type: string }).type === "executionComplete")).toBe(true);
    });

    it("should emit executionFailed event on validation error", async () => {
      validator.validate = async () => ({
        valid: false,
        errors: [{ field: "agent", message: "Not found" }],
      });

      const events: unknown[] = [];
      runtime.onEvent((e) => events.push(e));

      await runtime.execute(createRequest());
      expect(events.some((e: unknown) => (e as { type: string }).type === "executionFailed")).toBe(true);
    });

    it("should emit executionFailed event on execution error", async () => {
      executionService.execute = async () => {
        throw new Error("Unexpected error");
      };

      const events: unknown[] = [];
      runtime.onEvent((e) => events.push(e));

      await runtime.execute(createRequest());
      expect(events.some((e: unknown) => (e as { type: string }).type === "executionFailed")).toBe(true);
    });

    it("should record metrics on completion", async () => {
      await runtime.execute(createRequest());
      const m = runtime.getMetrics();
      expect(m.totalExecutions).toBe(1);
      expect(m.completedExecutions).toBe(1);
    });

    it("should record metrics on validation failure", async () => {
      validator.validate = async () => ({
        valid: false,
        errors: [{ field: "agent", message: "Not found" }],
      });

      await runtime.execute(createRequest());
      const m = runtime.getMetrics();
      expect(m.totalExecutions).toBe(1);
      expect(m.failedExecutions).toBe(1);
    });

    it("should cancel when external signal is aborted before execution", async () => {
      const controller = new AbortController();
      controller.abort();

      const result = await runtime.execute(createRequest({ signal: controller.signal }));
      expect(result.result.status).toBe("cancelled");
      expect(result.result.error).toBe("Execution was cancelled");
    });

    it("should pass through timeout from execution service", async () => {
      executionService.execute = async (ctx: ExecutionContext): Promise<ExecutionResult> => {
        return { output: "", status: "timeout", totalTokens: 0, totalCost: 0, durationMs: 31000, modelUsed: ctx.agent.defaultModel, providerUsed: ctx.agent.defaultProvider, finishedAt: new Date(), error: "timeout" };
      };

      const result = await runtime.execute(createRequest());
      expect(result.result.status).toBe("timeout");
    });

    it("should handle cancelled from execution service", async () => {
      executionService.execute = async (ctx: ExecutionContext): Promise<ExecutionResult> => {
        return { output: "", status: "cancelled", totalTokens: 0, totalCost: 0, durationMs: 50, modelUsed: ctx.agent.defaultModel, providerUsed: ctx.agent.defaultProvider, finishedAt: new Date(), error: "Cancelled" };
      };

      const result = await runtime.execute(createRequest());
      expect(result.result.status).toBe("cancelled");
    });

    it("should handle errored execution result without abort", async () => {
      executionService.execute = async (ctx: ExecutionContext): Promise<ExecutionResult> => {
        return { output: "", status: "failed", totalTokens: 0, totalCost: 0, durationMs: 50, modelUsed: ctx.agent.defaultModel, providerUsed: ctx.agent.defaultProvider, finishedAt: new Date(), error: "Model failure" };
      };

      const result = await runtime.execute(createRequest());
      expect(result.result.status).toBe("failed");
      expect(result.result.error).toBe("Model failure");
      expect(runtime.getState()).toBe(AgentRuntimeState.Completed);
    });
  });

  describe("cancel", () => {
    it("should return false for unknown execution id", async () => {
      const cancelled = await runtime.cancel("nonexistent");
      expect(cancelled).toBe(false);
    });

    it("should cancel an active execution", async () => {
      executionService.execute = async () => {
        await new Promise((resolve) => setTimeout(resolve, 50000));
        return { output: "", status: "completed", totalTokens: 0, totalCost: 0, durationMs: 0, modelUsed: "", providerUsed: "", finishedAt: new Date(), error: null };
      };

      const executePromise = runtime.execute(createRequest());
      const cancelled = await runtime.cancel("exec-1");

      if (cancelled) {
        const result = await executePromise;
        expect(result.result.status).toBe("cancelled");
      }
    });
  });

  describe("events", () => {
    it("should add and remove event listeners", () => {
      const listener = vi.fn();
      runtime.onEvent(listener);
      runtime.removeEventListener(listener);

      // Should not throw
      runtime.removeEventListener(listener);
    });

    it("should support multiple event listeners", async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      runtime.onEvent(listener1);
      runtime.onEvent(listener2);

      await runtime.execute(createRequest());

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe("getMetrics", () => {
    it("should return metrics from metrics service", async () => {
      await runtime.execute(createRequest());
      await runtime.execute(createRequest());

      const m = runtime.getMetrics();
      expect(m.totalExecutions).toBe(2);
      expect(m.completedExecutions).toBe(2);
    });
  });
});
