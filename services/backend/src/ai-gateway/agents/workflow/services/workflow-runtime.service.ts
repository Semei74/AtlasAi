import { NotFoundError } from "@atlas/errors";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowExecution } from "../interfaces/workflow-execution.interface.js";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { WorkflowEvents } from "../interfaces/workflow-events.interface.js";
import type { WorkflowRuntime, WorkflowRuntimeExecuteOptions } from "../interfaces/workflow-runtime.interface.js";
import type { WorkflowStep } from "../interfaces/workflow-step.interface.js";
import type { WorkflowNodeType } from "../interfaces/workflow-node.interface.js";
import { WorkflowValidatorService } from "./workflow-validator.service.js";
import { WorkflowLimitsService } from "./workflow-limits.service.js";
import { WorkflowPolicyService } from "./workflow-policy.service.js";
import { WorkflowStateService } from "./workflow-state.service.js";

@Injectable()
export class WorkflowRuntimeService implements WorkflowRuntime {
  private readonly executions = new Map<string, WorkflowExecution>();
  private readonly abortControllers = new Map<string, AbortController>();
  private readonly listeners = new Set<(event: WorkflowEvents) => void>();

  public constructor(
    private readonly validator: WorkflowValidatorService,
    private readonly limitsService: WorkflowLimitsService,
    private readonly policy: WorkflowPolicyService,
    private readonly state: WorkflowStateService,
  ) {}

  public async execute(
    definition: WorkflowDefinition,
    options: WorkflowRuntimeExecuteOptions,
  ): Promise<WorkflowExecution> {
    const executionId = randomUUID();

    if (!this.policy.canExecute(definition, options.context)) {
      const failed = this.buildFailedExecution(executionId, definition, options, "Workflow execution not permitted");
      this.emitExecutionFailedEvent(executionId, definition.id, "Workflow execution not permitted");
      return failed;
    }

    const validationResult = await this.validator.validate(definition);
    if (!validationResult.valid) {
      const errorMsg = validationResult.errors.map((e) => e.message).join("; ");
      const failed = this.buildFailedExecution(executionId, definition, options, errorMsg);
      this.emitExecutionFailedEvent(executionId, definition.id, errorMsg);
      return failed;
    }

    const limitsCheck = this.limitsService.validateLimits(definition);
    if (!limitsCheck.valid) {
      const msg = limitsCheck.message ?? "Workflow limits exceeded";
      const failed = this.buildFailedExecution(executionId, definition, options, msg);
      this.emitExecutionFailedEvent(executionId, definition.id, msg);
      return failed;
    }

    const abortController = new AbortController();
    if (options.signal) {
      if (options.signal.aborted) {
        abortController.abort();
      } else {
        options.signal.addEventListener("abort", () => { abortController.abort(); }, { once: true });
      }
    }

    this.abortControllers.set(executionId, abortController);

    const input = options.input ?? options.context.input;
    const execution = this.createExecution(executionId, definition, options, input);
    this.executions.set(executionId, execution);
    this.state.transition(executionId, "running");
    this.executions.set(executionId, { ...execution, status: "running" });

    this.emitEvent({
      executionId,
      timestamp: new Date(),
      type: "executionStarted",
      workflowId: definition.id,
      input,
    });

    const startedAt = Date.now();

    try {
      const updatedExecution = await this.runWorkflow(executionId, definition, abortController.signal, Date.now());
      this.executions.set(executionId, updatedExecution);
      try { this.state.transition(executionId, updatedExecution.status); } catch { /* ignore */ }
      this.abortControllers.delete(executionId);
      this.executions.delete(executionId);

      this.emitEvent({
        executionId,
        timestamp: new Date(),
        type: updatedExecution.status === "completed" ? "executionCompleted" : "executionFailed",
        workflowId: definition.id,
        output: this.getOutput(updatedExecution),
        durationMs: Date.now() - startedAt,
        ...(updatedExecution.error ? { error: updatedExecution.error, stepId: null as string | null } : {}),
      } as WorkflowEvents);

      return updatedExecution;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const failedExecution: WorkflowExecution = {
        ...execution,
        status: "failed",
        error: errorMsg,
        completedAt: new Date(),
        durationMs: Date.now() - startedAt,
      };

      this.executions.set(executionId, failedExecution);
      try { this.state.transition(executionId, "failed"); } catch { /* ignore */ }
      this.abortControllers.delete(executionId);
      this.executions.delete(executionId);

      this.emitEvent({
        executionId,
        timestamp: new Date(),
        type: "executionFailed",
        workflowId: definition.id,
        error: errorMsg,
        stepId: null,
      });

      return failedExecution;
    }
  }

