export type WorkflowTriggerType = "manual" | "api" | "schedule" | "webhook" | "event";

export interface WorkflowTrigger {
  readonly id: string;
  readonly type: WorkflowTriggerType;
  readonly config: Readonly<Record<string, unknown>>;
}
