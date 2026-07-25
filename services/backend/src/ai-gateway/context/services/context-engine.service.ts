import { Injectable } from "@nestjs/common";
import type { ContextEngine } from "../interfaces/context-engine.interface.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { ContextResult } from "../interfaces/context-result.interface.js";
import type { ContextSource } from "../interfaces/context-source.interface.js";
import type { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextMetrics } from "../interfaces/context-metrics.interface.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import { ContextCollectorService } from "./context-collector.service.js";
import { ContextNormalizerService } from "./context-normalizer.service.js";
import { ContextFilterService } from "./context-filter.service.js";
import { ContextRankerService } from "./context-ranker.service.js";
import { ContextOptimizerService } from "./context-optimizer.service.js";
import { ContextComposerService } from "./context-composer.service.js";
import { ContextCacheService } from "./context-cache.service.js";
import { rootLogger } from "@atlas/logger";

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_CONTEXT_ITEMS = 50;
const MAX_METADATA_KEYS = 20;
const ABSOLUTE_MAX_TOKENS = 100_000;

@Injectable()
export class ContextEngineService implements ContextEngine {
  private buildCount = 0;
  private totalItemsCollected = 0;
  private totalItemsDelivered = 0;
  private totalTokensCollected = 0;
  private totalTokensDelivered = 0;
  private totalBuildTimeMs = 0;
  private truncationCount = 0;
  private timeoutCount = 0;
  private fallbackCount = 0;

  public constructor(
    private readonly collector: ContextCollectorService,
    private readonly normalizer: ContextNormalizerService,
    private readonly filter: ContextFilterService,
    private readonly ranker: ContextRankerService,
    private readonly optimizer: ContextOptimizerService,
    private readonly composer: ContextComposerService,
    private readonly cache: ContextCacheService,
  ) {}

  public async buildContext(request: ContextRequest): Promise<ContextResult> {
    const correlationId = request.metadata?.["correlationId"];
    const logger = correlationId !== undefined
      ? (msg: string, data?: Record<string, unknown>): void => { rootLogger.info(msg, { ...data, correlationId }); }
      : (msg: string, data?: Record<string, unknown>): void => { rootLogger.info(msg, data); };

    logger("Building context", {
      userId: request.userId,
      organizationId: request.organizationId,
      maxTokens: String(request.maxTokens),
    });

    const lockResult = await this.cache.acquireLockWithRetry(
      request.organizationId,
      request.userId,
      request.workspaceId,
      request.conversationId,
      request.query,
    );

    try {
      const cached = await this.cache.get(
        request.organizationId,
        request.userId,
        request.workspaceId,
        request.conversationId,
        request.query,
      );
      if (cached !== null) return cached;

      return await this.#runPipeline(request, logger);
    } finally {
      if (lockResult !== null) {
        await this.cache.releaseLock(
          lockResult.lockId,
          request.organizationId,
          request.userId,
          request.workspaceId,
          request.conversationId,
          request.query,
        );
      }
    }
  }

