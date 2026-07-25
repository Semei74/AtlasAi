export interface ExecutionResult {
  readonly output: string;
  readonly status: "completed" | "cancelled" | "timeout" | "failed";
  readonly totalTokens: number;
  readonly totalCost: number;
  readonly durationMs: number;
  readonly modelUsed: string;
  readonly providerUsed: string;
  readonly finishedAt: Date;
  readonly error: string | null;
}
