import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";
import { HEALTH_CONTRIBUTORS } from "./health-contributor.interface.js";
import type { HealthContributor } from "./health-contributor.interface.js";
import { DatabaseHealthContributor } from "./contributors/database-health.contributor.js";
import { RedisHealthContributor } from "./contributors/redis-health.contributor.js";
import { StorageHealthContributor } from "./contributors/storage-health.contributor.js";
import { SearchHealthContributor } from "./contributors/search-health.contributor.js";

@Module({
  controllers: [HealthController],
  providers: [
    DatabaseHealthContributor,
    RedisHealthContributor,
    StorageHealthContributor,
    SearchHealthContributor,
    {
      provide: HEALTH_CONTRIBUTORS,
      useFactory: (
        db: DatabaseHealthContributor,
        redis: RedisHealthContributor,
        storage: StorageHealthContributor,
        search: SearchHealthContributor,
      ): HealthContributor[] => [db, redis, storage, search],
      inject: [
        DatabaseHealthContributor,
        RedisHealthContributor,
        StorageHealthContributor,
        SearchHealthContributor,
      ],
    },
    HealthService,
  ],
  exports: [HealthService],
})
export class HealthModule {}
