import type { WorkflowNodeType } from "./workflow-node.interface.js";

export type WorkflowStepStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "cancelled";

export interface WorkflowStep {
  readonly id: string;
  readonly executionId: string;
  readonly nodeId: string;
  readonly type: WorkflowNodeType;
  readonly status: WorkflowStepStatus;
  readonly input: string;
  readonly output: string;
  readonly error: string | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly durationMs: number;
  readonly retryCount: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}
