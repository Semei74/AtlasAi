import type { AgentCapabilities } from "../../interfaces/agent-capabilities.interface.js";

export type AgentRuntimeOptions = Record<string, unknown>;

export interface AgentContext {
  agentId: string;
  userId: string;
  organizationId: string;
  workspaceId?: string;
  conversationId?: string;
  executionId: string;
  version?: string;
  promptVersion?: string;
  description?: string;
  provider: string;
  model?: string;
  temperature?: number;
  maxTokens: number;
  maxMemory?: number;
  input?: string;
  variables: Record<string, string>;
  capabilities: AgentCapabilities;
  context?: Record<string, unknown>;
  options?: AgentRuntimeOptions;
  metadata?: Record<string, unknown>;
}
