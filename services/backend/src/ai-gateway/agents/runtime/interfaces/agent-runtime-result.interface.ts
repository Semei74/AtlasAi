import type { AgentRuntimeContext } from "./agent-runtime-context.interface.js";
import type { ExecutionResult } from "./execution-result.interface.js";

export interface AgentRuntimeResult {
  readonly executionId: string;
  readonly context: AgentRuntimeContext;
  readonly result: ExecutionResult;
  readonly durationMs: number;
}
