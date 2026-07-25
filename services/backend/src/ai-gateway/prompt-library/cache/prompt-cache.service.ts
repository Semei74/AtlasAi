import { Inject, Injectable } from "@nestjs/common";
import { RedisService } from "../../../redis/redis.service.js";
import { rootLogger } from "@atlas/logger";

export interface PromptCacheConfig {
  readonly versionTtlMs: number;
  readonly renderTtlMs: number;
  readonly categoryTtlMs: number;
  readonly keyPrefix: string;
}

const DEFAULT_CONFIG: PromptCacheConfig = {
  versionTtlMs: 300000,
  renderTtlMs: 60000,
  categoryTtlMs: 600000,
  keyPrefix: "prompt-library:",
};

@Injectable()
export class PromptLibraryCacheService {
  public readonly config: PromptCacheConfig;
  private hits = 0;
  private misses = 0;

  public constructor(
    @Inject(RedisService) private readonly redis: RedisService,
  ) {
    this.config = { ...DEFAULT_CONFIG };
  }

  public async getVersion(versionId: string): Promise<unknown> {
    return this.#get(`version:${versionId}`);
  }

  public async setVersion(versionId: string, data: unknown): Promise<void> {
    await this.#set(`version:${versionId}`, data, this.config.versionTtlMs);
  }

  public async invalidateVersion(versionId: string): Promise<void> {
    await this.#del(`version:${versionId}`);
  }

  public async getRender(promptId: string, version: string, variablesHash: string): Promise<unknown> {
    return this.#get(`render:${promptId}:${version}:${variablesHash}`);
  }

  public async setRender(promptId: string, version: string, variablesHash: string, data: unknown): Promise<void> {
    await this.#set(`render:${promptId}:${version}:${variablesHash}`, data, this.config.renderTtlMs);
  }

  public async invalidateRender(promptId: string): Promise<void> {
    const pattern = `${this.config.keyPrefix}render:${promptId}:*`;
    await this.#delByPattern(pattern);
  }

  public async getCategories(): Promise<unknown> {
    return this.#get("categories");
  }

  public async setCategories(data: unknown): Promise<void> {
    await this.#set("categories", data, this.config.categoryTtlMs);
  }

  public async invalidateCategories(): Promise<void> {
    await this.#del("categories");
  }

  public async invalidatePrompt(promptId: string): Promise<void> {
    await this.#delByPattern(`${this.config.keyPrefix}version:${promptId}:*`);
    await this.invalidateRender(promptId);
  }

  public getStats(): { hits: number; misses: number } {
    return { hits: this.hits, misses: this.misses };
  }

  async #get(key: string): Promise<unknown> {
    const redisKey = `${this.config.keyPrefix}${key}`;

    try {
      const raw = await this.redis.get(redisKey);

      if (raw === null) {
        this.misses++;
        return null;
      }

      this.hits++;
      return JSON.parse(raw) as unknown;
    } catch (error: unknown) {
      this.misses++;
      rootLogger.error("Prompt cache get error", error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  async #set(key: string, data: unknown, ttlMs: number): Promise<void> {
    const redisKey = `${this.config.keyPrefix}${key}`;

    try {
      await this.redis.set(redisKey, JSON.stringify(data), "PX", ttlMs);
    } catch (error: unknown) {
      rootLogger.error("Prompt cache set error", error instanceof Error ? error : new Error(String(error)));
    }
  }

  async #del(key: string): Promise<void> {
    const redisKey = `${this.config.keyPrefix}${key}`;
    await this.redis.del(redisKey);
  }

  async #delByPattern(pattern: string): Promise<void> {
    const stream = this.redis.scanStream({ match: pattern });

    for await (const keys of stream) {
      const keyList = keys as string[];
      if (keyList.length > 0) {
        await this.redis.del(...keyList);
      }
    }
  }
}
