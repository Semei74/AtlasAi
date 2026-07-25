import { Injectable } from "@nestjs/common";
import type { RagEngine, RagQuery, RagResult, RagSource } from "../../providers/interfaces/rag-engine.interface.js";
import { RetrieverService } from "./retriever.service.js";
import { RagRankerService } from "./rag-ranker.service.js";
import { RagContextComposerService } from "./rag-context-composer.service.js";
import type { RagPipelineMetrics } from "../interfaces/rag-metrics.interface.js";
import type { RagConfig } from "../interfaces/rag-config.interface.js";

@Injectable()
export class RagEngineService implements RagEngine {
  private queryCount = 0;
  private totalRetrievalTimeMs = 0;
  private totalRankingTimeMs = 0;
  private totalCompositionTimeMs = 0;
  private totalChunksRetrieved = 0;
  private totalChunksDelivered = 0;

  private readonly sources = new Map<string, RagSource>();

  public constructor(
    private readonly retriever: RetrieverService,
    private readonly ranker: RagRankerService,
    private readonly composer: RagContextComposerService,
    private readonly config: RagConfig,
  ) {}

  public async query(request: RagQuery): Promise<RagResult> {
    const t0 = Date.now();
    const retrieved = await this.retriever.retrieve(
      request.query,
      request.sourceIds,
      request.topK,
      request.minScore,
      request.filter,
    );
    const retrievalTime = Date.now() - t0;

    const t1 = Date.now();
    const ranked = this.ranker.rerank(retrieved, request.query);
    const rankingTime = Date.now() - t1;

    const maxTokens = this.config.maxContextTokens;
    const { context: _, usedChunks, truncated: __ } = this.composer.compose(ranked, maxTokens);

    const totalTime = Date.now() - t0;

    this.queryCount++;
    this.totalRetrievalTimeMs += retrievalTime;
    this.totalRankingTimeMs += rankingTime;
    this.totalCompositionTimeMs += totalTime - retrievalTime - rankingTime;
    this.totalChunksRetrieved += retrieved.length;
    this.totalChunksDelivered += usedChunks.length;

    return {
      chunks: ranked,
      totalChunks: ranked.length,
      queryTimeMs: totalTime,
    };
  }

  public indexSource(source: RagSource): Promise<void> {
    this.sources.set(source.id, source);
    return Promise.resolve();
  }

  public removeSource(sourceId: string): Promise<void> {
    this.sources.delete(sourceId);
    return Promise.resolve();
  }

  public getMetrics(): RagPipelineMetrics {
    return {
      queryCount: this.queryCount,
      totalRetrievalTimeMs: this.totalRetrievalTimeMs,
      totalRankingTimeMs: this.totalRankingTimeMs,
      totalCompositionTimeMs: this.totalCompositionTimeMs,
      averageRetrievalTimeMs: this.queryCount > 0 ? Math.round(this.totalRetrievalTimeMs / this.queryCount) : 0,
      averageRankingTimeMs: this.queryCount > 0 ? Math.round(this.totalRankingTimeMs / this.queryCount) : 0,
      averageCompositionTimeMs: this.queryCount > 0 ? Math.round(this.totalCompositionTimeMs / this.queryCount) : 0,
      totalChunksRetrieved: this.totalChunksRetrieved,
      totalChunksDelivered: this.totalChunksDelivered,
    };
  }
}