  public cancel(executionId: string): Promise<boolean> {
    const controller = this.abortControllers.get(executionId);
    if (!controller) return Promise.resolve(false);

    controller.abort();
    const execution = this.executions.get(executionId);
    if (execution) {
      const updated = this.buildCanceledExecution(execution);
      this.executions.set(executionId, updated);
      try { this.state.transition(executionId, "cancelled"); } catch { /* ignore */ }
      this.abortControllers.delete(executionId);
      this.executions.delete(executionId);

      this.emitEvent({
        executionId,
        timestamp: new Date(),
        type: "executionCancelled",
        workflowId: updated.workflowId,
      });
    }

    return Promise.resolve(true);
  }

  public pause(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (execution?.status !== "running") return Promise.resolve(false);

    try {
      this.state.transition(executionId, "paused");
    } catch {
      return Promise.resolve(false);
    }

    const updated: WorkflowExecution = { ...execution, status: "paused" };
    this.executions.set(executionId, updated);

    const controller = this.abortControllers.get(executionId);
    if (controller) controller.abort();

    return Promise.resolve(true);
  }

  public async resume(
    executionId: string,
    definition: WorkflowDefinition,
  ): Promise<WorkflowExecution | null> {
    const execution = this.executions.get(executionId);
    if (execution?.status !== "paused") return null;

    const resumeContext: AgentContext = {
      agentId: "",
      userId: execution.userId,
      organizationId: execution.organizationId,
      workspaceId: execution.workspaceId,
      conversationId: null,
      requestId: executionId,
      input: execution.input,
      metadata: {},
    };

    if (!this.policy.canExecute(definition, resumeContext)) return null;

    const abortController = new AbortController();
    this.abortControllers.set(executionId, abortController);

    try {
      this.state.transition(executionId, "running");
    } catch {
      return null;
    }

    this.executions.set(executionId, { ...execution, status: "running" });

    const resumedExecution = await this.runWorkflow(executionId, definition, abortController.signal, Date.now());
    this.executions.set(executionId, resumedExecution);
    try { this.state.transition(executionId, resumedExecution.status); } catch { /* ignore */ }
    this.abortControllers.delete(executionId);
    this.executions.delete(executionId);

    return resumedExecution;
  }

  public getExecution(executionId: string): Promise<WorkflowExecution | null> {
    return Promise.resolve(this.executions.get(executionId) ?? null);
  }

  public getActiveExecutions(): Promise<readonly WorkflowExecution[]> {
    const active = [...this.executions.values()].filter(
      (e) => e.status === "running" || e.status === "pending" || e.status === "paused",
    );
    return Promise.resolve(active);
  }

  public onEvent(listener: (event: WorkflowEvents) => void): void {
    this.listeners.add(listener);
  }

  public removeEventListener(listener: (event: WorkflowEvents) => void): void {
    this.listeners.delete(listener);
  }

