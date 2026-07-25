import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { InvitationRepository } from "../interfaces/invitation-repository.interface.js";
import type { Invitation } from "../interfaces/invitation.interface.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { InvitationStatus } from "../interfaces/invitation-status.enum.js";

const ROLE_MAP: Record<string, MembershipRole> = {
  Owner: MembershipRole.Owner,
  Admin: MembershipRole.Admin,
  Manager: MembershipRole.Manager,
  Member: MembershipRole.Member,
  Viewer: MembershipRole.Viewer,
};

const ROLE_REVERSE: Record<MembershipRole, string> = {
  [MembershipRole.Owner]: "Owner",
  [MembershipRole.Admin]: "Admin",
  [MembershipRole.Manager]: "Manager",
  [MembershipRole.Member]: "Member",
  [MembershipRole.Viewer]: "Viewer",
};

const STATUS_MAP: Record<string, InvitationStatus> = {
  Pending: InvitationStatus.Pending,
  Accepted: InvitationStatus.Accepted,
  Expired: InvitationStatus.Expired,
  Revoked: InvitationStatus.Revoked,
};

const STATUS_REVERSE: Record<InvitationStatus, string> = {
  [InvitationStatus.Pending]: "Pending",
  [InvitationStatus.Accepted]: "Accepted",
  [InvitationStatus.Expired]: "Expired",
  [InvitationStatus.Revoked]: "Revoked",
};

@Injectable()
export class PrismaInvitationRepository implements InvitationRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string): Promise<Invitation | null> {
    const row = await this.prisma.invitation.findUnique({ where: { id } });
    if (row === null) return null;
    return this.toDomain(row);
  }

  public async findByOrganizationId(organizationId: string): Promise<Invitation[]> {
    const rows = await this.prisma.invitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  public async findByEmail(email: string): Promise<Invitation[]> {
    const rows = await this.prisma.invitation.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  public async create(
    data: Omit<Invitation, "id" | "createdAt" | "updatedAt">,
  ): Promise<Invitation> {
    const row = await this.prisma.invitation.create({
      data: {
        organizationId: data.organizationId,
        workspaceId: data.workspaceId ?? null,
        email: data.email ?? null,
        userId: data.userId ?? null,
        inviterId: data.inviterId,
        role: ROLE_REVERSE[data.role] as never,
        status: STATUS_REVERSE[data.status] as never,
        expiresAt: data.expiresAt,
      },
    });
    return this.toDomain(row);
  }

  public async update(
    id: string,
    changes: Partial<Omit<Invitation, "id">>,
  ): Promise<Invitation> {
    const data: Record<string, unknown> = {};
    if (changes.role !== undefined) data["role"] = ROLE_REVERSE[changes.role];
    if (changes.status !== undefined) data["status"] = STATUS_REVERSE[changes.status];
    if (changes.email !== undefined) data["email"] = changes.email;
    if (changes.userId !== undefined) data["userId"] = changes.userId;
    if (changes.workspaceId !== undefined) data["workspaceId"] = changes.workspaceId;
    if (changes.expiresAt !== undefined) data["expiresAt"] = changes.expiresAt;

    const row = await this.prisma.invitation.update({
      where: { id },
      data: data as never,
    });
    return this.toDomain(row);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.invitation.delete({ where: { id } });
  }

  private toDomain(row: {
    id: string;
    organizationId: string;
    workspaceId: string | null;
    email: string | null;
    userId: string | null;
    inviterId: string;
    role: string;
    status: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): Invitation {
    return {
      id: row.id,
      organizationId: row.organizationId,
      inviterId: row.inviterId,
      role: ROLE_MAP[row.role] ?? MembershipRole.Member,
      status: STATUS_MAP[row.status] ?? InvitationStatus.Pending,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...(row.workspaceId !== null && { workspaceId: row.workspaceId }),
      ...(row.email !== null && { email: row.email }),
      ...(row.userId !== null && { userId: row.userId }),
    };
  }
}
