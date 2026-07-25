import type { AgentCapabilities } from "../../interfaces/agent-capabilities.interface.js";
import type { AgentState } from "../../interfaces/agent-state.enum.js";
import type { AgentHealthStatusValue } from "./agent-health.interface.js";

export interface AgentFilter {
  readonly capabilities?: Partial<Record<keyof AgentCapabilities, boolean>>;
  readonly providers?: readonly string[];
  readonly models?: readonly string[];
  readonly tags?: readonly string[];
  readonly organizationId?: string;
  readonly workspaceId?: string;
  readonly enabled?: boolean;
  readonly state?: AgentState;
  readonly version?: string;
  readonly health?: AgentHealthStatusValue;
}
