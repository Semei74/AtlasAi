import { Injectable, Inject, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { MEMBERSHIP_REPOSITORY } from "../membership/interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../membership/interfaces/membership-repository.interface.js";
import { MembershipStatus } from "../membership/interfaces/membership-status.enum.js";

export interface DashboardStatistics {
  workspacesCount: number;
  organizationsCount: number;
  projectsCount: number;
  activeUsersCount: number;
}

@Injectable()
export class DashboardService {
  public constructor(
    private readonly prisma: PrismaService,
    @Inject(MEMBERSHIP_REPOSITORY) private readonly membershipRepository: MembershipRepository,
  ) {}

  public async getStatistics(
    organizationId: string,
    userId: string,
  ): Promise<DashboardStatistics> {
    await this.ensureMember(organizationId, userId);

    const [workspacesCount, projectsCount, activeUsersCount, userMemberships] = await Promise.all([
      this.prisma.workspace.count({ where: { organizationId } }),
      this.prisma.project.count({ where: { organizationId, deletedAt: null } }),
      this.prisma.membership.count({
        where: { organizationId, status: "Active" },
      }),
      this.membershipRepository.findByOrganizationId(organizationId),
    ]);

    return {
      workspacesCount,
      organizationsCount: new Set(userMemberships.map((m) => m.organizationId)).size,
      projectsCount,
      activeUsersCount,
    };
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
