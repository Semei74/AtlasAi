import type { ExecutionStatus } from "./workflow-state.interface.js";
import type { WorkflowTriggerType } from "./workflow-trigger.interface.js";
import type { WorkflowStep } from "./workflow-step.interface.js";

export interface WorkflowExecution {
  readonly id: string;
  readonly workflowId: string;
  readonly workflowVersion: string;
  readonly organizationId: string;
  readonly workspaceId: string | null;
  readonly userId: string;
  readonly trigger: WorkflowTriggerType;
  readonly input: string;
  readonly status: ExecutionStatus;
  readonly steps: readonly WorkflowStep[];
  readonly currentNodeId: string | null;
  readonly variables: Readonly<Record<string, unknown>>;
  readonly startedAt: Date;
  readonly completedAt: Date | null;
  readonly durationMs: number;
  readonly totalSteps: number;
  readonly completedSteps: number;
  readonly failedSteps: number;
  readonly error: string | null;
  readonly metadata: Readonly<Record<string, unknown>>;
}
