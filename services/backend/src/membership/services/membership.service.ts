import { Injectable, Inject, NotFoundException, ConflictException, ForbiddenException } from "@nestjs/common";
import { MEMBERSHIP_REPOSITORY } from "../interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../interfaces/membership-repository.interface.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { MembershipStatus } from "../interfaces/membership-status.enum.js";
import type { Membership } from "../interfaces/membership.interface.js";
import type { CreateMembershipDto } from "../dto/create-membership.dto.js";
import type { UpdateMembershipDto } from "../dto/update-membership.dto.js";

@Injectable()
export class MembershipService {
  public constructor(
    @Inject(MEMBERSHIP_REPOSITORY) private readonly membershipRepository: MembershipRepository,
  ) {}

  public async create(organizationId: string, dto: CreateMembershipDto, currentUserId: string): Promise<Membership> {
    await this.ensureAdminOrOwner(organizationId, currentUserId);

    const existing = await this.membershipRepository.findByOrganizationAndUser(
      organizationId,
      dto.userId,
    );

    if (existing !== null) {
      throw new ConflictException("User is already a member of this organization");
    }

    return this.membershipRepository.create({
      organizationId,
      userId: dto.userId,
      role: dto.role,
      status: MembershipStatus.Active,
    });
  }

  public async findByOrganizationId(organizationId: string, currentUserId: string): Promise<Membership[]> {
    await this.ensureMember(organizationId, currentUserId);

    return this.membershipRepository.findByOrganizationId(organizationId);
  }

  public async update(id: string, dto: UpdateMembershipDto, currentUserId: string): Promise<Membership> {
    const membership = await this.findById(id);

    await this.ensureAdminOrOwner(membership.organizationId, currentUserId);

    if (membership.role === MembershipRole.Owner) {
      throw new ForbiddenException("Cannot change the role of the organization owner");
    }

    return this.membershipRepository.update(id, { role: dto.role });
  }

  public async delete(id: string, currentUserId: string): Promise<void> {
    const membership = await this.findById(id);

    await this.ensureAdminOrOwner(membership.organizationId, currentUserId);

    if (membership.role === MembershipRole.Owner) {
      throw new ForbiddenException("Cannot remove the organization owner");
    }

    await this.membershipRepository.delete(id);
  }

  private async findById(id: string): Promise<Membership> {
    const membership = await this.membershipRepository.findById(id);

    if (membership === null) {
      throw new NotFoundException("Membership not found");
    }

    return membership;
  }

  private async ensureAdminOrOwner(organizationId: string, userId: string): Promise<void> {
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

    if (membership.role !== MembershipRole.Owner && membership.role !== MembershipRole.Admin) {
      throw new ForbiddenException("Insufficient permissions. Admin or Owner role required.");
    }
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