  async #runPipeline(
    request: ContextRequest,
    log: (msg: string, data?: Record<string, unknown>) => void,
  ): Promise<ContextResult> {
    const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const start = Date.now();

    try {
      const result = await this.#runPipelineWithTimeout(request, timeoutMs, log);
      const totalTime = Date.now() - start;

      this.buildCount++;
      this.totalItemsDelivered += result.items.length;
      this.totalTokensDelivered += result.tokenCount;
      this.totalBuildTimeMs += totalTime;
      if (result.truncated) this.truncationCount++;

      const composedContext = this.composer.compose(result.items);
      const sourceBreakdown = this.composer.computeSourceBreakdown(result.items);

      const finalResult: ContextResult = {
        items: result.items,
        composedContext,
        tokenCount: result.tokenCount,
        sourceBreakdown,
        pipelineTiming: { collectTime: result.collectTime, normalizeTime: result.normalizeTime, filterTime: result.filterTime, rankTime: result.rankTime, optimizeTime: result.optimizeTime, composeTime: result.composeTime, totalTime },
        truncated: result.truncated,
      };

      await this.cache.set(finalResult, request.organizationId, request.userId, request.workspaceId, request.conversationId, request.query);

      return finalResult;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);

      if (errMsg.includes("timeout") || errMsg.includes("abort")) {
        this.timeoutCount++;
        log("Context build timeout, returning fallback", { timeoutMs: String(timeoutMs) });
      } else {
        this.fallbackCount++;
        log("Context build failed, returning fallback", { error: errMsg });
      }

      return this.#buildFallbackContext(request);
    }
  }

  async #runPipelineWithTimeout(
    request: ContextRequest,
    timeoutMs: number,
    _log: (msg: string, data?: Record<string, unknown>) => void,
  ): Promise<{
    items: readonly ContextItem[];
    tokenCount: number;
    truncated: boolean;
    collectTime: number;
    normalizeTime: number;
    filterTime: number;
    rankTime: number;
    optimizeTime: number;
    composeTime: number;
  }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => { controller.abort(); }, timeoutMs);

    try {
      const t0 = Date.now();
      const rawItems = await this.collector.collect(request, request.requiredSources, controller.signal);
      const collectTime = Date.now() - t0;

      this.totalItemsCollected += rawItems.length;

      const limitedItems = rawItems.slice(0, MAX_CONTEXT_ITEMS).map((item) => this.#truncateMetadata(item));

      const t1 = Date.now();
      const normalizedItems = this.normalizer.normalize(limitedItems);
      const normalizeTime = Date.now() - t1;

      const tokensAfterNormalize = normalizedItems.reduce((sum, item) => sum + item.tokenCount, 0);
      this.totalTokensCollected += tokensAfterNormalize;

      const t2 = Date.now();
      const permissionFiltered = this.filter.filter(normalizedItems, request);
      let filterTime = Date.now() - t2;

      const t3 = Date.now();
      const maskedItems = this.filter.maskSensitiveData(permissionFiltered);
      filterTime += Date.now() - t3;

      const t4 = Date.now();
      const rankedItems = this.ranker.rank(maskedItems, request);
      const rankTime = Date.now() - t4;

      const effectiveMaxTokens = Math.min(request.maxTokens, ABSOLUTE_MAX_TOKENS);

      const t5 = Date.now();
      const { items: optimizedItems, truncated } = this.optimizer.optimize(rankedItems, effectiveMaxTokens);
      const optimizeTime = Date.now() - t5;

      const t6 = Date.now();
      const optimizedArr = [...optimizedItems];
      const composeTime = Date.now() - t6;

      const tokenCount = optimizedArr.reduce((sum, item) => sum + item.tokenCount, 0);

      return { items: optimizedArr, tokenCount, truncated, collectTime, normalizeTime, filterTime, rankTime, optimizeTime, composeTime };
    } finally {
      clearTimeout(timeout);
    }
  }

  #truncateMetadata(item: ContextItem): ContextItem {
    const keys = Object.keys(item.metadata);
    if (keys.length <= MAX_METADATA_KEYS) return item;
    const truncated: Record<string, unknown> = {};
    for (let i = 0; i < MAX_METADATA_KEYS; i++) {
      const key = keys[i];
      if (key !== undefined) truncated[key] = (item.metadata as Record<string, unknown>)[key];
    }
    return { ...item, metadata: truncated };
  }

  #buildFallbackContext(_request: ContextRequest): ContextResult {
    const content = "Context engine encountered an issue. Proceeding without additional context.";
    return {
      items: [{
        id: "fallback:context-unavailable",
        sourceType: "system" as ContextSourceType,
        content,
        metadata: { label: "System Notice" },
        tokenCount: Math.ceil(content.length / 4),
        priority: 0,
        score: 0,
        freshness: new Date(),
        permissions: [],
      }],
      composedContext: content,
      tokenCount: Math.ceil(content.length / 4),
      sourceBreakdown: { system: Math.ceil(content.length / 4) },
      pipelineTiming: { collectTime: 0, normalizeTime: 0, filterTime: 0, rankTime: 0, optimizeTime: 0, composeTime: 0, totalTime: 0 },
      truncated: false,
    };
  }

  public registerSource(source: ContextSource): void {
    this.collector.registerSource(source);
  }

  public removeSource(type: ContextSourceType): void {
    this.collector.removeSource(type);
  }

  public getMetrics(): ContextMetrics {
    const cacheMetrics = this.cache.getMetrics();
    const totalCacheOps = cacheMetrics.hits + cacheMetrics.misses;
    return {
      buildCount: this.buildCount,
      totalItemsCollected: this.totalItemsCollected,
      totalItemsDelivered: this.totalItemsDelivered,
      totalTokensCollected: this.totalTokensCollected,
      totalTokensDelivered: this.totalTokensDelivered,
      averageBuildTimeMs: this.buildCount > 0 ? Math.round(this.totalBuildTimeMs / this.buildCount) : 0,
      cacheHitRate: totalCacheOps > 0 ? cacheMetrics.hits / totalCacheOps : 0,
      truncationCount: this.truncationCount,
      timeoutCount: this.timeoutCount,
      fallbackCount: this.fallbackCount,
      cacheHits: cacheMetrics.hits,
      cacheMisses: cacheMetrics.misses,
      stampedePrevented: cacheMetrics.stampedePrevented,
    };
  }
}
