export interface ExecutionLimits {
  readonly timeoutMs: number;
  readonly maxTokens: number;
  readonly maxSteps: number;
  readonly maxRetries: number;
  readonly allowedProviders: readonly string[];
  readonly allowedModels: readonly string[];
  readonly requireHumanApproval: boolean;
}
