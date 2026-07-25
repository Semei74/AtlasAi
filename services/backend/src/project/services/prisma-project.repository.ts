import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { Prisma } from "../../generated/prisma/client.js";
import type {
  ProjectRepository,
  ProjectFindAllFilter,
  ProjectFindAllResult,
  ProjectWithRelations,
} from "../interfaces/project-repository.interface.js";
import type { Project } from "../interfaces/project.interface.js";

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({ where: { id } });
    if (row === null) return null;
    return this.toDomain(row);
  }

  public async findByOrganizationId(organizationId: string): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  public async findRecentByOrganizationId(organizationId: string, limit: number): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
    return rows.map((r) => this.toDomain(r));
  }

  public async countByOrganizationId(organizationId: string): Promise<number> {
    return this.prisma.project.count({
      where: { organizationId, deletedAt: null },
    });
  }

  public async findAll(filter: ProjectFindAllFilter): Promise<ProjectFindAllResult> {
    const where: Prisma.ProjectWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { description: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    if (filter.status !== undefined) {
      where.status = filter.status as never;
    }

    if (filter.workspaceId) {
      where.workspaceId = filter.workspaceId;
    }

    const orderByField = filter.sort ?? "updatedAt";
    const orderByDir = filter.order ?? "desc";

    const orderBy: Prisma.ProjectOrderByWithRelationInput = {};
    if (orderByField === "name") {
      orderBy.name = orderByDir;
    } else if (orderByField === "createdAt") {
      orderBy.createdAt = orderByDir;
    } else {
      orderBy.updatedAt = orderByDir;
    }

    const skip = (filter.page - 1) * filter.limit;

    const [rows, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy,
        skip,
        take: filter.limit,
        include: {
          owner: { select: { displayName: true, avatarUrl: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items: rows.map((r) => ({
        ...this.toDomain(r),
        ownerDisplayName: r.owner.displayName,
        ownerAvatarUrl: r.owner.avatarUrl,
      })),
      total,
      page: filter.page,
      limit: filter.limit,
    };
  }

  public async findByIdWithDetails(id: string): Promise<ProjectWithRelations | null> {
    const row = await this.prisma.project.findUnique({
      where: { id },
      include: {
        workspace: { select: { name: true } },
        owner: { select: { displayName: true, avatarUrl: true } },
      },
    });

    if (row === null) return null;

    const base = this.toDomain(row);

    return {
      ...base,
      workspaceName: row.workspace.name,
      ownerName: row.owner.displayName,
      ownerAvatarUrl: row.owner.avatarUrl,
    };
  }

  public async create(
    data: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ): Promise<Project> {
    const row = await this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        workspaceId: data.workspaceId,
        organizationId: data.organizationId,
        ownerId: data.ownerId,
      } as never,
    });
    return this.toDomain(row);
  }

  public async update(
    id: string,
    changes: {
      name?: string;
      description?: string | null;
      status?: string;
      deletedAt?: Date | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Project> {
    const client = tx ?? this.prisma;
    const row = await client.project.update({
      where: { id },
      data: {
        ...(changes.name !== undefined && { name: changes.name }),
        ...(changes.description !== undefined && { description: changes.description }),
        ...(changes.status !== undefined && { status: changes.status }),
        ...(changes.deletedAt !== undefined && { deletedAt: changes.deletedAt }),
      } as never,
    });
    return this.toDomain(row);
  }

  public async softDelete(id: string): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  public async archive(id: string, tx?: Prisma.TransactionClient): Promise<Project> {
    const client = tx ?? this.prisma;
    const row = await client.project.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        deletedAt: new Date(),
      },
    });
    return this.toDomain(row);
  }

  public async restore(id: string, tx?: Prisma.TransactionClient): Promise<Project> {
    const client = tx ?? this.prisma;
    const row = await client.project.update({
      where: { id },
      data: {
        status: "ACTIVE",
        deletedAt: null,
      },
    });
    return this.toDomain(row);
  }

  private toDomain(row: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    workspaceId: string;
    organizationId: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      workspaceId: row.workspaceId,
      organizationId: row.organizationId,
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}
