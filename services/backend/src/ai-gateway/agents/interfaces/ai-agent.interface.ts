import type { AgentDefinition } from "./agent-definition.interface.js";
import type { AgentPolicy } from "./agent-policy.interface.js";
import type { AgentCapabilities } from "./agent-capabilities.interface.js";
import type { AgentExecutionRequest } from "./agent-execution.interface.js";
import type { AgentResult } from "./agent-result.interface.js";
import type { AgentLifecycleHooks } from "./agent-lifecycle.interface.js";
import type { AgentState } from "./agent-state.enum.js";

export const AI_AGENT = "AI_AGENT";

export interface AiAgent {
  readonly definition: AgentDefinition;
  readonly policy: AgentPolicy;
  readonly lifecycle: AgentLifecycleHooks;
  readonly capabilities: AgentCapabilities;

  execute(request: AgentExecutionRequest): Promise<AgentResult>;
  getState(): Promise<AgentState>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  cancel(): Promise<void>;
}
