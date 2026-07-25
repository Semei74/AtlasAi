import type { WorkflowDefinition } from "./workflow-definition.interface.js";
import type { WorkflowExecution } from "./workflow-execution.interface.js";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { WorkflowTriggerType } from "./workflow-trigger.interface.js";
import type { WorkflowEvents } from "./workflow-events.interface.js";

export interface WorkflowRuntimeExecuteOptions {
  readonly context: AgentContext;
  readonly trigger: WorkflowTriggerType;
  readonly signal?: AbortSignal;
  readonly input?: string;
}

export interface WorkflowRuntime {
  execute(
    definition: WorkflowDefinition,
    options: WorkflowRuntimeExecuteOptions,
  ): Promise<WorkflowExecution>;

  cancel(executionId: string): Promise<boolean>;

  pause(executionId: string): Promise<boolean>;

  resume(
    executionId: string,
    definition: WorkflowDefinition,
  ): Promise<WorkflowExecution | null>;

  getExecution(executionId: string): Promise<WorkflowExecution | null>;

  getActiveExecutions(): Promise<readonly WorkflowExecution[]>;

  onEvent(listener: (event: WorkflowEvents) => void): void;

  removeEventListener(listener: (event: WorkflowEvents) => void): void;
}

export const WORKFLOW_RUNTIME = "WORKFLOW_RUNTIME";
