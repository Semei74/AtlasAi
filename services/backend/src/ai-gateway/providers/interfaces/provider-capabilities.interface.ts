export interface ProviderCapabilities {
  readonly chat: boolean;
  readonly streaming: boolean;
  readonly functionCalling: boolean;
  readonly toolCalling: boolean;
  readonly embeddings: boolean;
  readonly imageGeneration: boolean;
  readonly audioGeneration: boolean;
  readonly audioTranscription: boolean;
  readonly moderation: boolean;
  readonly reasoning: boolean;
  readonly mcp: boolean;
  readonly rag: boolean;
  readonly promptTemplates: boolean;
  readonly conversationMemory: boolean;
  readonly maxModels: number;
  readonly supportedModels: readonly string[];
}
