import type { AgentCapabilities } from "../../interfaces/agent-capabilities.interface.js";
import type { AgentState } from "../../interfaces/agent-state.enum.js";
import type { AgentHealthStatus } from "./agent-health.interface.js";

export interface AgentDescriptor {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly capabilities: AgentCapabilities;
  readonly enabled: boolean;
  readonly state: AgentState;
  readonly health: AgentHealthStatus;
  readonly tags: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
