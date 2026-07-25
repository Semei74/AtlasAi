export interface ModelCapabilities {
  readonly streaming: boolean;
  readonly toolCalling: boolean;
  readonly vision: boolean;
  readonly embeddings: boolean;
  readonly imageGeneration: boolean;
  readonly audio: boolean;
  readonly reasoning: boolean;
  readonly functionCalling: boolean;
  readonly moderation: boolean;
}
