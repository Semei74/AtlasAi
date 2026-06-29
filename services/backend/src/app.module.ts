import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "./config/config.module.js";
import { HealthModule } from "./health/health.module.js";
import { MetricsModule } from "./metrics/metrics.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter.js";
import { ValidationPipeProvider } from "./common/pipes/validation-pipe.provider.js";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware.js";
import { RequestLoggingMiddleware } from "./common/middleware/request-logging.middleware.js";
import { SecurityHeadersMiddleware } from "./common/middleware/security-headers.middleware.js";

@Module({
  imports: [ConfigModule, HealthModule, MetricsModule, AuthModule],
  providers: [
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
