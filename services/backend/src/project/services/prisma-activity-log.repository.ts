import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { Prisma } from "../../generated/prisma/client.js";
import type { ActivityLogRepository } from "../interfaces/activity-log-repository.interface.js";
import type { ActivityLog } from "../interfaces/activity-log.interface.js";

@Injectable()
export class PrismaActivityLogRepository implements ActivityLogRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async create(
    data: Omit<ActivityLog, "id" | "createdAt">,
    tx?: Prisma.TransactionClient,
  ): Promise<ActivityLog> {
    const client = tx ?? this.prisma;
    const row = await client.activityLog.create({
      data: {
        projectId: data.projectId,
        workspaceId: data.workspaceId,
        organizationId: data.organizationId,
        actorId: data.actorId,
        type: data.type,
        description: data.description,
        metadata: data.metadata ?? {},
      } as never,
    });
    return this.toDomain(row);
  }

  public async findRecentByOrganizationId(
    organizationId: string,
    limit: number,
  ): Promise<ActivityLog[]> {
    const rows = await this.prisma.activityLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((r) => this.toDomain(r));
  }

  private toDomain(row: {
    id: string;
    projectId: string;
    workspaceId: string;
    organizationId: string;
    actorId: string;
    type: string;
    description: string;
    metadata: unknown;
    createdAt: Date;
  }): ActivityLog {
    return {
      id: row.id,
      projectId: row.projectId,
      workspaceId: row.workspaceId,
      organizationId: row.organizationId,
      actorId: row.actorId,
      type: row.type,
      description: row.description,
      metadata: row.metadata,
      createdAt: row.createdAt,
    };
  }
}
