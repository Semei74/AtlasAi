import type { AgentContext } from "./agent-context.interface.js";
import type { AgentExecutionStep } from "./agent-execution.interface.js";

export type AgentResultStatus = "success" | "failure" | "timeout" | "cancelled" | "error";

export interface AgentResult {
  readonly agentId: string;
  readonly executionId: string;
  readonly context: AgentContext;
  readonly status: AgentResultStatus;
  readonly output: string;
  readonly steps: readonly AgentExecutionStep[];
  readonly totalDurationMs: number;
  readonly totalTokensUsed: number;
  readonly totalCost: number;
  readonly error: string | null;
  readonly completedAt: Date;
}
