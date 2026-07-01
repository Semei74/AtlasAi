export interface ProviderCapabilities {
  readonly chat: boolean;
  readonly streaming: boolean;
  readonly functionCalling: boolean;
  readonly embeddings: boolean;
  readonly imageGeneration: boolean;
  readonly audioTranscription: boolean;
  readonly maxModels: number;
  readonly supportedModels: readonly string[];
}
