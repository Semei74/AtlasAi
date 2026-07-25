export interface AiProviderSettings {
  readonly enabledProviders: readonly string[];
  readonly blockedProviders: readonly string[];
  readonly defaultProvider: string | null;
  readonly allowedModels: readonly string[];
  readonly blockedModels: readonly string[];
  readonly maxInputTokens: number | null;
  readonly maxOutputTokens: number | null;
  readonly allowImageGeneration: boolean;
  readonly allowAudioGeneration: boolean;
  readonly allowEmbeddings: boolean;
  readonly allowModeration: boolean;
  readonly allowTools: boolean;
  readonly allowMcp: boolean;
  readonly allowRag: boolean;
  readonly allowPromptTemplates: boolean;
  readonly allowConversationMemory: boolean;
  readonly allowStreaming: boolean;
}
