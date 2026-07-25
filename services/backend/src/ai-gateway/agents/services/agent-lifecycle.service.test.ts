import { describe, it, expect, beforeEach } from "vitest";
import { AgentLifecycleService } from "./agent-lifecycle.service.js";
import { AgentState } from "../interfaces/agent-state.enum.js";
import type { AgentDefinition } from "../interfaces/agent-definition.interface.js";
import type { AgentExecutionRequest } from "../interfaces/agent-execution.interface.js";
import type { AgentResult } from "../interfaces/agent-result.interface.js";

function createTestDefinition(): AgentDefinition {
  return {
    id: "test-agent",
    name: "Test Agent",
    description: "",
    version: "1.0.0",
    capabilities: {
      reasoning: true, planning: false, toolExecution: false,
      fileAnalysis: false, codeGeneration: false, knowledgeRetrieval: true,
      workflowExecution: false, collaboration: false, memory: false, streaming: false,
    },
    supportedModels: ["gpt-4"],
    supportedProviders: ["stub"],
    defaultModel: "gpt-4",
    defaultProvider: "stub",
    maxConcurrency: 1,
    timeoutMs: 30000,
    maxRetries: 0,
    state: AgentState.Idle,
    enabled: true,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("AgentLifecycleService", () => {
  let service: AgentLifecycleService;

  beforeEach(() => {
    service = new AgentLifecycleService();
  });

  describe("getState", () => {
    it("should return Idle for unregistered agent", async () => {
      const state = await service.getState("unknown");
      expect(state).toBe(AgentState.Idle);
    });
  });

  describe("transition", () => {
    it("should transition from Idle to Initializing", async () => {
      await service.transition("agent-1", AgentState.Initializing);
      expect(await service.getState("agent-1")).toBe(AgentState.Initializing);
    });

    it("should reject invalid transitions", async () => {
      await expect(
        service.transition("agent-1", AgentState.Ready),
      ).rejects.toThrow("Invalid state transition");
    });

    it("should follow valid full lifecycle", async () => {
      await service.transition("agent-1", AgentState.Initializing);
      await service.transition("agent-1", AgentState.Ready);
      await service.transition("agent-1", AgentState.Executing);
      await service.transition("agent-1", AgentState.Completed);
      expect(await service.getState("agent-1")).toBe(AgentState.Completed);
    });

    it("should transition from Failed back to Ready", async () => {
      await service.transition("agent-1", AgentState.Initializing);
      await service.transition("agent-1", AgentState.Failed);
      await service.transition("agent-1", AgentState.Ready);
      expect(await service.getState("agent-1")).toBe(AgentState.Ready);
    });
  });

  describe("validateTransition", () => {
    it("should allow valid transitions", () => {
      expect(service.validateTransition(AgentState.Ready, AgentState.Executing)).toBe(true);
      expect(service.validateTransition(AgentState.Executing, AgentState.Completed)).toBe(true);
      expect(service.validateTransition(AgentState.Executing, AgentState.Failed)).toBe(true);
      expect(service.validateTransition(AgentState.Idle, AgentState.Initializing)).toBe(true);
      expect(service.validateTransition(AgentState.Paused, AgentState.Executing)).toBe(true);
    });

    it("should reject invalid transitions", () => {
      expect(service.validateTransition(AgentState.Idle, AgentState.Executing)).toBe(false);
      expect(service.validateTransition(AgentState.Completed, AgentState.Executing)).toBe(false);
      expect(service.validateTransition(AgentState.Failed, AgentState.Executing)).toBe(false);
      expect(service.validateTransition(AgentState.Ready, AgentState.Idle)).toBe(true);
      expect(service.validateTransition(AgentState.Ready, AgentState.Disabled)).toBe(true);
    });
  });

  describe("lifecycle hooks", () => {
    it("should call onInitialize and transition to Ready", async () => {
      const agent = createTestDefinition();
      await service.onInitialize(agent);
      expect(await service.getState("test-agent")).toBe(AgentState.Ready);
    });

    it("should pass through execution requests", async () => {
      const request: AgentExecutionRequest = {
        context: {
          agentId: "test-agent", userId: "user-1", organizationId: "org-1",
          workspaceId: null, conversationId: null, requestId: "req-1",
          input: "hello", metadata: {},
        },
      };
      const result = await service.onBeforeExecute(request);
      expect(result.context.input).toBe("hello");
    });

    it("should pass through execution results", async () => {
      const result: AgentResult = {
        agentId: "test-agent", executionId: "exec-1",
        context: {
          agentId: "test-agent", userId: "user-1", organizationId: "org-1",
          workspaceId: null, conversationId: null, requestId: "req-1",
          input: "test", metadata: {},
        },
        status: "success", output: "done", steps: [],
        totalDurationMs: 100, totalTokensUsed: 50, totalCost: 0,
        error: null, completedAt: new Date(),
      };
      const passed = await service.onAfterExecute(result);
      expect(passed.status).toBe("success");
    });

    it("should set state to Failed on error", async () => {
      await service.transition("agent-1", AgentState.Initializing);
      await service.transition("agent-1", AgentState.Ready);
      await service.onError("agent-1", new Error("something broke"));
      expect(await service.getState("agent-1")).toBe(AgentState.Failed);
    });

    it("should clean up on dispose", async () => {
      await service.transition("agent-1", AgentState.Initializing);
      await service.transition("agent-1", AgentState.Ready);
      await service.onDispose("agent-1");
      expect(await service.getState("agent-1")).toBe(AgentState.Idle);
    });
  });

  describe("state change listeners", () => {
    it("should notify listeners on state change", async () => {
      const changes: { from: AgentState; to: AgentState }[] = [];
      service.onStateChangeEvent("agent-1", (from, to) => {
        changes.push({ from, to });
      });

      await service.transition("agent-1", AgentState.Initializing);
      await service.transition("agent-1", AgentState.Ready);
      await service.transition("agent-1", AgentState.Executing);

      expect(changes).toHaveLength(3);
      expect(changes[0]).toEqual({ from: AgentState.Idle, to: AgentState.Initializing });
      expect(changes[1]).toEqual({ from: AgentState.Initializing, to: AgentState.Ready });
      expect(changes[2]).toEqual({ from: AgentState.Ready, to: AgentState.Executing });
    });

    it("should allow removing listeners", async () => {
      const calls: number[] = [];
      const listener = (): void => { calls.push(1); };

      service.onStateChangeEvent("agent-1", listener);
      await service.transition("agent-1", AgentState.Initializing);
      expect(calls).toHaveLength(1);

      service.removeStateChangeListener("agent-1", listener);
      await service.transition("agent-1", AgentState.Ready);
      expect(calls).toHaveLength(1);
    });
  });
});
