import type { AgentDefinition } from "./agent-definition.interface.js";

export const AGENT_REGISTRY = "AGENT_REGISTRY";

export interface AgentRegistry {
  register(definition: AgentDefinition): Promise<void>;
  unregister(agentId: string): Promise<boolean>;
  get(agentId: string): Promise<AgentDefinition | null>;
  exists(agentId: string): Promise<boolean>;
  list(): Promise<readonly AgentDefinition[]>;
  listByCapability(capability: string): Promise<readonly AgentDefinition[]>;
  listByOrganization(organizationId: string): Promise<readonly AgentDefinition[]>;
  listByWorkspace(workspaceId: string): Promise<readonly AgentDefinition[]>;
  findByProvider(provider: string): Promise<readonly AgentDefinition[]>;
  findByModel(model: string): Promise<readonly AgentDefinition[]>;
  enable(agentId: string): Promise<void>;
  disable(agentId: string): Promise<void>;
}
