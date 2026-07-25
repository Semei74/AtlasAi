import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Redis } from "ioredis";
import { rootLogger } from "@atlas/logger";

export interface RedisConfig {
  readonly host: string;
  readonly port: number;
  readonly password?: string;
  readonly db: number;
  readonly keyPrefix: string;
}

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  public constructor() {
    const config = {
      host: process.env["REDIS_HOST"] ?? "localhost",
      port: process.env["REDIS_PORT"] ? Number(process.env["REDIS_PORT"]) : 6379,
      password: process.env["REDIS_PASSWORD"],
      db: 0,
      keyPrefix: "atlas:",
    };

    super({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      keyPrefix: config.keyPrefix,
      retryStrategy: (times: number): number | null => {
        const delay = Math.min(times * 100, 3000);
        rootLogger.warn("Redis reconnecting", { attempt: times, delay: String(delay) });
        return delay;
      },
      lazyConnect: true,
    });
  }

  public async onModuleInit(): Promise<void> {
    this.on("connect", () => {
      rootLogger.info("Connected to Redis");
    });
    this.on("error", (error: Error) => {
      rootLogger.error("Redis connection error", error);
    });
    await this.connect();
  }

  public async onModuleDestroy(): Promise<void> {
    await this.quit();
    rootLogger.info("Disconnected from Redis");
  }
}
