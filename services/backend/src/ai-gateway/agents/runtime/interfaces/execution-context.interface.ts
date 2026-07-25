import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentPolicy } from "../../interfaces/agent-policy.interface.js";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { ExecutionLimits } from "./execution-limits.interface.js";

export interface ExecutionContext {
  readonly executionId: string;
  readonly agent: AgentDefinition;
  readonly policy: AgentPolicy;
  readonly context: AgentContext;
  readonly limits: ExecutionLimits;
  readonly signal: AbortSignal;
  readonly startedAt: Date;
}
