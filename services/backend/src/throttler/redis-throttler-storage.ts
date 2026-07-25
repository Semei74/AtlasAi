import { Injectable, Inject } from "@nestjs/common";
import type { ThrottlerStorage } from "@nestjs/throttler";
interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}
import { RedisService } from "../redis/redis.service.js";

const THROTTLE_PREFIX = "throttle:";

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  public constructor(
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  public async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `${THROTTLE_PREFIX}${key}:${throttlerName}`;
    const hits = await this.redis.incr(redisKey);

    if (hits === 1) {
      await this.redis.pexpire(redisKey, ttl);
    }

    const timeToExpire = await this.redis.pttl(redisKey);
    const isBlocked = hits > limit;

    return {
      totalHits: hits,
      timeToExpire: Math.ceil(timeToExpire / 1000),
      isBlocked,
      timeToBlockExpire: isBlocked ? Math.ceil(blockDuration / 1000) : 0,
    };
  }
}
