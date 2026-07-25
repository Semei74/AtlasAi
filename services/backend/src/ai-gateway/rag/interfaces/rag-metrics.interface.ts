export interface RagPipelineMetrics {
  readonly queryCount: number;
  readonly totalRetrievalTimeMs: number;
  readonly totalRankingTimeMs: number;
  readonly totalCompositionTimeMs: number;
  readonly averageRetrievalTimeMs: number;
  readonly averageRankingTimeMs: number;
  readonly averageCompositionTimeMs: number;
  readonly totalChunksRetrieved: number;
  readonly totalChunksDelivered: number;
}