  private async runWorkflow(
    executionId: string,
    definition: WorkflowDefinition,
    signal: AbortSignal,
    startedAt: number,
  ): Promise<WorkflowExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) throw new NotFoundError("Execution", executionId);

    const nodeMap = new Map(definition.nodes.map((n) => [n.id, n]));
    const sortedNodes = this.topologicalSort(definition.nodes, definition.edges);
    const steps: WorkflowStep[] = [];
    const variables: Record<string, unknown> = {};

    for (const nodeId of sortedNodes) {
      if (signal.aborted) {
        return this.buildCanceledExecution({ ...execution, steps });
      }

      const node = nodeMap.get(nodeId);
      if (!node) continue;

      const stepId = randomUUID();
      const stepStartedAt = new Date();
      const step: WorkflowStep = {
        id: stepId,
        executionId,
        nodeId: node.id,
        type: node.type,
        status: "running",
        input: "",
        output: "",
        error: null,
        startedAt: stepStartedAt,
        completedAt: null,
        durationMs: 0,
        retryCount: 0,
        metadata: {},
      };

      steps.push(step);
      this.emitEvent({
        executionId,
        timestamp: new Date(),
        type: "stepStarted",
        nodeId: node.id,
        nodeType: node.type,
      });

      const limits = this.limitsService.getLimits(definition);
      const maxRetries = limits.maxRetriesPerStep;
      let stepError: string | null = null;
      let stepOutput = "";
      let stepStatus: "completed" | "failed" | "cancelled" = "completed";

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (this.isAborted(signal)) {
          stepStatus = "cancelled";
          break;
        }

        try {
          stepOutput = await this.executeNode(node.type, node.config, variables);
          if (this.isAborted(signal)) {
            stepStatus = "cancelled";
            break;
          }
          stepStatus = "completed";
          stepError = null;

          this.emitEvent({
            executionId,
            timestamp: new Date(),
            type: "stepCompleted",
            nodeId: node.id,
            nodeType: node.type,
            output: stepOutput,
            durationMs: Date.now() - stepStartedAt.getTime(),
          });

          break;
        } catch (err: unknown) {
          stepError = err instanceof Error ? err.message : String(err);
          if (attempt < maxRetries) continue;
          stepStatus = "failed";

          this.emitEvent({
            executionId,
            timestamp: new Date(),
            type: "stepFailed",
            nodeId: node.id,
            nodeType: node.type,
            error: stepError,
          });
        }
      }

      const completedStep: WorkflowStep = {
        ...step,
        status: stepStatus,
        output: stepOutput,
        error: stepError,
        retryCount: steps.length > 0 ? steps.filter((s) => s.nodeId === node.id).length - 1 : 0,
        completedAt: new Date(),
        durationMs: Date.now() - stepStartedAt.getTime(),
      };

      steps[steps.length - 1] = completedStep;

      if (completedStep.status === "failed") {
        const completedStepsCount = steps.filter((s) => s.status === "completed").length;
        const failedStepsCount = steps.filter((s) => s.status === "failed").length;
        this.emitEvent({
          executionId,
          timestamp: new Date(),
          type: "executionFailed",
          workflowId: definition.id,
          error: stepError ?? "Unknown error",
          stepId: node.id,
        });
        return {
          ...execution,
          status: "failed",
          steps,
          currentNodeId: node.id,
          variables,
          completedAt: new Date(),
          durationMs: Date.now() - startedAt,
          totalSteps: steps.length,
          completedSteps: completedStepsCount,
          failedSteps: failedStepsCount,
          error: stepError ?? "Unknown error",
        };
      }

      if (completedStep.status === "cancelled") {
        return {
          ...execution,
          status: "cancelled",
          steps,
          currentNodeId: node.id,
          variables,
          completedAt: new Date(),
          durationMs: Date.now() - startedAt,
          totalSteps: steps.length,
          completedSteps: steps.filter((s) => s.status === "completed").length,
          failedSteps: steps.filter((s) => s.status === "failed").length,
          error: "Execution was cancelled during step",
        };
      }

      variables[`${node.id}.output`] = stepOutput;
    }

    const completedStepsCount = steps.filter((s) => s.status === "completed").length;
    const failedStepsCount = steps.filter((s) => s.status === "failed").length;
    const cancelledStepsCount = steps.filter((s) => s.status === "cancelled").length;

    const finalStatus = cancelledStepsCount > 0 ? "cancelled"
      : failedStepsCount > 0 ? "failed"
      : "completed";
    const finalError = cancelledStepsCount > 0 ? "Execution was cancelled"
      : failedStepsCount > 0 ? `${String(failedStepsCount)} step(s) failed`
      : null;

    return {
      ...execution,
      status: finalStatus,
      steps,
      currentNodeId: null,
      variables,
      completedAt: new Date(),
      durationMs: Date.now() - startedAt,
      totalSteps: steps.length,
      completedSteps: completedStepsCount,
      failedSteps: failedStepsCount,
      error: finalError,
    };
  }

  private async executeNode(
    type: WorkflowNodeType,
    config: Readonly<Record<string, unknown>>,
    variables: Record<string, unknown>,
  ): Promise<string> {
    switch (type) {
      case "delay": {
        const durationMs = Number(config["durationMs"] ?? 100);
        await this.sleep(durationMs);
        return `delayed ${String(durationMs)}ms`;
      }
      case "condition":
      case "switch": {
        const expression = this.configStr(config, "expression", "true");
        const result = this.evaluateExpression(expression, variables);
        return String(result);
      }
      case "action":
        return `executed action: ${this.configStr(config, "action", "unknown")}`;
      case "ai_prompt":
        return `ai prompt stub: ${this.configStr(config, "prompt", "no prompt")}`;
      case "ai_agent":
        return `ai agent stub: ${this.configStr(config, "agentId", "no agent")}`;
      case "http_request": {
        const url = this.configStr(config, "url", "unknown");
        return `http request stub: ${url}`;
      }
      case "notification":
        return `notification stub: ${this.configStr(config, "channel", "default")}`;
      case "email":
        return `email stub: ${this.configStr(config, "to", "unknown")}`;
      case "document_search":
        return "document search stub";
      case "knowledge_retrieval":
        return "knowledge retrieval stub";
      case "human_approval":
        return "human approval stub: pending";
      case "loop":
        return `loop stub: ${this.configStr(config, "iterations", "unbounded")}`;
      case "custom":
        return `custom stub: ${this.configStr(config, "pluginId", "unknown")}`;
      case "trigger":
        return "trigger executed";
      default:
        return `node executed: ${type as string}`;
    }
  }

  private evaluateExpression(expression: string, variables: Record<string, unknown>): boolean {
    const simpleTrue = expression === "true" || expression === "1";
    if (simpleTrue) return true;

    const varMatch = /^\$\{(\w+(?:\.\w+)*)\}$/.exec(expression);
    if (varMatch) {
      const match = varMatch[1] ?? "";
      const value = this.getVariable(variables, match);
      return value !== null && value !== undefined && value !== false && value !== "";
    }

    return false;
  }

  private getVariable(variables: Record<string, unknown>, path: string): unknown {
    const parts = path.split(".");
    let current: unknown = variables;
    for (const part of parts) {
      if (current === null || current === undefined) return null;
      if (typeof current === "object") {
        current = (current as Record<string, unknown>)[part];
      } else {
        return null;
      }
    }
    return current;
  }

  private topologicalSort(
    nodes: readonly { id: string }[],
    edges: readonly { sourceNodeId: string; targetNodeId: string }[],
  ): string[] {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adj.set(node.id, []);
    }

    for (const edge of edges) {
      const targets = adj.get(edge.sourceNodeId);
      if (targets) targets.push(edge.targetNodeId);
      inDegree.set(edge.targetNodeId, (inDegree.get(edge.targetNodeId) ?? 0) + 1);
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) queue.push(nodeId);
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (nodeId === undefined) break;
      sorted.push(nodeId);
      const targets = adj.get(nodeId) ?? [];
      for (const target of targets) {
        const newDegree = (inDegree.get(target) ?? 1) - 1;
        inDegree.set(target, newDegree);
        if (newDegree === 0) queue.push(target);
      }
    }

    if (sorted.length !== nodes.length) {
      const unsorted = nodes.filter((n) => !sorted.includes(n.id)).map((n) => n.id);
      sorted.push(...unsorted);
    }

    return sorted;
  }

  private createExecution(
    executionId: string,
    definition: WorkflowDefinition,
    options: WorkflowRuntimeExecuteOptions,
    input: string,
  ): WorkflowExecution {
    return {
      id: executionId,
      workflowId: definition.id,
      workflowVersion: definition.version,
      organizationId: options.context.organizationId,
      workspaceId: options.context.workspaceId,
      userId: options.context.userId,
      trigger: options.trigger,
      input,
      status: "pending",
      steps: [],
      currentNodeId: null,
      variables: {},
      startedAt: new Date(),
      completedAt: null,
      durationMs: 0,
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      error: null,
      metadata: options.context.metadata,
    };
  }

  private buildFailedExecution(
    executionId: string,
    definition: WorkflowDefinition,
    options: WorkflowRuntimeExecuteOptions,
    errorMsg: string,
  ): WorkflowExecution {
    return {
      id: executionId,
      workflowId: definition.id,
      workflowVersion: definition.version,
      organizationId: options.context.organizationId,
      workspaceId: options.context.workspaceId,
      userId: options.context.userId,
      trigger: options.trigger,
      input: options.input ?? options.context.input,
      status: "failed",
      steps: [],
      currentNodeId: null,
      variables: {},
      startedAt: new Date(),
      completedAt: new Date(),
      durationMs: 0,
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      error: errorMsg,
      metadata: options.context.metadata,
    };
  }

  private buildCanceledExecution(execution: WorkflowExecution): WorkflowExecution {
    return {
      ...execution,
      status: "cancelled" as const,
      currentNodeId: execution.steps.length > 0
        ? execution.steps[execution.steps.length - 1]?.nodeId ?? null
        : null,
      completedAt: new Date(),
      durationMs: Date.now() - execution.startedAt.getTime(),
      error: "Execution was cancelled",
    };
  }

  private getOutput(execution: WorkflowExecution): string {
    const lastStep = [...execution.steps]
      .reverse()
      .find((s) => s.status === "completed");
    return lastStep?.output ?? "";
  }

  private emitExecutionFailedEvent(executionId: string, workflowId: string, error: string): void {
    this.emitEvent({
      executionId,
      timestamp: new Date(),
      type: "executionFailed",
      workflowId,
      error,
      stepId: null,
    });
  }

  private emitEvent(event: WorkflowEvents): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isAborted(signal: AbortSignal): boolean {
    return signal.aborted;
  }

  private configStr(config: Readonly<Record<string, unknown>>, key: string, fallback: string): string {
    const value = config[key];
    return typeof value === "string" ? value : fallback;
  }
}
