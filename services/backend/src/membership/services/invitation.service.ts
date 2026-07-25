import { Injectable, Inject, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { INVITATION_REPOSITORY } from "../interfaces/invitation-repository.interface.js";
import type { InvitationRepository } from "../interfaces/invitation-repository.interface.js";
import { MEMBERSHIP_REPOSITORY } from "../interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../interfaces/membership-repository.interface.js";
import { InvitationStatus } from "../interfaces/invitation-status.enum.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { MembershipStatus } from "../interfaces/membership-status.enum.js";
import type { Invitation } from "../interfaces/invitation.interface.js";
import type { CreateInvitationDto } from "../dto/create-invitation.dto.js";

@Injectable()
export class InvitationService {
  public constructor(
    @Inject(INVITATION_REPOSITORY) private readonly invitationRepository: InvitationRepository,
    @Inject(MEMBERSHIP_REPOSITORY) private readonly membershipRepository: MembershipRepository,
  ) {}

  public async create(dto: CreateInvitationDto, organizationId: string, inviterId: string): Promise<Invitation> {
    await this.ensureAdminOrOwner(organizationId, inviterId);

    if (dto.email === undefined && dto.userId === undefined) {
      throw new BadRequestException("Either email or userId must be provided");
    }

    const targetUserId = dto.userId;

    if (targetUserId !== undefined) {
      const existingMembership = await this.membershipRepository.findByOrganizationAndUser(
        organizationId,
        targetUserId,
      );

      if (existingMembership !== null) {
        throw new ConflictException("User is already a member of this organization");
      }
    }

    if (dto.email !== undefined) {
      const existingInvitations = await this.invitationRepository.findByEmail(dto.email);
      const hasPending = existingInvitations.some(
        (inv) => inv.organizationId === organizationId && inv.status === InvitationStatus.Pending,
      );

      if (hasPending) {
        throw new ConflictException("A pending invitation already exists for this email");
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const data: Omit<Invitation, "id" | "createdAt" | "updatedAt"> = {
      organizationId,
      inviterId,
      role: dto.role,
      status: InvitationStatus.Pending,
      expiresAt,
    };

    Object.assign(data, dto.email !== undefined ? { email: dto.email } : {});
    Object.assign(data, dto.userId !== undefined ? { userId: dto.userId } : {});

    return this.invitationRepository.create(data);
  }

  public async findByOrganizationId(organizationId: string, currentUserId: string): Promise<Invitation[]> {
    await this.ensureMember(organizationId, currentUserId);

    return this.invitationRepository.findByOrganizationId(organizationId);
  }

  public async accept(invitationId: string, userId: string, userEmail?: string): Promise<void> {
    const invitation = await this.findById(invitationId);

    if (invitation.status !== InvitationStatus.Pending) {
      throw new BadRequestException("Invitation is not pending");
    }

    if (invitation.expiresAt < new Date()) {
      await this.invitationRepository.update(invitationId, {
        status: InvitationStatus.Expired,
      });

      throw new BadRequestException("Invitation has expired");
    }

    if (invitation.userId !== undefined && invitation.userId !== userId) {
      throw new ForbiddenException("This invitation was issued to a different user");
    }

    if (invitation.email !== undefined && invitation.email !== userEmail) {
      throw new ForbiddenException("This invitation was issued to a different email address");
    }

    const existingMembership = await this.membershipRepository.findByOrganizationAndUser(
      invitation.organizationId,
      userId,
    );

    if (existingMembership !== null) {
      await this.invitationRepository.update(invitationId, {
        status: InvitationStatus.Accepted,
      });

      return;
    }

    await this.membershipRepository.create({
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
      status: MembershipStatus.Active,
    });

    await this.invitationRepository.update(invitationId, {
      status: InvitationStatus.Accepted,
    });
  }

  public async revoke(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.findById(invitationId);

    await this.ensureAdminOrOwner(invitation.organizationId, userId);

    if (invitation.status !== InvitationStatus.Pending) {
      throw new BadRequestException("Can only revoke pending invitations");
    }

    await this.invitationRepository.update(invitationId, {
      status: InvitationStatus.Revoked,
    });
  }

  private async findById(id: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findById(id);

    if (invitation === null) {
      throw new NotFoundException("Invitation not found");
    }

    return invitation;
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
