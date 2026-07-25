import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentPolicy } from "../../interfaces/agent-policy.interface.js";

export interface AgentRuntimeContext {
  readonly agent: AgentDefinition;
  readonly policy: AgentPolicy;
  readonly organizationId: string;
  readonly workspaceId: string | null;
  readonly userId: string;
  readonly conversationId: string | null;
  readonly input: string;
  readonly model?: string;
  readonly provider?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}
