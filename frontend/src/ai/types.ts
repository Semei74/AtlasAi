export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  provider?: string;
  tokens?: TokenUsage;
  finishReason?: string;
  toolCalls?: ToolCall[];
  status: 'sending' | 'sent' | 'streaming' | 'done' | 'error';
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  provider: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  archived: boolean;
  metadata?: ConversationMetadata;
}

export interface ConversationMetadata {
  tokenCount?: number;
  messageCount?: number;
  lastModel?: string;
  duration?: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface ToolCall {
  id: string;
  type: string;
  name: string;
  arguments: string;
  result?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  provider: string;
  content: string;
  finishReason: string;
  usage: TokenUsage;
  latency: number;
}

export interface StreamChunk {
  type: 'delta' | 'done' | 'error';
  content?: string;
  finishReason?: string;
  usage?: TokenUsage;
  latency?: number;
  error?: string;
}

export interface Prompt {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  category?: PromptCategory;
  status: PromptStatus;
  visibility: PromptVisibility;
  tags: string[];
  metadata: Record<string, unknown>;
  currentVersionId: string;
  currentVersion?: PromptVersion;
  ownerId: string;
  favorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptVersion {
  id: string;
  version: number;
  systemTemplate: string;
  userTemplate: string;
  assistantTemplate: string | null;
  variables: string[];
  schema: Record<string, unknown> | null;
  changelog: string;
  createdById: string;
  createdAt: string;
}

export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export type PromptStatus = 'Draft' | 'Published' | 'Archived';
export type PromptVisibility = 'Private' | 'Workspace' | 'Organization' | 'Public';

export interface KnowledgeDocument {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  tags: string[];
  metadata: Record<string, unknown>;
  classification: string | null;
  ownerId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type DocumentStatus = 'Uploading' | 'Processing' | 'Ready' | 'Archived' | 'Failed' | 'Deleted';

export interface KnowledgeFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  documentCount: number;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  status: AgentStatus;
  capabilities: string[];
  model: string;
  provider: string;
  lastActivity?: string;
  latency?: number;
  tokenUsage?: TokenUsage;
}

export type AgentStatus = 'idle' | 'running' | 'error' | 'offline';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  workspaceId: string;
  organizationId: string;
  ownerId: string;
  memberCount?: number;
  aiActivityCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'COMPLETED';

export interface SearchResult {
  id: string;
  type: 'chat' | 'prompt' | 'document' | 'project' | 'agent';
  title: string;
  subtitle?: string;
  matchField?: string;
  updatedAt: string;
}

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  contextWindow: number;
  maxTokens: number;
  pricing: {
    input: number;
    output: number;
  };
  streaming: boolean;
}
