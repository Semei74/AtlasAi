import { Inject, Injectable } from "@nestjs/common";
import { RedisService } from "../../../redis/redis.service.js";
import { rootLogger } from "@atlas/logger";
import type { CacheEntry, ModelCacheConfig, ModelCacheService, ModelCacheStats } from "../interfaces/model-cache.interface.js";

const DEFAULT_CONFIG: ModelCacheConfig = {
  ttlMs: 300000,
  maxEntries: 10000,
  backgroundRefresh: false,
  refreshThresholdMs: 60000,
  keyPrefix: "model-cache:",
};

@Injectable()
export class ModelCacheServiceImpl implements ModelCacheService {
  public readonly config: ModelCacheConfig;
  private hits = 0;
  private misses = 0;
  private sets = 0;
  private evictions = 0;

  public constructor(
    @Inject(RedisService) private readonly redis: RedisService,
  ) {
    this.config = { ...DEFAULT_CONFIG };
  }

  public async get(key: string): Promise<unknown> {
    const redisKey = this.#buildKey(key);

    try {
      const raw = await this.redis.get(redisKey);

      if (raw === null) {
        this.misses++;
        return null;
      }

      const entry = JSON.parse(raw) as CacheEntry;
      this.hits++;

      if (this.config.backgroundRefresh && entry.accessCount > 0) {
        const remainingTtl = entry.expiresAt.getTime() - Date.now();

        if (remainingTtl < this.config.refreshThresholdMs) {
          void this.#refresh(key, redisKey, entry);
        }
      }

      return entry.value;
    } catch (error: unknown) {
      this.misses++;
      rootLogger.error("Model cache get error", error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  public async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    const redisKey = this.#buildKey(key);
    const ttl = ttlMs ?? this.config.ttlMs;
    const now = new Date();

    const entry: CacheEntry = {
      key,
      value,
      createdAt: now,
      expiresAt: new Date(now.getTime() + ttl),
      accessCount: 0,
    };

    try {
      await this.redis.set(redisKey, JSON.stringify(entry), "PX", ttl);
      this.sets++;
    } catch (error: unknown) {
      rootLogger.error("Model cache set error", error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async delete(key: string): Promise<void> {
    const redisKey = this.#buildKey(key);
    await this.redis.del(redisKey);
  }

  public async exists(key: string): Promise<boolean> {
    const redisKey = this.#buildKey(key);
    const exists = await this.redis.exists(redisKey);
    return exists === 1;
  }

  public async clear(): Promise<void> {
    const stream = this.redis.scanStream({ match: `${this.config.keyPrefix}*` });

    for await (const keys of stream) {
      const keyList = keys as string[];
      if (keyList.length > 0) {
        await this.redis.del(...keyList);
      }
    }

    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.evictions = 0;
  }

  public getStats(): ModelCacheStats {
    return {
      entries: this.sets - this.evictions,
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      evictions: this.evictions,
    };
  }

  async #refresh(_key: string, redisKey: string, entry: CacheEntry): Promise<void> {
    try {
      const remainingTtl = entry.expiresAt.getTime() - Date.now();
      const newTtl = Math.max(remainingTtl + this.config.ttlMs, this.config.ttlMs);

      const refreshed: CacheEntry = {
        ...entry,
        expiresAt: new Date(Date.now() + newTtl),
      };

      await this.redis.set(redisKey, JSON.stringify(refreshed), "PX", newTtl);
    } catch (error: unknown) {
      rootLogger.error("Model cache refresh error", error instanceof Error ? error : new Error(String(error)));
    }
  }

  #buildKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }
}
