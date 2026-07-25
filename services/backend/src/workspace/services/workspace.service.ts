import { Injectable, Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import { WORKSPACE_REPOSITORY } from "../interfaces/workspace-repository.interface.js";
import type { WorkspaceRepository } from "../interfaces/workspace-repository.interface.js";
import { MEMBERSHIP_REPOSITORY } from "../../membership/interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../../membership/interfaces/membership-repository.interface.js";
import { MembershipStatus } from "../../membership/interfaces/membership-status.enum.js";
import type { Workspace } from "../interfaces/workspace.interface.js";
import type { CreateWorkspaceDto } from "../dto/create-workspace.dto.js";
import type { UpdateWorkspaceDto } from "../dto/update-workspace.dto.js";

@Injectable()
export class WorkspaceService {
  public constructor(
    @Inject(WORKSPACE_REPOSITORY) private readonly workspaceRepository: WorkspaceRepository,
    @Inject(MEMBERSHIP_REPOSITORY) private readonly membershipRepository: MembershipRepository,
  ) {}

  public async create(dto: CreateWorkspaceDto, organizationId: string, userId: string): Promise<Workspace> {
    await this.ensureMember(organizationId, userId);

    return this.workspaceRepository.create({
      organizationId,
      name: dto.name,
      description: dto.description ?? null,
      color: dto.color ?? null,
      icon: dto.icon ?? null,
      settings: {
        config: {},
        ai: {},
        storage: {},
        promptLibraryIds: [],
      },
    });
  }

  public async findByOrganizationId(organizationId: string, userId: string): Promise<Workspace[]> {
    await this.ensureMember(organizationId, userId);

    return this.workspaceRepository.findByOrganizationId(organizationId);
  }

  public async findById(id: string, userId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(id);

    if (workspace === null) {
      throw new NotFoundException("Workspace not found");
    }

    await this.ensureMember(workspace.organizationId, userId);

    return workspace;
  }

  public async update(id: string, dto: UpdateWorkspaceDto, userId: string): Promise<Workspace> {
    await this.findById(id, userId);

    return this.workspaceRepository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.color !== undefined ? { color: dto.color } : {}),
      ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
    });
  }

  public async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId);

    await this.workspaceRepository.delete(id);
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
