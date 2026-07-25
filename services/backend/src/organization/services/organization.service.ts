import { Injectable, Inject, NotFoundException, ConflictException, ForbiddenException } from "@nestjs/common";
import { ORGANIZATION_REPOSITORY } from "../interfaces/organization-repository.interface.js";
import type { OrganizationRepository } from "../interfaces/organization-repository.interface.js";
import { MEMBERSHIP_REPOSITORY } from "../../membership/interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../../membership/interfaces/membership-repository.interface.js";
import { MembershipRole } from "../../membership/interfaces/membership-role.enum.js";
import { MembershipStatus } from "../../membership/interfaces/membership-status.enum.js";
import type { Organization } from "../interfaces/organization.interface.js";
import type { CreateOrganizationDto } from "../dto/create-organization.dto.js";
import type { UpdateOrganizationDto } from "../dto/update-organization.dto.js";
import { DEFAULT_ORGANIZATION_SETTINGS } from "../constants/default-organization-settings.js";

@Injectable()
export class OrganizationService {
  public constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepository: OrganizationRepository,
    @Inject(MEMBERSHIP_REPOSITORY) private readonly membershipRepository: MembershipRepository,
  ) {}

  public async create(dto: CreateOrganizationDto, userId: string): Promise<Organization> {
    const existing = await this.organizationRepository.findBySlug(dto.slug);

    if (existing !== null) {
      throw new ConflictException("Organization with this slug already exists");
    }

    const organization = await this.organizationRepository.create({
      name: dto.name,
      slug: dto.slug,
      ownerId: userId,
      branding: { logoUrl: dto.logoUrl ?? null },
      settings: DEFAULT_ORGANIZATION_SETTINGS,
      metadata: {},
    });

    await this.membershipRepository.create({
      organizationId: organization.id,
      userId,
      role: MembershipRole.Owner,
      status: MembershipStatus.Active,
    });

    return organization;
  }

  public async findById(id: string, userId?: string): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);

    if (organization === null) {
      throw new NotFoundException("Organization not found");
    }

    if (userId !== undefined) {
      await this.ensureMember(organization.id, userId);
    }

    return organization;
  }

  public async findAllByUserId(userId: string): Promise<Organization[]> {
    const memberships = await this.membershipRepository.findByUserId(userId);
    const organizationIds = [...new Set(memberships.map((m) => m.organizationId))];
    return this.organizationRepository.findByIds(organizationIds);
  }

  public async update(id: string, dto: UpdateOrganizationDto, userId: string): Promise<Organization> {
    const organization = await this.findById(id);

    await this.ensureAdminOrOwner(organization.id, userId);

    if (dto.slug !== undefined && dto.slug !== organization.slug) {
      const existing = await this.organizationRepository.findBySlug(dto.slug);

      if (existing !== null) {
        throw new ConflictException("Organization with this slug already exists");
      }
    }

    return this.organizationRepository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
      ...(dto.logoUrl !== undefined ? { branding: { logoUrl: dto.logoUrl ?? null } } : {}),
    });
  }

  public async delete(id: string, userId: string): Promise<void> {
    const organization = await this.findById(id);

    await this.ensureOwner(organization.id, userId);

    await this.organizationRepository.delete(id);
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

  private async ensureOwner(organizationId: string, userId: string): Promise<void> {
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

    if (membership.role !== MembershipRole.Owner) {
      throw new ForbiddenException("Insufficient permissions. Owner role required.");
    }
  }
}
