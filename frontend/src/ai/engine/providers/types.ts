export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepseek'
  | 'ollama'
  | 'openrouter';

export type ProviderStatus = 'available' | 'unavailable' | 'error' | 'configuring';

export type Capability =
  | 'chat'
  | 'streaming'
  | 'vision'
  | 'tools'
  | 'json_mode'
  | 'function_calling'
  | 'embeddings'
  | 'audio'
  | 'image_generation';

export interface ProviderCapabilities {
  chat: boolean;
  streaming: boolean;
  vision: boolean;
  tools: boolean;
  jsonMode: boolean;
  functionCalling: boolean;
  embeddings: boolean;
  audio: boolean;
  imageGeneration: boolean;
  maxContextWindow: number;
  maxOutputTokens: number;
  supportedModels: string[];
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  organization?: string;
  project?: string;
  defaultModel: string;
  timeout: number;
  maxRetries: number;
  extraHeaders?: Record<string, string>;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: ProviderId;
  capabilities: Partial<ProviderCapabilities>;
  contextWindow: number;
  maxTokens: number;
  pricing: {
    input: number;
    output: number;
    currency: string;
  };
  streaming: boolean;
}

export interface ChatRequest {
  model: string;
  messages: ChatRequestMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
  tools?: ToolDefinition[];
  toolChoice?: 'auto' | 'any' | 'none' | { type: 'function'; function: { name: string } };
  responseFormat?: { type: 'text' | 'json_object' };
  metadata?: Record<string, unknown>;
}

export interface ChatRequestMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatResponse {
  id: string;
  model: string;
  provider: ProviderId;
  content: string;
  finishReason: string;
  usage: TokenUsage;
  latency: number;
  toolCalls?: ToolCall[];
}

export interface StreamChunk {
  type: 'delta' | 'done' | 'error';
  content?: string;
  finishReason?: string;
  usage?: TokenUsage;
  latency?: number;
  error?: string;
  toolCalls?: ToolCall[];
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface ProviderHealth {
  status: ProviderStatus;
  latency: number;
  lastChecked: string;
  error?: string;
  models?: string[];
}

export interface EmbeddingRequest {
  input: string | string[];
  model: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: TokenUsage;
}

export interface ProviderStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
  errorRate: number;
  lastRequest: string;
}
