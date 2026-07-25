export interface ModelCacheConfig {
  readonly ttlMs: number;
  readonly maxEntries: number;
  readonly backgroundRefresh: boolean;
  readonly refreshThresholdMs: number;
  readonly keyPrefix: string;
}

export interface CacheEntry {
  readonly key: string;
  readonly value: unknown;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly accessCount: number;
}

export interface ModelCacheService {
  readonly config: ModelCacheConfig;

  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): ModelCacheStats;
}

export interface ModelCacheStats {
  readonly entries: number;
  readonly hits: number;
  readonly misses: number;
  readonly sets: number;
  readonly evictions: number;
}

export const MODEL_CACHE_SERVICE = "MODEL_CACHE_SERVICE";
