import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { MembershipRepository } from "../interfaces/membership-repository.interface.js";
import type { Membership } from "../interfaces/membership.interface.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { MembershipStatus } from "../interfaces/membership-status.enum.js";

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

const STATUS_MAP: Record<string, MembershipStatus> = {
  Active: MembershipStatus.Active,
  Invited: MembershipStatus.Invited,
};

const STATUS_REVERSE: Record<MembershipStatus, string> = {
  [MembershipStatus.Active]: "Active",
  [MembershipStatus.Invited]: "Invited",
};

@Injectable()
export class PrismaMembershipRepository implements MembershipRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string): Promise<Membership | null> {
    const row = await this.prisma.membership.findUnique({ where: { id } });
    if (row === null) return null;
    return this.toDomain(row);
  }

  public async findByOrganizationId(organizationId: string): Promise<Membership[]> {
    const rows = await this.prisma.membership.findMany({
      where: { organizationId },
      orderBy: { joinedAt: "asc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  public async findByUserId(userId: string): Promise<Membership[]> {
    const rows = await this.prisma.membership.findMany({
      where: { userId },
      orderBy: { joinedAt: "desc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  public async findByOrganizationAndUser(
    organizationId: string,
    userId: string,
  ): Promise<Membership | null> {
    const row = await this.prisma.membership.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    if (row === null) return null;
    return this.toDomain(row);
  }

  public async create(
    data: Omit<Membership, "id" | "joinedAt">,
  ): Promise<Membership> {
    const row = await this.prisma.membership.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        role: ROLE_REVERSE[data.role] as never,
        status: STATUS_REVERSE[data.status] as never,
      },
    });
    return this.toDomain(row);
  }

  public async update(
    id: string,
    changes: Partial<Omit<Membership, "id">>,
  ): Promise<Membership> {
    const data: Record<string, unknown> = {};
    if (changes.role !== undefined) data["role"] = ROLE_REVERSE[changes.role];
    if (changes.status !== undefined) data["status"] = STATUS_REVERSE[changes.status];
    if (changes.organizationId !== undefined) data["organizationId"] = changes.organizationId;
    if (changes.userId !== undefined) data["userId"] = changes.userId;

    const row = await this.prisma.membership.update({
      where: { id },
      data: data as never,
    });
    return this.toDomain(row);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.membership.delete({ where: { id } });
  }

  private toDomain(row: {
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    status: string;
    joinedAt: Date;
  }): Membership {
    return {
      id: row.id,
      organizationId: row.organizationId,
      userId: row.userId,
      role: ROLE_MAP[row.role] ?? MembershipRole.Member,
      status: STATUS_MAP[row.status] ?? MembershipStatus.Active,
      joinedAt: row.joinedAt,
    };
  }
}
