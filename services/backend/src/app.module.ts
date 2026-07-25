import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "./config/config.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { RedisModule } from "./redis/redis.module.js";
import { HealthModule } from "./health/health.module.js";
import { MetricsModule } from "./metrics/metrics.module.js";
import { RateLimiterModule } from "./throttler/throttler.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { OrganizationModule } from "./organization/organization.module.js";
import { WorkspaceModule } from "./workspace/workspace.module.js";
import { MembershipModule } from "./membership/membership.module.js";
import { TenantModule } from "./tenant/tenant.module.js";
import { AiGatewayModule } from "./ai-gateway/ai-gateway.module.js";
import { KnowledgeModule } from "./ai-gateway/knowledge/knowledge.module.js";
import { ProjectModule } from "./project/project.module.js";
import { DashboardModule } from "./dashboard/dashboard.module.js";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter.js";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter.js";
import { ValidationPipeProvider } from "./common/pipes/validation-pipe.provider.js";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware.js";
import { RequestLoggingMiddleware } from "./common/middleware/request-logging.middleware.js";
import { SecurityHeadersMiddleware } from "./common/middleware/security-headers.middleware.js";

@Module({
  imports: [ConfigModule, PrismaModule, RedisModule, HealthModule, MetricsModule, RateLimiterModule, AuthModule, OrganizationModule, WorkspaceModule, MembershipModule, TenantModule, AiGatewayModule, KnowledgeModule, ProjectModule, DashboardModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    ValidationPipeProvider,
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SecurityHeadersMiddleware, CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes("*");
  }
}
