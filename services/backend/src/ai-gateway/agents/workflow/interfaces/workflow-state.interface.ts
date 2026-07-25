export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled" | "paused";

export type WorkflowExecutionStatus = ExecutionStatus;

export const VALID_TRANSITIONS: Record<ExecutionStatus, readonly ExecutionStatus[]> = {
  pending: ["running", "cancelled"],
  running: ["completed", "failed", "cancelled", "paused"],
  paused: ["running", "cancelled"],
  completed: [],
  failed: [],
  cancelled: [],
};
