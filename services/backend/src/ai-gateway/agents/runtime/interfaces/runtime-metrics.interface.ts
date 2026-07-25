export interface RuntimeMetrics {
  readonly totalExecutions: number;
  readonly completedExecutions: number;
  readonly failedExecutions: number;
  readonly cancelledExecutions: number;
  readonly timedOutExecutions: number;
  readonly totalDurationMs: number;
  readonly totalTokensUsed: number;
  readonly totalCost: number;
  readonly averageDurationMs: number;
  readonly averageTokensPerExecution: number;
  readonly activeExecutions: number;
}
