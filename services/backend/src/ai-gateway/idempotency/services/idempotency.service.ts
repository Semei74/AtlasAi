import { Inject, Injectable } from "@nestjs/common";
import { RedisService } from "../../../redis/redis.service.js";
import type { IdempotencyConfig, IdempotencyRecord, IdempotencyService } from "../interfaces/idempotency.interface.js";

const DEFAULT_CONFIG: IdempotencyConfig = {
  ttlMs: 3600000,
  keyPrefix: "idempotency:",
};

@Injectable()
export class IdempotencyServiceImpl implements IdempotencyService {
  public readonly config: IdempotencyConfig;

  public constructor(
    @Inject(RedisService) private readonly redis: RedisService,
  ) {
    this.config = { ...DEFAULT_CONFIG };
  }

  public async get(key: string): Promise<IdempotencyRecord | null> {
    const redisKey = this.#buildKey(key);
    const raw = await this.redis.get(redisKey);

    if (raw === null) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as IdempotencyRecord;
      return parsed;
    } catch {
      return null;
    }
  }

  public async set(key: string, result: unknown): Promise<void> {
    const redisKey = this.#buildKey(key);
    const now = new Date();
    const record: IdempotencyRecord = {
      key,
      result,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.config.ttlMs),
    };

    await this.redis.set(redisKey, JSON.stringify(record), "PX", this.config.ttlMs);
  }

  public async exists(key: string): Promise<boolean> {
    const redisKey = this.#buildKey(key);
    const exists = await this.redis.exists(redisKey);
    return exists === 1;
  }

  public async delete(key: string): Promise<void> {
    const redisKey = this.#buildKey(key);
    await this.redis.del(redisKey);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async clearExpired(): Promise<number> {
    return 0;
  }

  #buildKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }
}
