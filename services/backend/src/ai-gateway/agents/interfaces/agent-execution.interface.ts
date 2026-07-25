import type { AgentContext } from "./agent-context.interface.js";

export interface AgentExecutionRequest {
  readonly context: AgentContext;
  readonly model?: string;
  readonly provider?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly stream?: boolean;
}

export interface AgentExecutionStep {
  readonly stepNumber: number;
  readonly action: string;
  readonly input: string;
  readonly output: string;
  readonly durationMs: number;
  readonly tokensUsed: number;
  readonly timestamp: Date;
}
