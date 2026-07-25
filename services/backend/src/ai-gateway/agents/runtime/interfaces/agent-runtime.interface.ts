import type { AgentRuntimeRequest } from "./agent-runtime-request.interface.js";
import type { AgentRuntimeResult } from "./agent-runtime-result.interface.js";
import type { AgentRuntimeState } from "./agent-runtime-state.interface.js";
import type { RuntimeMetrics } from "./runtime-metrics.interface.js";

export const AGENT_RUNTIME = "AGENT_RUNTIME";

export type RuntimeEventListener = (event: unknown) => void;

export interface AgentRuntime {
  execute(request: AgentRuntimeRequest): Promise<AgentRuntimeResult>;
  cancel(executionId: string): Promise<boolean>;
  getState(): AgentRuntimeState;
  getMetrics(): RuntimeMetrics;
  onEvent(listener: RuntimeEventListener): void;
  removeEventListener(listener: RuntimeEventListener): void;
}
