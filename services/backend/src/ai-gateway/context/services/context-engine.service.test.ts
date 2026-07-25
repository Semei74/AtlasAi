import { describe, it, expect, beforeEach, vi } from "vitest";
import { ContextEngineService } from "./context-engine.service.js";
import { ContextCollectorService } from "./context-collector.service.js";
import { ContextNormalizerService } from "./context-normalizer.service.js";
import { ContextFilterService } from "./context-filter.service.js";
import { ContextRankerService } from "./context-ranker.service.js";
import { ContextOptimizerService } from "./context-optimizer.service.js";
import { ContextComposerService } from "./context-composer.service.js";
import type { ContextCacheService } from "./context-cache.service.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextSource } from "../interfaces/context-source.interface.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";

function createSource(type: ContextSourceType, items: ContextItem[]): ContextSource {
  return {
    type,
    name: `Source-${type}`,
    collect: () => Promise.resolve(items),
    isAvailable: () => true,
  };
}

function createItem(overrides?: Partial<ContextItem>): ContextItem {
  return {
    id: "item-1",
    sourceType: ContextSourceType.System,
    content: "test content",
    metadata: {},
    tokenCount: 3,
    priority: 50,
    score: 0,
    freshness: new Date(),
    permissions: [],
    ...overrides,
  };
}

function createMockCache(getImpl?: () => Promise<unknown>): ContextCacheService {
  return {
    get: vi.fn().mockImplementation(getImpl ?? ((): Promise<null> => Promise.resolve(null))),
    set: vi.fn().mockResolvedValue(undefined),
    invalidate: vi.fn().mockResolvedValue(undefined),
    acquireLockWithRetry: vi.fn().mockResolvedValue(null),
    releaseLock: vi.fn().mockResolvedValue(undefined),
    getMetrics: vi.fn().mockReturnValue({ hits: 0, misses: 0, sets: 0, invalidations: 0, stampedePrevented: 0 }),
    acquireLock: vi.fn().mockResolvedValue(null),
  } as unknown as ContextCacheService;
}

describe("ContextEngineService", () => {
  let service: ContextEngineService;
  let collector: ContextCollectorService;
  let cache: ContextCacheService;

  beforeEach(() => {
    collector = new ContextCollectorService();
    const normalizer = new ContextNormalizerService();
    const filter = new ContextFilterService();
    const ranker = new ContextRankerService();
    const optimizer = new ContextOptimizerService();
    const composer = new ContextComposerService();
    cache = createMockCache();

    service = new ContextEngineService(
      collector,
      normalizer,
      filter,
      ranker,
      optimizer,
      composer,
      cache,
    );
  });

  describe("buildContext", () => {
    it("should return composed context from registered sources", async () => {
      service.registerSource(createSource(ContextSourceType.System, [
        createItem({ id: "sys", content: "System info" }),
      ]));
      service.registerSource(createSource(ContextSourceType.User, [
        createItem({ id: "user", content: "User info" }),
      ]));

      const result = await service.buildContext({
        userId: "user-1",
        organizationId: "org-1",
        maxTokens: 1000,
      });

      expect(result.items).toHaveLength(2);
      expect(result.composedContext).toContain("System info");
      expect(result.composedContext).toContain("User info");
      expect(result.tokenCount).toBeGreaterThan(0);
      expect(result.truncated).toBe(false);
      expect(result.pipelineTiming.collectTime).toBeGreaterThanOrEqual(0);
      expect(result.pipelineTiming.totalTime).toBeGreaterThanOrEqual(0);
    });

    it("should respect maxTokens limit", async () => {
      service.registerSource(createSource(ContextSourceType.System, [
        createItem({ id: "big", content: "x".repeat(400), tokenCount: 100, score: 10 }),
        createItem({ id: "small", content: "y".repeat(40), tokenCount: 10, score: 90 }),
      ]));

      const result = await service.buildContext({
        userId: "user-1",
        organizationId: "org-1",
        maxTokens: 50,
      });

      expect(result.tokenCount).toBeLessThanOrEqual(50);
    });

    it("should collect only from specified sources", async () => {
      service.registerSource(createSource(ContextSourceType.System, [
        createItem({ id: "sys", sourceType: ContextSourceType.System }),
      ]));
      service.registerSource(createSource(ContextSourceType.User, [
        createItem({ id: "user", sourceType: ContextSourceType.User }),
      ]));

      const result = await service.buildContext({
        userId: "user-1",
        organizationId: "org-1",
        maxTokens: 1000,
        requiredSources: [ContextSourceType.System],
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe("sys");
    });

    it("should track metrics across builds", async () => {
      service.registerSource(createSource(ContextSourceType.System, [
        createItem({ id: "m1" }),
      ]));

      await service.buildContext({
        userId: "u1", organizationId: "o1", maxTokens: 1000,
      });
      await service.buildContext({
        userId: "u2", organizationId: "o2", maxTokens: 1000,
      });

      const metrics = service.getMetrics();
      expect(metrics.buildCount).toBe(2);
      expect(metrics.totalItemsCollected).toBe(2);
      expect(metrics.totalItemsDelivered).toBe(2);
      expect(metrics.averageBuildTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("should return cached result when available", async () => {
      const cachedResult = {
        items: [],
        composedContext: "cached context",
        tokenCount: 10,
        sourceBreakdown: {},
        pipelineTiming: { collectTime: 0, normalizeTime: 0, filterTime: 0, rankTime: 0, optimizeTime: 0, composeTime: 0, totalTime: 0 },
        truncated: false,
      };
      cache.get = vi.fn().mockResolvedValue(cachedResult);

      const result = await service.buildContext({
        userId: "user-1",
        organizationId: "org-1",
        maxTokens: 1000,
      });

      expect(result).toBe(cachedResult);
      expect(result.composedContext).toBe("cached context");
    });

    it("should cache result after building", async () => {
      service.registerSource(createSource(ContextSourceType.System, [
        createItem({ id: "sys", content: "System info" }),
      ]));

      const result = await service.buildContext({
        userId: "user-1",
        organizationId: "org-1",
        maxTokens: 1000,
      });

      expect(cache.set).toHaveBeenCalledWith(
        result,
        "org-1",
        "user-1",
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe("registerSource / removeSource", () => {
    it("should register and remove sources", () => {
      const source = createSource(ContextSourceType.System, []);
      service.registerSource(source);
      service.removeSource(ContextSourceType.System);
    });
  });

  describe("getMetrics", () => {
    it("should return initial zero metrics", () => {
      const metrics = service.getMetrics();
      expect(metrics.buildCount).toBe(0);
      expect(metrics.averageBuildTimeMs).toBe(0);
      expect(metrics.truncationCount).toBe(0);
    });
  });
});
