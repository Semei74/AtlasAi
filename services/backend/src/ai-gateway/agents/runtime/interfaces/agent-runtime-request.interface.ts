import type { AgentRuntimeContext } from "./agent-runtime-context.interface.js";

export interface AgentRuntimeRequest {
  readonly context: AgentRuntimeContext;
  readonly signal?: AbortSignal;
}
