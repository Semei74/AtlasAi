import { Injectable, Inject } from "@nestjs/common";
import type { ContextResult } from "../interfaces/context-result.interface.js";
import { RedisService } from "../../../redis/redis.service.js";
import { rootLogger } from "@atlas/logger";
import type { Readable } from "stream";
import { randomUUID } from "node:crypto";

export interface ContextCacheEntry {
  readonly result: ContextResult;
  readonly cachedAt: string;
  readonly ttlSeconds: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  stampedePrevented: number;
}

const DEFAULT_TTL_SECONDS = 300;
const LOCK_TTL_MS = 10_000;
const KEY_PREFIX = "context:";
const LOCK_PREFIX = "lock:context:";
const MAX_STALE_AGE_SECONDS = 3600;

function buildCacheKey(organizationId: string, userId: string, workspaceId?: string, conversationId?: string, query?: string): string {
  const parts = [organizationId, userId];
  if (workspaceId !== undefined) parts.push(`ws:${workspaceId}`);
  if (conversationId !== undefined) parts.push(`conv:${conversationId}`);
  if (query !== undefined && query.length > 0) parts.push(`q:${simpleHash(query)}`);
  return `${KEY_PREFIX}${parts.join(":")}`;
}

function buildLockKey(organizationId: string, userId: string, workspaceId?: string, conversationId?: string, query?: string): string {
  const cacheKey = buildCacheKey(organizationId, userId, workspaceId, conversationId, query);
  return `${LOCK_PREFIX}${cacheKey.slice(KEY_PREFIX.length)}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

@Injectable()
export class ContextCacheService {
  private hits = 0;
  private misses = 0;
  private sets = 0;
  private invalidations = 0;
  private stampedePrevented = 0;

  public constructor(
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  public getMetrics(): CacheMetrics {
    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      invalidations: this.invalidations,
      stampedePrevented: this.stampedePrevented,
    };
  }

  public async get(
    organizationId: string,
    userId: string,
    workspaceId?: string,
    conversationId?: string,
    query?: string,
  ): Promise<ContextResult | null> {
    const key = buildCacheKey(organizationId, userId, workspaceId, conversationId, query);

    try {
      const raw = await this.redis.get(key);
      if (raw === null) {
        this.misses++;
        return null;
      }

      const entry = JSON.parse(raw) as ContextCacheEntry;
      const ageSeconds = (Date.now() - new Date(entry.cachedAt).getTime()) / 1000;

      if (ageSeconds > entry.ttlSeconds && ageSeconds < MAX_STALE_AGE_SECONDS) {
        rootLogger.warn("Serving stale context cache entry", { key, ageSeconds: String(ageSeconds) });
      }

      this.hits++;
      return entry.result;
    } catch (error: unknown) {
      const errObj = error instanceof Error ? { message: error.message } : { message: String(error) };
      rootLogger.warn("Context cache read failed", errObj);
      this.misses++;
      return null;
    }
  }

  public async acquireLock(
    organizationId: string,
    userId: string,
    workspaceId?: string,
    conversationId?: string,
    query?: string,
    ttlMs: number = LOCK_TTL_MS,
  ): Promise<string | null> {
    const lockKey = buildLockKey(organizationId, userId, workspaceId, conversationId, query);
    const lockId = randomUUID();

    try {
      const acquired = await this.redis.set(lockKey, lockId, "PX", ttlMs, "NX" as const);
      if (acquired === "OK") return lockId;
      return null;
    } catch {
      return null;
    }
  }

  public async releaseLock(lockKeyId: string, organizationId: string, userId: string, workspaceId?: string, conversationId?: string, query?: string): Promise<void> {
    const lockKey = buildLockKey(organizationId, userId, workspaceId, conversationId, query);

    try {
      const current = await this.redis.get(lockKey);
      if (current === lockKeyId) {
        await this.redis.del(lockKey);
      }
    } catch {
      // lock will expire via PX anyway
    }
  }

  public async set(
    result: ContextResult,
    organizationId: string,
    userId: string,
    workspaceId?: string,
    conversationId?: string,
    query?: string,
    ttlSeconds: number = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    const key = buildCacheKey(organizationId, userId, workspaceId, conversationId, query);
    const entry: ContextCacheEntry = { result, cachedAt: new Date().toISOString(), ttlSeconds };

    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(entry));
      this.sets++;
    } catch (error: unknown) {
      const errObj = error instanceof Error ? { message: error.message } : { message: String(error) };
      rootLogger.warn("Context cache write failed", errObj);
    }
  }

  public async invalidate(organizationId: string, userId: string): Promise<void> {
    const pattern = `${KEY_PREFIX}${organizationId}:${userId}:*`;

    try {
      const stream = this.redis.scanStream({ match: pattern, count: 100 }) as Readable;
      for await (const keys of stream) {
        const keyList = keys as string[];
        if (keyList.length > 0) {
          await this.redis.del(...keyList);
          this.invalidations += keyList.length;
        }
      }
    } catch (error: unknown) {
      const errObj = error instanceof Error ? { message: error.message } : { message: String(error) };
      rootLogger.warn("Context cache invalidation failed", errObj);
    }
  }

  public async acquireLockWithRetry(
    organizationId: string,
    userId: string,
    workspaceId?: string,
    conversationId?: string,
    query?: string,
    maxRetries = 5,
  ): Promise<{ lockId: string } | null> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const lockId = await this.acquireLock(organizationId, userId, workspaceId, conversationId, query);
      if (lockId !== null) return { lockId };

      await new Promise((resolve) => setTimeout(resolve, 50 * Math.pow(2, attempt)));
    }

    this.stampedePrevented++;
    return null;
  }
}
