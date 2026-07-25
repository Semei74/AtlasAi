import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PROJECT_REPOSITORY } from "./interfaces/project-repository.interface.js";
import type {
  ProjectRepository,
  ProjectFindAllFilter,
} from "./interfaces/project-repository.interface.js";
import { ACTIVITY_LOG_REPOSITORY } from "./interfaces/activity-log-repository.interface.js";
import type { ActivityLogRepository } from "./interfaces/activity-log-repository.interface.js";
import { MEMBERSHIP_REPOSITORY } from "../membership/interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../membership/interfaces/membership-repository.interface.js";
import { MembershipStatus } from "../membership/interfaces/membership-status.enum.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma } from "../generated/prisma/client.js";
import { ProjectStatus } from "../generated/prisma/enums.js";
import type { Project } from "./interfaces/project.interface.js";
import type { CreateProjectDto } from "./dto/create-project.dto.js";
import type { UpdateProjectDto } from "./dto/update-project.dto.js";
import type { ProjectListQueryDto } from "./dto/project-list-query.dto.js";
import { ProjectResponseDto, ProjectOwnerDto } from "./dto/project-response.dto.js";
import { ProjectListResponseDto } from "./dto/project-list-response.dto.js";
import { ProjectDetailResponseDto } from "./dto/project-detail-response.dto.js";

