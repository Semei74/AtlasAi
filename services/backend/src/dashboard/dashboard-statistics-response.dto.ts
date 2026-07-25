import { ApiProperty } from "@nestjs/swagger";

export class DashboardStatisticsResponseDto {
  @ApiProperty({ description: "Number of workspaces in the organization", example: 5 })
  public readonly workspacesCount!: number;

  @ApiProperty({ description: "Number of organizations the user belongs to", example: 2 })
  public readonly organizationsCount!: number;

  @ApiProperty({ description: "Number of active projects in the organization", example: 12 })
  public readonly projectsCount!: number;

  @ApiProperty({ description: "Number of active members in the organization", example: 8 })
  public readonly activeUsersCount!: number;

  private constructor(data: DashboardStatisticsResponseDto) {
    this.workspacesCount = data.workspacesCount;
    this.organizationsCount = data.organizationsCount;
    this.projectsCount = data.projectsCount;
    this.activeUsersCount = data.activeUsersCount;
  }

  public static from(stats: {
    workspacesCount: number;
    organizationsCount: number;
    projectsCount: number;
    activeUsersCount: number;
  }): DashboardStatisticsResponseDto {
    return new DashboardStatisticsResponseDto({
      workspacesCount: stats.workspacesCount,
      organizationsCount: stats.organizationsCount,
      projectsCount: stats.projectsCount,
      activeUsersCount: stats.activeUsersCount,
    });
  }
}
