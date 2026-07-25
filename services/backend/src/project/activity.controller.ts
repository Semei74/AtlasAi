import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { AuthGuard } from "../auth/authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../auth/authorization/guards/auth.guard.js";
import type { RequestWithTenant } from "../tenant/interfaces/request-with-tenant.interface.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ACTIVITY_LOG_REPOSITORY } from "./interfaces/activity-log-repository.interface.js";
import type { ActivityLogRepository } from "./interfaces/activity-log-repository.interface.js";
import { RecentActivityQueryDto } from "./dto/recent-activity-query.dto.js";
import { ActivityEntryDto } from "./dto/activity-entry.dto.js";

@ApiTags("Activity")
@Controller("activity")
export class ActivityController {
  public constructor(
    @Inject(ACTIVITY_LOG_REPOSITORY) private readonly activityLogRepository: ActivityLogRepository,
    private readonly prisma: PrismaService,
  ) {}

  @Get("recent")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List recent activity for the current organization" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: "List of recent activity entries",
    type: [ActivityEntryDto],
  })
  public async findRecent(
    @Query() query: RecentActivityQueryDto,
    @Req() request: FastifyRequest,
  ): Promise<ActivityEntryDto[]> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const tenant = (request as RequestWithTenant).tenant;
    const organizationId: string | undefined = tenant?.organizationId ?? user.organizationId ?? undefined;

    if (organizationId === undefined || organizationId === "") {
      throw new UnauthorizedException("Organization context required");
    }

    const limit = query.limit ?? 10;

    const logs = await this.activityLogRepository.findRecentByOrganizationId(organizationId, limit);

    const actorIds = [...new Set(logs.map((l) => l.actorId))];
    const actors = await this.prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, displayName: true },
    });
    const actorMap = new Map(actors.map((a) => [a.id, a.displayName]));

    return logs.map((log) =>
      ActivityEntryDto.from({
        id: log.id,
        type: log.type,
        actorId: log.actorId,
        description: log.description,
        createdAt: log.createdAt,
        actorDisplayName: actorMap.get(log.actorId) ?? "Unknown",
      }),
    );
  }
}
