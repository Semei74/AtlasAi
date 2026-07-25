import { ApiProperty } from "@nestjs/swagger";
import type { Invitation } from "../interfaces/invitation.interface.js";
import type { InvitationStatus } from "../interfaces/invitation-status.enum.js";
import type { MembershipRole } from "../interfaces/membership-role.enum.js";

export class InvitationResponseDto {
  @ApiProperty({ description: "Invitation ID", format: "uuid" })
  public readonly id!: string;

  @ApiProperty({ description: "Organization ID", format: "uuid" })
  public readonly organizationId!: string;

  @ApiProperty({ description: "Workspace ID", format: "uuid", nullable: true })
  public readonly workspaceId!: string | null;

  @ApiProperty({ description: "Invitee email", format: "email", nullable: true })
  public readonly email!: string | null;

  @ApiProperty({ description: "Invitee user ID", format: "uuid", nullable: true })
  public readonly userId!: string | null;

  @ApiProperty({ description: "Inviter user ID", format: "uuid" })
  public readonly inviterId!: string;

  @ApiProperty({ description: "Invited role", example: "member" })
  public readonly role!: MembershipRole;

  @ApiProperty({ description: "Invitation status", example: "pending" })
  public readonly status!: InvitationStatus;

  @ApiProperty({ description: "Invitation expiration date", example: "2025-02-01T00:00:00.000Z" })
  public readonly expiresAt!: Date;

  @ApiProperty({ description: "Creation date", example: "2025-01-01T00:00:00.000Z" })
  public readonly createdAt!: Date;

  private constructor(data: InvitationResponseDto) {
    this.id = data.id;
    this.organizationId = data.organizationId;
    this.workspaceId = data.workspaceId;
    this.email = data.email;
    this.userId = data.userId;
    this.inviterId = data.inviterId;
    this.role = data.role;
    this.status = data.status;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
  }

  public static from(invitation: Invitation): InvitationResponseDto {
    return new InvitationResponseDto({
      id: invitation.id,
      organizationId: invitation.organizationId,
      workspaceId: invitation.workspaceId ?? null,
      email: invitation.email ?? null,
      userId: invitation.userId ?? null,
      inviterId: invitation.inviterId,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    });
  }
}
