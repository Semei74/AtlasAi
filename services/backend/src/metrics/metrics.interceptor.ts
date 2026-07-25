import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, HttpException } from "@nestjs/common";
import { AppError } from "@atlas/errors";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { MetricsService } from "./metrics.service.js";

function getExceptionStatus(error: unknown): number {
  if (error instanceof HttpException) return error.getStatus();
  if (error instanceof AppError) return error.httpStatus;
  return 500;
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  public constructor(@Inject(MetricsService) private readonly metricsService: MetricsService) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<{ method: string; url: string }>();
    const response = httpContext.getResponse<{ statusCode: number }>();
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
          const statusCode = String(response.statusCode);
          endTimer({ status_code: statusCode });
          this.metricsService.httpRequestsTotal.inc({ method, route, status_code: statusCode });
          this.metricsService.activeConnections.dec();
        },
        error: (error: unknown) => {
          const statusCode = String(getExceptionStatus(error));
          endTimer({ status_code: statusCode });
          this.metricsService.httpRequestErrors.inc({ method, route, status_code: statusCode });
          this.metricsService.httpRequestsTotal.inc({ method, route, status_code: statusCode });
          this.metricsService.activeConnections.dec();
        },
      }),
    );
  }
}
