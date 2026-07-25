export type EmbeddingType = "text" | "document" | "code" | "image";

export interface EmbeddingRequest {
  readonly input: readonly string[];
  readonly type: EmbeddingType;
  readonly model: string | null;
}

export interface EmbeddingResult {
  readonly embeddings: readonly number[][];
  readonly dimensions: number;
  readonly model: string;
  readonly totalTokens: number;
}

export interface EmbeddingProvider {
  readonly embed: (request: EmbeddingRequest) => Promise<EmbeddingResult>;
  readonly dimensions: number;
  readonly maxBatchSize: number;
}
