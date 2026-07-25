import type { AgentDefinition } from "./agent-definition.interface.js";
import type { AgentState } from "./agent-state.enum.js";
import type { AgentExecutionRequest } from "./agent-execution.interface.js";
import type { AgentResult } from "./agent-result.interface.js";

export interface AgentLifecycleHooks {
  onInitialize(agent: AgentDefinition): Promise<void>;
  onBeforeExecute(request: AgentExecutionRequest): Promise<AgentExecutionRequest>;
  onAfterExecute(result: AgentResult): Promise<AgentResult>;
  onStateChange(agentId: string, from: AgentState, to: AgentState): Promise<void>;
  onError(agentId: string, error: Error): Promise<void>;
  onDispose(agentId: string): Promise<void>;
}
