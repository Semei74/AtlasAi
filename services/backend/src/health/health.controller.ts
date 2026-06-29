import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HealthService } from "./health.service.js";
import type { HealthStatus, ReadinessStatus, LivenessStatus } from "./health.service.js";

@ApiTags("Health")
@Controller()
export class HealthController {
  public constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get("/health")
  @ApiOperation({ summary: "Health check" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  public check(): HealthStatus {
    return this.healthService.check();
  }

  @Get("/ready")
  @ApiOperation({ summary: "Readiness check" })
  @ApiResponse({ status: 200, description: "Service is ready" })
  public readiness(): ReadinessStatus {
    return this.healthService.readiness();
  }

  @Get("/live")
  @ApiOperation({ summary: "Liveness check" })
  @ApiResponse({ status: 200, description: "Service is live" })
  public liveness(): LivenessStatus {
    return this.healthService.liveness();
  }
}
