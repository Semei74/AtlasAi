import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, seconds, ThrottlerGuard } from "@nestjs/throttler";
import { RedisModule } from "../redis/redis.module.js";
import { RedisService } from "../redis/redis.service.js";
import { RedisThrottlerStorage } from "./redis-throttler-storage.js";

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        storage: new RedisThrottlerStorage(redisService),
        skipIf: (context): boolean => {
          const url = context.switchToHttp().getRequest<{ url?: string }>().url ?? "";
          return url === "/health" || url === "/ready" || url === "/live" || url === "/metrics";
        },
        throttlers: [
          {
            name: "default",
            ttl: seconds(60),
            limit: 100,
          },
          {
            name: "login",
            ttl: seconds(60),
            limit: 5,
            blockDuration: seconds(300),
          },
          {
            name: "register",
            ttl: seconds(3600),
            limit: 3,
            blockDuration: seconds(3600),
          },
          {
            name: "passwordReset",
            ttl: seconds(60),
            limit: 3,
            blockDuration: seconds(300),
          },
          {
            name: "refreshToken",
            ttl: seconds(60),
            limit: 10,
            blockDuration: seconds(120),
          },
          {
            name: "aiGateway",
            ttl: seconds(60),
            limit: 30,
            blockDuration: seconds(60),
          },
        ],
        errorMessage: (_: unknown, detail: { limit: number; ttl: number; timeToBlockExpire: number }): string =>
          `Too many requests. Limit: ${String(detail.limit)} per ${String(Math.ceil(detail.ttl / 1000))}s. Retry after ${String(detail.timeToBlockExpire)}s.`,
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class RateLimiterModule {}
