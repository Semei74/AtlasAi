import type { AgentRegistry } from "../../interfaces/agent-registry.interface.js";
import type { AgentRegistration } from "./agent-registration.interface.js";
import type { AgentDescriptor } from "./agent-descriptor.interface.js";
import type { AgentHealthStatus } from "./agent-health.interface.js";
import type { AgentVersionInfo } from "./agent-version.interface.js";
import type { AgentSearchOptions, AgentSearchResult } from "./agent-search-options.interface.js";
import type { AgentFilter } from "./agent-filter.interface.js";

export const REGISTRY = "REGISTRY";

export interface Registry extends AgentRegistry {
  registerFromRegistration(registration: AgentRegistration): Promise<string>;
  getDescriptor(agentId: string): Promise<AgentDescriptor | null>;
  search(options: AgentSearchOptions): Promise<AgentSearchResult>;
  filter(filter: AgentFilter): Promise<readonly AgentDescriptor[]>;
  getHealth(agentId: string): Promise<AgentHealthStatus>;
  updateHealth(agentId: string, status: Partial<AgentHealthStatus>): Promise<void>;
  getVersionHistory(agentId: string): Promise<readonly AgentVersionInfo[]>;
  getLatestVersion(agentId: string): Promise<AgentVersionInfo | null>;
  deprecateVersion(agentId: string, version: string, message: string): Promise<void>;
  getMetadata(agentId: string): Promise<Readonly<Record<string, unknown>> | null>;
  updateMetadata(agentId: string, metadata: Readonly<Record<string, unknown>>): Promise<void>;
}
