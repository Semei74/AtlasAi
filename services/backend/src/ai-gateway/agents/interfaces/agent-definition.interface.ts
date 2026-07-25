import type { AgentCapabilities } from "./agent-capabilities.interface.js";
import type { AgentState } from "./agent-state.enum.js";

export interface AgentDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly capabilities: AgentCapabilities;
  readonly supportedModels: readonly string[];
  readonly supportedProviders: readonly string[];
  readonly defaultModel: string;
  readonly defaultProvider: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly state: AgentState;
  readonly enabled: boolean;
  readonly tags: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
