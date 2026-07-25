export interface WorkflowLimitsConfig {
  readonly maxNodes: number;
  readonly maxDepth: number;
  readonly maxBranches: number;
  readonly maxExecutionDurationMs: number;
  readonly maxSteps: number;
  readonly maxRetriesPerStep: number;
  readonly maxVariables: number;
  readonly maxInputSize: number;
  readonly maxOutputSize: number;
}

export const WORKFLOW_LIMITS = "WORKFLOW_LIMITS";
