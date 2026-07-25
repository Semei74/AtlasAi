export interface RagConfig {
  readonly defaultTopK: number;
  readonly defaultMinScore: number;
  readonly maxContextTokens: number;
  readonly enableQueryExpansion: boolean;
  readonly enableHybridSearch: boolean;
}
