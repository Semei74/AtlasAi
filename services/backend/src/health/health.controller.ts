import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HealthService } from "./health.service.js";
import type { HealthStatus, ReadinessStatus, LivenessStatus } from "./health.service.js";
import { SkipTenant } from "../tenant/decorators/skip-tenant.decorator.js";

@ApiTags("Health")
@Controller()
@SkipTenant()
export class HealthController {
  public constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get("/health")
  @ApiOperation({ summary: "Health check" })
  @ApiResponse({ status: 200, description: "Service is healthy — includes uptime, version, build info" })
  public check(): HealthStatus {
    return this.healthService.check();
  }

  @Get("/ready")
  @ApiOperation({ summary: "Readiness check" })
  @ApiResponse({ status: 200, description: "Service is ready — includes dependency status (database, redis)" })
  @ApiResponse({ status: 503, description: "Service is not ready — one or more dependencies are down" })
  public async readiness(): Promise<ReadinessStatus> {
    return this.healthService.readiness();
  }

  @Get("/live")
  @ApiOperation({ summary: "Liveness check" })
  @ApiResponse({ status: 200, description: "Service is live — includes memory usage" })
  public liveness(): LivenessStatus {
    return this.healthService.liveness();
  }
}
