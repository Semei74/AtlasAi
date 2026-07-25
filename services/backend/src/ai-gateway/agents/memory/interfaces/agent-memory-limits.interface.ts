export interface MemoryLimitsConfig {
  readonly maxEntries: number;
  readonly maxTokens: number;
  readonly defaultTtlMs: number | null;
  readonly summarizationThreshold: number;
}

export interface AgentMemoryLimits {
  readonly session: MemoryLimitsConfig;
  readonly conversation: MemoryLimitsConfig;
  readonly workspace: MemoryLimitsConfig;
  readonly longTerm: MemoryLimitsConfig;
  readonly vector: MemoryLimitsConfig;
}

export interface MemoryTokenBudget {
  readonly totalConsumed: number;
  readonly totalBudget: number;
  readonly remaining: number;
  readonly overBudget: boolean;
}

export const MEMORY_LIMITS = "MEMORY_LIMITS";
