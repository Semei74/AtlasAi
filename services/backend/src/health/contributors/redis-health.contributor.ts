import { Injectable, Inject } from "@nestjs/common";
import { RedisService } from "../../redis/redis.service.js";
import { MetricsService } from "../../metrics/metrics.service.js";
import type { HealthContributor, HealthStatusValue } from "../health-contributor.interface.js";
import { rootLogger } from "@atlas/logger";

@Injectable()
export class RedisHealthContributor implements HealthContributor {
  public readonly name = "redis";

  public constructor(
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(MetricsService) private readonly metrics: MetricsService,
  ) {}

  public async check(): Promise<HealthStatusValue> {
    const endTimer = this.metrics.redisOperationDurationSeconds.startTimer({ operation: "ping" });

    try {
      await this.redis.ping();
      this.metrics.redisOperationsTotal.inc({ operation: "ping" });
      this.metrics.redisConnectionsActive.set(1);
      return "connected";
    } catch (error) {
      this.metrics.redisConnectionsActive.set(0);
      rootLogger.error("Redis health check failed", error as Error);
      return "disconnected";
    } finally {
      endTimer();
    }
  }
}
