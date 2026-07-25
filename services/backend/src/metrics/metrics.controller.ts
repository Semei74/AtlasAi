import { Controller, Get, Header, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { MetricsService } from "./metrics.service.js";
import { SkipTenant } from "../tenant/decorators/skip-tenant.decorator.js";
import { SkipAuth } from "../auth/authorization/decorators/skip-auth.decorator.js";

@ApiTags("Metrics")
@Controller()
@SkipTenant()
@SkipAuth()
export class MetricsController {
  public constructor(@Inject(MetricsService) private readonly metricsService: MetricsService) {}

  @Get("/metrics")
  @Header("content-type", "text/plain; charset=utf-8")
  @ApiOperation({ summary: "Expose Prometheus metrics" })
  @ApiResponse({ status: 200, description: "Metrics in Prometheus format" })
  public async metrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
