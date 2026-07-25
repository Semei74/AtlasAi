import { Injectable, Inject } from "@nestjs/common";
import crypto from "node:crypto";
import { RedisService } from "../../redis/redis.service.js";

const VERIFICATION_PREFIX = "email_verify:";
const VERIFIED_PREFIX = "email_verified:";
const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class EmailVerificationService {
  public constructor(
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  public async generateToken(userId: string, email: string): Promise<string> {
    const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");
    const key = `${VERIFICATION_PREFIX}${token}`;

    await this.redis.hset(key, {
      userId,
      email: email.toLowerCase().trim(),
    });
    await this.redis.pexpire(key, TOKEN_TTL_MS);

    return token;
  }

  public async verifyToken(token: string): Promise<string | null> {
    const key = `${VERIFICATION_PREFIX}${token}`;
    const data = await this.redis.hgetall(key);

    if (Object.keys(data).length === 0) {
      return null;
    }

    const raw = data;
    const userId = raw["userId"] ?? null;

    if (!userId) {
      return null;
    }

    await this.redis.del(key);
    await this.redis.set(`${VERIFIED_PREFIX}${userId}`, "true");

    return userId;
  }

  public async isVerified(userId: string): Promise<boolean> {
    const result = await this.redis.get(`${VERIFIED_PREFIX}${userId}`);
    return result === "true";
  }

  public async markVerified(userId: string): Promise<void> {
    await this.redis.set(`${VERIFIED_PREFIX}${userId}`, "true");
  }

  public async clearVerification(userId: string): Promise<void> {
    await this.redis.del(`${VERIFIED_PREFIX}${userId}`);
  }
}
