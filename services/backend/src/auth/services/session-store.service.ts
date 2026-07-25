import { Injectable, Inject } from "@nestjs/common";
import type { SessionStore } from "../session/interfaces/session-store.interface.js";
import type { Session } from "../session/interfaces/session.interface.js";
import type { DeviceInfo } from "../session/interfaces/device-info.interface.js";

import { RedisService } from "../../redis/redis.service.js";

const SESSION_PREFIX = "session:";
const USER_SESSIONS_PREFIX = "user_sessions:";

@Injectable()
export class SessionStoreService implements SessionStore {
  public constructor(
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  public async save(session: Session): Promise<void> {
    const multi = this.redis.multi();
    multi.hset(SESSION_PREFIX + session.id, {
      id: session.id,
      userId: session.userId,
      deviceInfo: JSON.stringify(session.deviceInfo),
      ipAddress: session.ipAddress,
      refreshTokenHash: session.refreshTokenHash,
      lastActivityAt: session.lastActivityAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      revokedAt: session.revokedAt ? session.revokedAt.toISOString() : "",
    });
    multi.sadd(USER_SESSIONS_PREFIX + session.userId, session.id);
    multi.expireat(
      SESSION_PREFIX + session.id,
      Math.floor(session.expiresAt.getTime() / 1000),
    );
    await multi.exec();
  }

  public async findById(id: string): Promise<Session | null> {
    const data = await this.redis.hgetall(SESSION_PREFIX + id);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime guard against Redis returning null
    if (!data || Object.keys(data).length === 0) return null;
    return this.parseSession(data);
  }

  public async findByUserId(userId: string): Promise<Session[]> {
    const sessionIds = await this.redis.smembers(USER_SESSIONS_PREFIX + userId);
    if (sessionIds.length === 0) return [];

    const pipeline = this.redis.pipeline();
    for (const sid of sessionIds) {
      pipeline.hgetall(SESSION_PREFIX + sid);
    }
    const results = await pipeline.exec();
    if (!results) return [];

    const sessions: Session[] = [];
    for (const [, result] of results) {
      if (result && typeof result === "object" && !Array.isArray(result)) {
        const raw = result as Record<string, string>;
        if (raw["id"]) {
          sessions.push(this.parseSession(raw));
        }
      }
    }
    return sessions;
  }

  public async updateLastActivity(id: string, timestamp: Date): Promise<void> {
    await this.redis.hset(SESSION_PREFIX + id, {
      lastActivityAt: timestamp.toISOString(),
    });
  }

  public async revoke(id: string): Promise<void> {
    const session = await this.findById(id);
    if (!session) return;

    const multi = this.redis.multi();
    multi.hset(SESSION_PREFIX + id, "revokedAt", new Date().toISOString());
    multi.srem(USER_SESSIONS_PREFIX + session.userId, id);
    await multi.exec();
  }

  public async revokeAllByUserId(userId: string, exceptId?: string): Promise<void> {
    const sessionIds = await this.redis.smembers(USER_SESSIONS_PREFIX + userId);
    if (sessionIds.length === 0) return;

    const multi = this.redis.multi();
    for (const sid of sessionIds) {
      if (sid === exceptId) continue;
      multi.hset(SESSION_PREFIX + sid, "revokedAt", new Date().toISOString());
      multi.srem(USER_SESSIONS_PREFIX + userId, sid);
    }
    await multi.exec();
  }

  public async deleteExpired(before: Date): Promise<number> {
    let cursor = "0";
    let deletedCount = 0;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        "MATCH",
        SESSION_PREFIX + "*",
        "COUNT",
        "100",
      );
      cursor = nextCursor;

      for (const key of keys) {
        const data = await this.redis.hgetall(key);
        if (!data["expiresAt"]) continue;
        const expiresAt = new Date(data["expiresAt"]);
        if (expiresAt < before) {
          const sid = key.replace(SESSION_PREFIX, "");
          const userId = data["userId"];
          const multi = this.redis.multi();
          multi.del(key);
          if (userId) {
            multi.srem(USER_SESSIONS_PREFIX + userId, sid);
          }
          await multi.exec();
          deletedCount++;
        }
      }
    } while (cursor !== "0");

    return deletedCount;
  }

  private parseSession(data: Record<string, string>): Session {
    return {
      id: data["id"] ?? "",
      userId: data["userId"] ?? "",
      deviceInfo: JSON.parse(data["deviceInfo"] ?? "{}") as DeviceInfo,
      ipAddress: data["ipAddress"] ?? "",
      refreshTokenHash: data["refreshTokenHash"] ?? "",
      lastActivityAt: new Date(data["lastActivityAt"] ?? ""),
      createdAt: new Date(data["createdAt"] ?? ""),
      expiresAt: new Date(data["expiresAt"] ?? ""),
      revokedAt: data["revokedAt"] ? new Date(data["revokedAt"]) : null,
    };
  }
}
