export interface ContextPipelineTiming {
  readonly collectTime: number;
  readonly normalizeTime: number;
  readonly filterTime: number;
  readonly rankTime: number;
  readonly optimizeTime: number;
  readonly composeTime: number;
  readonly totalTime: number;
}

export interface ContextMetrics {
  readonly buildCount: number;
  readonly totalItemsCollected: number;
  readonly totalItemsDelivered: number;
  readonly totalTokensCollected: number;
  readonly totalTokensDelivered: number;
  readonly averageBuildTimeMs: number;
  readonly cacheHitRate: number;
  readonly truncationCount: number;
  readonly timeoutCount: number;
  readonly fallbackCount: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly stampedePrevented: number;
}

export interface ContextSourceMetrics {
  type: string;
  collectCount: number;
  totalItems: number;
  totalCollectTimeMs: number;
  errorCount: number;
  lastCollectTime: Date | null;
}
