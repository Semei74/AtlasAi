import { Injectable, Inject } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { MetricsService } from "../../metrics/metrics.service.js";
import type { HealthContributor, HealthStatusValue } from "../health-contributor.interface.js";
import { rootLogger } from "@atlas/logger";

@Injectable()
export class DatabaseHealthContributor implements HealthContributor {
  public readonly name = "database";

  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MetricsService) private readonly metrics: MetricsService,
  ) {}

  public async check(): Promise<HealthStatusValue> {
    const endTimer = this.metrics.dbQueryDurationSeconds.startTimer({ operation: "health_check" });

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.metrics.dbQueriesTotal.inc({ operation: "health_check", status: "success" });
      this.metrics.dbConnectionsActive.set(1);
      return "connected";
    } catch (error) {
      this.metrics.dbQueriesTotal.inc({ operation: "health_check", status: "error" });
      this.metrics.dbConnectionsActive.set(0);
      rootLogger.error("Database health check failed", error as Error);
      return "disconnected";
    } finally {
      endTimer();
    }
  }
}
