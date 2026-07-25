import type { AgentCapabilities } from "../../interfaces/agent-capabilities.interface.js";

export interface AgentRegistration {
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
  readonly tags: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
}
