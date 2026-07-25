import { ApiProperty } from "@nestjs/swagger";
import type { Membership } from "../interfaces/membership.interface.js";
import type { MembershipRole } from "../interfaces/membership-role.enum.js";
import type { MembershipStatus } from "../interfaces/membership-status.enum.js";

export class MembershipResponseDto {
  @ApiProperty({ description: "Membership ID", format: "uuid" })
  public readonly id!: string;

  @ApiProperty({ description: "Organization ID", format: "uuid" })
  public readonly organizationId!: string;

  @ApiProperty({ description: "User ID", format: "uuid" })
  public readonly userId!: string;

  @ApiProperty({ description: "Membership role", example: "member" })
  public readonly role!: MembershipRole;

  @ApiProperty({ description: "Membership status", example: "active" })
  public readonly status!: MembershipStatus;

  @ApiProperty({ description: "Join date", example: "2025-01-01T00:00:00.000Z" })
  public readonly joinedAt!: Date;

  private constructor(data: MembershipResponseDto) {
    this.id = data.id;
    this.organizationId = data.organizationId;
    this.userId = data.userId;
    this.role = data.role;
    this.status = data.status;
    this.joinedAt = data.joinedAt;
  }

  public static from(membership: Membership): MembershipResponseDto {
    return new MembershipResponseDto({
      id: membership.id,
      organizationId: membership.organizationId,
      userId: membership.userId,
      role: membership.role,
      status: membership.status,
      joinedAt: membership.joinedAt,
    });
  }
}
