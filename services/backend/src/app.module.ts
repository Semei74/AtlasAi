import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "./config/config.module.js";
import { HealthModule } from "./health/health.module.js";
import { MetricsModule } from "./metrics/metrics.module.js";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter.js";
import { ValidationPipeProvider } from "./common/pipes/validation-pipe.provider.js";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware.js";
import { RequestLoggingMiddleware } from "./common/middleware/request-logging.middleware.js";

@Module({
  imports: [ConfigModule, HealthModule, MetricsModule],
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
    consumer.apply(CorrelationIdMiddleware, RequestLoggingMiddleware).forRoutes("*");
  }
}