@Injectable()
export class ProjectService {
  public constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(ACTIVITY_LOG_REPOSITORY) private readonly activityLogRepository: ActivityLogRepository,
    @Inject(MEMBERSHIP_REPOSITORY) private readonly membershipRepository: MembershipRepository,
    private readonly prisma: PrismaService,
  ) {}

  public async create(
    dto: CreateProjectDto,
    organizationId: string,
    userId: string,
  ): Promise<ProjectResponseDto> {
    await this.ensureMember(organizationId, userId);

    const project = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const p = await tx.project.create({
        data: {
          name: dto.name,
          description: dto.description ?? null,
          status: ProjectStatus.DRAFT,
          workspaceId: dto.workspaceId,
          organizationId,
          ownerId: userId,
        } as never,
      });

      await tx.activityLog.create({
        data: {
          projectId: p.id,
          workspaceId: dto.workspaceId,
          organizationId,
          actorId: userId,
          type: "CREATED",
          description: `Project "${p.name}" created`,
          metadata: {},
        } as never,
      });

      return p;
    });

    const projectDomain: Project = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      workspaceId: project.workspaceId,
      organizationId: project.organizationId,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      deletedAt: project.deletedAt,
    };

    return this.toResponse(projectDomain);
  }

  public async findAll(
    organizationId: string,
    userId: string,
  ): Promise<ProjectResponseDto[]> {
    await this.ensureMember(organizationId, userId);

    const result = await this.projectRepository.findAll({
      organizationId,
      search: undefined,
      status: undefined,
      workspaceId: undefined,
      sort: undefined,
      order: undefined,
      page: 1,
      limit: 100,
    });

    return result.items.map((p) =>
      ProjectResponseDto.from(p, ProjectOwnerDto.from({
        id: p.ownerId,
        displayName: p.ownerDisplayName,
        avatarUrl: p.ownerAvatarUrl,
      })),
    );
  }

  public async findRecent(
    organizationId: string,
    userId: string,
    limit: number,
  ): Promise<ProjectResponseDto[]> {
    await this.ensureMember(organizationId, userId);

    const result = await this.projectRepository.findAll({
      organizationId,
      search: undefined,
      status: undefined,
      workspaceId: undefined,
      sort: "updatedAt",
      order: "desc",
      page: 1,
      limit,
    });

    return result.items.map((p) =>
      ProjectResponseDto.from(p, ProjectOwnerDto.from({
        id: p.ownerId,
        displayName: p.ownerDisplayName,
        avatarUrl: p.ownerAvatarUrl,
      })),
    );
  }

  public async findById(
    id: string,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findById(id);

    if (project === null) {
      throw new NotFoundException("Project not found");
    }

    await this.ensureMember(project.organizationId, userId);

    return this.toResponse(project);
  }

  public async findAllPaginated(
    query: ProjectListQueryDto,
    organizationId: string,
    userId: string,
  ): Promise<ProjectListResponseDto> {
    await this.ensureMember(organizationId, userId);

    const filter: ProjectFindAllFilter = {
      organizationId,
      search: query.search,
      status: query.status,
      workspaceId: query.workspaceId,
      sort: query.sort,
      order: query.order,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };

    const result = await this.projectRepository.findAll(filter);

    const items: ProjectResponseDto[] = result.items.map((p) =>
      ProjectResponseDto.from(p, ProjectOwnerDto.from({
        id: p.ownerId,
        displayName: p.ownerDisplayName,
        avatarUrl: p.ownerAvatarUrl,
      })),
    );

    return ProjectListResponseDto.from({
      items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  }

  public async findByIdDetail(
    id: string,
    userId: string,
  ): Promise<ProjectDetailResponseDto> {
    const project = await this.projectRepository.findByIdWithDetails(id);

    if (project === null) {
      throw new NotFoundException("Project not found");
    }

    await this.ensureMember(project.organizationId, userId);

    const owner = ProjectOwnerDto.from({
      id: project.ownerId,
      displayName: project.ownerName ?? "Unknown",
      avatarUrl: project.ownerAvatarUrl,
    });

    const logs = await this.prisma.activityLog.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        actor: { select: { displayName: true } },
      },
    });

    return ProjectDetailResponseDto.from({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      workspaceId: project.workspaceId,
      workspaceName: project.workspaceName ?? "Unknown",
      organizationId: project.organizationId,
      owner,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      deletedAt: project.deletedAt,
      activityLogs: logs.map((l) => ({
        id: l.id,
        type: l.type,
        description: l.description,
        actor: { displayName: l.actor.displayName },
        createdAt: l.createdAt,
      })),
    });
  }

  public async update(
    id: string,
    dto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findById(id);

    if (project === null) {
      throw new NotFoundException("Project not found");
    }

    await this.ensureMember(project.organizationId, userId);

    const previousStatus = project.status;
    const incomingStatus: string | undefined = dto.status;

    const updated = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const up = await this.projectRepository.update(id, {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(incomingStatus !== undefined && { status: incomingStatus }),
      }, tx);

      if (incomingStatus !== undefined && incomingStatus !== previousStatus) {
        const transitioningToArchived = incomingStatus === ProjectStatus.ARCHIVED;
        const activityType = transitioningToArchived ? "ARCHIVED" : "RESTORED";

        await this.activityLogRepository.create({
          projectId: id,
          workspaceId: project.workspaceId,
          organizationId: project.organizationId,
          actorId: userId,
          type: activityType,
          description: `Project "${up.name}" status changed from ${previousStatus} to ${incomingStatus}`,
          metadata: { from: previousStatus, to: incomingStatus },
        }, tx);
      } else {
        await this.activityLogRepository.create({
          projectId: id,
          workspaceId: project.workspaceId,
          organizationId: project.organizationId,
          actorId: userId,
          type: "UPDATED",
          description: `Project "${up.name}" updated`,
          metadata: {},
        }, tx);
      }

      return up;
    });

    return this.toResponse(updated);
  }

  public async archive(
    id: string,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findById(id);

    if (project === null) {
      throw new NotFoundException("Project not found");
    }

    await this.ensureMember(project.organizationId, userId);

    if (project.status === "ARCHIVED") {
      throw new ForbiddenException("Project is already archived");
    }

    const archived = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const a = await this.projectRepository.archive(id, tx);

      await this.activityLogRepository.create({
        projectId: id,
        workspaceId: project.workspaceId,
        organizationId: project.organizationId,
        actorId: userId,
        type: "ARCHIVED",
        description: `Project "${a.name}" archived`,
        metadata: {},
      }, tx);

      return a;
    });

    return this.toResponse(archived);
  }

  public async restore(
    id: string,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findById(id);

    if (project === null) {
      throw new NotFoundException("Project not found");
    }

    await this.ensureMember(project.organizationId, userId);

    if (project.status !== "ARCHIVED") {
      throw new ForbiddenException("Only archived projects can be restored");
    }

    const restored = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const r = await this.projectRepository.restore(id, tx);

      await this.activityLogRepository.create({
        projectId: id,
        workspaceId: project.workspaceId,
        organizationId: project.organizationId,
        actorId: userId,
        type: "RESTORED",
        description: `Project "${r.name}" restored`,
        metadata: {},
      }, tx);

      return r;
    });

    return this.toResponse(restored);
  }

  public async delete(
    id: string,
    userId: string,
  ): Promise<void> {
    const project = await this.projectRepository.findById(id);

    if (project === null) {
      throw new NotFoundException("Project not found");
    }

    await this.ensureMember(project.organizationId, userId);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await this.projectRepository.update(id, { deletedAt: new Date() }, tx);

      await this.activityLogRepository.create({
        projectId: id,
        workspaceId: project.workspaceId,
        organizationId: project.organizationId,
        actorId: userId,
        type: "ARCHIVED",
        description: `Project "${project.name}" archived`,
        metadata: {},
      }, tx);
    });
  }

  private async toResponse(project: Project): Promise<ProjectResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: project.ownerId },
      select: { id: true, displayName: true, avatarUrl: true },
    });

    const owner = user === null
      ? ProjectOwnerDto.from({ id: project.ownerId, displayName: "Unknown", avatarUrl: null })
      : ProjectOwnerDto.from(user);

    return ProjectResponseDto.from(project, owner);
  }

  private async ensureMember(organizationId: string, userId: string): Promise<void> {
    const membership = await this.membershipRepository.findByOrganizationAndUser(
      organizationId,
      userId,
    );

    if (membership === null) {
      throw new ForbiddenException("User is not a member of this organization");
    }

    if (membership.status !== MembershipStatus.Active) {
      throw new ForbiddenException("User membership is not active");
    }
  }
}
