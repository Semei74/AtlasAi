import { describe, it, expect, vi } from "vitest";
import { WorkflowRuntimeService } from "./workflow-runtime.service.js";
import { WorkflowValidatorService } from "./workflow-validator.service.js";
import { WorkflowLimitsService } from "./workflow-limits.service.js";
import { WorkflowPolicyService } from "./workflow-policy.service.js";
import { WorkflowStateService } from "./workflow-state.service.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";

function definition(overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition {
  return {
    id: "wf-1",
    name: "Test Workflow",
    description: "",
    version: "1.0.0",
    status: "published",
    organizationId: "org-1",
    workspaceId: null,
    nodes: [
      { id: "trigger-1", type: "trigger", label: "Trigger", config: {}, position: { x: 0, y: 0 }, metadata: {} },
      { id: "action-1", type: "action", label: "Action", config: { action: "log" }, position: { x: 100, y: 0 }, metadata: {} },
    ],
    edges: [
      { id: "e1", sourceNodeId: "trigger-1", targetNodeId: "action-1", config: {}, metadata: {} },
    ],
    triggers: [],
    timeoutMs: 30000,
    maxConcurrency: 1,
    tags: [],
    metadata: {},
    createdBy: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function context(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    agentId: "agent-1",
    userId: "user-1",
    organizationId: "org-1",
    workspaceId: null,
    conversationId: null,
    requestId: "req-1",
    input: "run",
    metadata: {},
    ...overrides,
  };
}

function createRuntime() {
  const validator = new WorkflowValidatorService();
  const limits = new WorkflowLimitsService();
  const policy = new WorkflowPolicyService();
  const state = new WorkflowStateService();
  const runtime = new WorkflowRuntimeService(validator, limits, policy, state);
  return { runtime, validator, limits, policy, state };
}

function delayDef(ms = 100): WorkflowDefinition {
  return definition({
    nodes: [
      { id: "n1", type: "trigger", label: "Trigger", config: {}, position: { x: 0, y: 0 }, metadata: {} },
      { id: "n2", type: "delay", label: "Delay", config: { durationMs: ms }, position: { x: 100, y: 0 }, metadata: {} },
    ],
    edges: [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n2", config: {}, metadata: {} }],
  });
}

describe("WorkflowRuntimeService", () => {
  describe("execute", () => {
    it("should execute a valid workflow and return completed execution", async () => {
      const { runtime } = createRuntime();
      const ctx = context();
      const result = await runtime.execute(definition(), { context: ctx, trigger: "manual" });

      expect(result.status).toBe("completed");
      expect(result.id).toBeDefined();
      expect(result.workflowId).toBe("wf-1");
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.completedSteps).toBeGreaterThan(0);
    });

    it("should return failed execution for invalid workflow", async () => {
      const { runtime } = createRuntime();
      const ctx = context();
      const invalidDef = { ...definition(), id: "", name: "" };
      const result = await runtime.execute(invalidDef, { context: ctx, trigger: "manual" });

      expect(result.status).toBe("failed");
      expect(result.error).toBeDefined();
    });

    it("should return failed execution when policy denies", async () => {
      const { runtime } = createRuntime();
      const ctx = context({ organizationId: "org-2" });
      const result = await runtime.execute(definition(), { context: ctx, trigger: "manual" });

      expect(result.status).toBe("failed");
      expect(result.error).toContain("not permitted");
    });

    it("should return failed when limits exceeded", async () => {
      const { runtime, limits } = createRuntime();
      limits.setCustomLimits("wf-1", { maxNodes: 1 });
      const bigDef = definition({
        nodes: [
          { id: "n1", type: "trigger", label: "Trigger", config: {}, position: { x: 0, y: 0 }, metadata: {} },
          { id: "n2", type: "action", label: "Action", config: {}, position: { x: 100, y: 0 }, metadata: {} },
        ],
        edges: [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n2", config: {}, metadata: {} }],
      });
      const ctx = context();
      const result = await runtime.execute(bigDef, { context: ctx, trigger: "manual" });

      expect(result.status).toBe("failed");
      expect(result.error).toContain("exceed limit");
    });

    it("should handle single node workflow", async () => {
      const { runtime } = createRuntime();
      const ctx = context();
      const singleDef = definition({
        nodes: [{ id: "n1", type: "trigger", label: "Trigger", config: {}, position: { x: 0, y: 0 }, metadata: {} }],
        edges: [],
      });
      const result = await runtime.execute(singleDef, { context: ctx, trigger: "manual" });
      expect(result.status).toBe("completed");
      expect(result.steps).toHaveLength(1);
    });

    it("should populate all execution fields", async () => {
      const { runtime } = createRuntime();
      const ctx = context();
      const result = await runtime.execute(definition(), { context: ctx, trigger: "manual" });

      expect(result.id).toBeTruthy();
      expect(result.organizationId).toBe("org-1");
      expect(result.userId).toBe("user-1");
      expect(result.trigger).toBe("manual");
      expect(result.input).toBe("run");
      expect(result.startedAt).toBeInstanceOf(Date);
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(result.totalSteps).toBeGreaterThan(0);
    });
  });

  describe("cancel", () => {
    it("should cancel a running execution", async () => {
      const { runtime } = createRuntime();
      const ctx = context();

      let capturedId: string;
      runtime.onEvent((e) => { if (e.type === "executionStarted") capturedId = e.executionId; });

      const execPromise = runtime.execute(delayDef(200), { context: ctx, trigger: "manual" });

      await vi.waitFor(() => { if (!capturedId!) throw new Error(); }, { timeout: 1000 });

      const cancelled = await runtime.cancel(capturedId!);
      expect(cancelled).toBe(true);

      const result = await execPromise;
      expect(result.status).toBe("cancelled");
    });

    it("should return false for unknown execution", async () => {
      const { runtime } = createRuntime();
      const result = await runtime.cancel("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("pause / resume", () => {
    it("should pause a running execution", async () => {
      const { runtime } = createRuntime();
      const ctx = context();

      let capturedId: string;
      runtime.onEvent((e) => { if (e.type === "executionStarted") capturedId = e.executionId; });

      const execPromise = runtime.execute(delayDef(200), { context: ctx, trigger: "manual" });

      await vi.waitFor(() => { if (!capturedId!) throw new Error(); }, { timeout: 1000 });

      const paused = await runtime.pause(capturedId!);
      expect(paused).toBe(true);

      const exe = await runtime.getExecution(capturedId!);
      expect(exe!.status).toBe("paused");

      await execPromise.catch(() => {});
    });

    it("should return false when pausing unknown execution", async () => {
      const { runtime } = createRuntime();
      expect(await runtime.pause("nonexistent")).toBe(false);
    });

    it("should resume a paused execution", async () => {
      const { runtime } = createRuntime();
      const def = delayDef(100);
      const ctx = context();

      let capturedId: string;
      runtime.onEvent((e) => { if (e.type === "executionStarted") capturedId = e.executionId; });

      const execPromise = runtime.execute(def, { context: ctx, trigger: "manual" });

      await vi.waitFor(() => { if (!capturedId!) throw new Error(); }, { timeout: 1000 });
      await runtime.pause(capturedId!);

      const resumed = await runtime.resume(capturedId!, def);
      expect(resumed).not.toBeNull();
      expect(resumed!.status).toBe("completed");

      await execPromise.catch(() => {});
    });

    it("should return null when resuming unknown execution", async () => {
      const { runtime } = createRuntime();
      const result = await runtime.resume("nonexistent", definition());
      expect(result).toBeNull();
    });
  });

  describe("getExecution", () => {
    it("should return null for unknown execution", async () => {
      const { runtime } = createRuntime();
      expect(await runtime.getExecution("nonexistent")).toBeNull();
    });
  });

  describe("getActiveExecutions", () => {
    it("should return active executions", async () => {
      const { runtime } = createRuntime();
      const ctx = context();

      let capturedId: string;
      runtime.onEvent((e) => { if (e.type === "executionStarted") capturedId = e.executionId; });

      const execPromise = runtime.execute(delayDef(200), { context: ctx, trigger: "manual" });

      await vi.waitFor(() => { if (!capturedId!) throw new Error(); }, { timeout: 1000 });

      const active = await runtime.getActiveExecutions();
      expect(active.length).toBeGreaterThanOrEqual(1);

      await runtime.cancel(capturedId!);
      await execPromise.catch(() => {});
    });
  });

  describe("events", () => {
    it("should emit events during execution", async () => {
      const { runtime } = createRuntime();
      const events: string[] = [];
      runtime.onEvent((event) => events.push(event.type));

      const ctx = context();
      await runtime.execute(definition(), { context: ctx, trigger: "manual" });

      expect(events).toContain("executionStarted");
      expect(events).toContain("stepStarted");
      expect(events).toContain("stepCompleted");
      expect(events).toContain("executionCompleted");
    });

    it("should allow removing event listeners", async () => {
      const { runtime } = createRuntime();
      const events: string[] = [];
      const listener = (event: { type: string }) => { events.push(event.type); };
      runtime.onEvent(listener);
      runtime.removeEventListener(listener);

      const ctx = context();
      await runtime.execute(definition(), { context: ctx, trigger: "manual" });

      expect(events).toHaveLength(0);
    });

    it("should emit executionFailed on error", async () => {
      const { runtime } = createRuntime();
      const events: string[] = [];
      runtime.onEvent((event) => events.push(event.type));

      const ctx = context({ organizationId: "org-2" });
      await runtime.execute(definition(), { context: ctx, trigger: "manual" });

      expect(events).toContain("executionFailed");
    });
  });

  describe("DAG execution order", () => {
    it("should execute nodes in topological order", async () => {
      const { runtime } = createRuntime();
      const ctx = context();
      const def = definition({
        nodes: [
          { id: "a", type: "action", label: "Action A", config: { action: "A" }, position: { x: 0, y: 0 }, metadata: {} },
          { id: "b", type: "action", label: "Action B", config: { action: "B" }, position: { x: 100, y: 0 }, metadata: {} },
          { id: "c", type: "trigger", label: "Trigger", config: {}, position: { x: 0, y: 100 }, metadata: {} },
        ],
        edges: [
          { id: "e1", sourceNodeId: "c", targetNodeId: "a", config: {}, metadata: {} },
          { id: "e2", sourceNodeId: "a", targetNodeId: "b", config: {}, metadata: {} },
        ],
      });
      const result = await runtime.execute(def, { context: ctx, trigger: "manual" });
      expect(result.status).toBe("completed");
      expect(result.steps[0]?.nodeId).toBe("c");
      expect(result.steps[1]?.nodeId).toBe("a");
      expect(result.steps[2]?.nodeId).toBe("b");
    });
  });

  describe("cancellation via AbortController", () => {
    it("should abort execution when signal is pre-aborted", async () => {
      const { runtime } = createRuntime();
      const abortController = new AbortController();
      abortController.abort();
      const ctx = context();
      const result = await runtime.execute(definition(), {
        context: ctx,
        trigger: "manual",
        signal: abortController.signal,
      });
      expect(result.status).toBe("cancelled");
    });

    it("should abort when signal is aborted mid-execution", async () => {
      const { runtime } = createRuntime();
      const ctx = context();
      const abortController = new AbortController();

      const execPromise = runtime.execute(
        delayDef(500),
        { context: ctx, trigger: "manual", signal: abortController.signal },
      );

      setTimeout(() => { abortController.abort(); }, 50);

      const result = await execPromise;
      expect(result.status).toBe("cancelled");
    });
  });
});
