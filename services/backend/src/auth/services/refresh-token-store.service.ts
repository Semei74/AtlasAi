import { Injectable, Inject } from "@nestjs/common";
import type {
  RefreshTokenStore,
  RefreshTokenData,
} from "../jwt/interfaces/refresh-token-store.interface.js";
import { RedisService } from "../../redis/redis.service.js";

const TOKEN_PREFIX = "refresh_token:";
const USER_TOKENS_PREFIX = "user_tokens:";
const TOKEN_FAMILY_PREFIX = "token_family:";

@Injectable()
export class RefreshTokenStoreService implements RefreshTokenStore {
  public constructor(
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  public async save(token: string, userId: string, expiresAt: Date, tokenFamily: string): Promise<void> {
    const multi = this.redis.multi();
    multi.hset(TOKEN_PREFIX + token, {
      userId,
      expiresAt: expiresAt.toISOString(),
      consumed: "false",
      tokenFamily,
    });
    multi.sadd(USER_TOKENS_PREFIX + userId, token);
    multi.sadd(TOKEN_FAMILY_PREFIX + tokenFamily, token);
    multi.expireat(
      TOKEN_PREFIX + token,
      Math.floor(expiresAt.getTime() / 1000),
    );
    await multi.exec();
  }

  public async find(token: string): Promise<RefreshTokenData | null> {
    const data = await this.redis.hgetall(TOKEN_PREFIX + token);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime guard against Redis returning null
    if (!data || Object.keys(data).length === 0) return null;
    const raw = data;
    return {
      userId: raw["userId"] ?? "",
      expiresAt: new Date(raw["expiresAt"] ?? ""),
      consumed: raw["consumed"] === "true",
      tokenFamily: raw["tokenFamily"] ?? "",
      ...(raw["replacedBy"] ? { replacedBy: raw["replacedBy"] } : {}),
    };
  }

  public async markConsumed(token: string, replacedBy?: string): Promise<void> {
    if (replacedBy) {
      await this.redis.hset(TOKEN_PREFIX + token, "consumed", "true", "replacedBy", replacedBy);
    } else {
      await this.redis.hset(TOKEN_PREFIX + token, "consumed", "true");
    }
  }

  public async consume(token: string): Promise<boolean> {
    const key = TOKEN_PREFIX + token;
    await this.redis.watch(key);
    try {
      const current = await this.redis.hget(key, "consumed");
      if (current === "true") {
        return false;
      }
      const multi = this.redis.multi();
      multi.hset(key, "consumed", "true");
      const result = await multi.exec();
      return result !== null;
    } finally {
      await this.redis.unwatch().catch(() => undefined);
    }
  }

  public async invalidateByUser(userId: string): Promise<void> {
    const tokens = await this.redis.smembers(USER_TOKENS_PREFIX + userId);
    if (tokens.length === 0) return;

    const multi = this.redis.multi();
    for (const t of tokens) {
      multi.del(TOKEN_PREFIX + t);
    }
    multi.del(USER_TOKENS_PREFIX + userId);
    await multi.exec();
  }

  public async invalidateFamily(tokenFamily: string): Promise<void> {
    const tokens = await this.redis.smembers(TOKEN_FAMILY_PREFIX + tokenFamily);
    if (tokens.length === 0) return;

    const multi = this.redis.multi();
    for (const t of tokens) {
      multi.del(TOKEN_PREFIX + t);
    }
    multi.del(TOKEN_FAMILY_PREFIX + tokenFamily);
    await multi.exec();
  }
}
