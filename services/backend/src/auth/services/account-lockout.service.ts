import { Injectable, Inject } from "@nestjs/common";
import { RedisService } from "../../redis/redis.service.js";

const LOCKOUT_PREFIX = "account_lockout:";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export interface LockoutStatus {
  readonly locked: boolean;
  readonly remainingAttempts: number;
  readonly lockedUntil: Date | null;
}

@Injectable()
export class AccountLockoutService {
  public constructor(
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  public async recordFailedAttempt(identifier: string): Promise<LockoutStatus> {
    const key = `${LOCKOUT_PREFIX}${identifier}`;
    const attempts = await this.redis.incr(key);

    if (attempts === 1) {
      await this.redis.pexpire(key, ATTEMPT_WINDOW_MS);
    }

    if (attempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      await this.redis.hset(`${key}:lock`, {
        locked: "true",
        lockedUntil: lockedUntil.toISOString(),
      });
      await this.redis.pexpire(`${key}:lock`, LOCKOUT_DURATION_MS);

      return {
        locked: true,
        remainingAttempts: 0,
        lockedUntil,
      };
    }

    return {
      locked: false,
      remainingAttempts: MAX_ATTEMPTS - attempts,
      lockedUntil: null,
    };
  }

  public async isLocked(identifier: string): Promise<LockoutStatus> {
    const key = `${LOCKOUT_PREFIX}${identifier}`;
    const lockData = await this.redis.hgetall(`${key}:lock`);

    if (Object.keys(lockData).length > 0) {
      const raw = lockData;
      if (raw["locked"] === "true") {
        const lockedUntil = new Date(raw["lockedUntil"] ?? "");
        if (Date.now() < lockedUntil.getTime()) {
          return {
            locked: true,
            remainingAttempts: 0,
            lockedUntil,
          };
        }
      }
    }

    const attemptCount = await this.redis.get(key);
    const attempts = attemptCount ? Number(attemptCount) : 0;

    return {
      locked: false,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempts),
      lockedUntil: null,
    };
  }

  public async clearFailedAttempts(identifier: string): Promise<void> {
    const key = `${LOCKOUT_PREFIX}${identifier}`;
    await this.redis.del(key);
    await this.redis.del(`${key}:lock`);
  }
}
