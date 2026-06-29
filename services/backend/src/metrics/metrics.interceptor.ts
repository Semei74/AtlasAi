import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from "@nestjs/common";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { MetricsService } from "./metrics.service.js";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  public constructor(@Inject(MetricsService) private readonly metricsService: MetricsService) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<{ method: string; url: string }>();
    const method = request.method;
    const route = request.url;

    this.metricsService.activeConnections.inc();

    const endTimer = this.metricsService.httpRequestDuration.startTimer({
      method,
      route,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          endTimer({ status_code: "200" });
          this.metricsService.httpRequestsTotal.inc({
            method,
            route,
            status_code: "200",
          });
          this.metricsService.activeConnections.dec();
        },
        error: () => {
          endTimer({ status_code: "500" });
          this.metricsService.httpRequestErrors.inc({
            method,
            route,
            status_code: "500",
          });
          this.metricsService.httpRequestsTotal.inc({
            method,
            route,
            status_code: "500",
          });
          this.metricsService.activeConnections.dec();
        },
      }),
    );
  }
}
