import { Controller, Get, Req, UseGuards, Inject, UnauthorizedException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { AuthGuard } from "../auth/authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../auth/authorization/guards/auth.guard.js";
import type { RequestWithTenant } from "../tenant/interfaces/request-with-tenant.interface.js";
import { DashboardService } from "./dashboard.service.js";
import { DashboardStatisticsResponseDto } from "./dashboard-statistics-response.dto.js";

@ApiTags("Dashboard")
@Controller("dashboard")
export class DashboardController {
  public constructor(
    @Inject(DashboardService) private readonly dashboardService: DashboardService,
  ) {}

  @Get("statistics")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get dashboard statistics for the current organization" })
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics",
    type: DashboardStatisticsResponseDto,
  })
  public async getStatistics(
    @Req() request: FastifyRequest,
  ): Promise<DashboardStatisticsResponseDto> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const tenant = (request as RequestWithTenant).tenant;
    const organizationId: string | undefined = tenant?.organizationId ?? user.organizationId ?? undefined;

    if (organizationId === undefined || organizationId === "") {
      throw new UnauthorizedException("Organization context required");
    }

    const stats = await this.dashboardService.getStatistics(organizationId, user.sub);

    return DashboardStatisticsResponseDto.from(stats);
  }
}
