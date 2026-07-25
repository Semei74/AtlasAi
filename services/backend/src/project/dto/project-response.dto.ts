import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProjectOwnerDto {
  @ApiProperty({ description: "Owner user ID", format: "uuid" })
  public readonly id!: string;

  @ApiProperty({ description: "Owner display name", example: "Jane Doe" })
  public readonly displayName!: string;

  @ApiProperty({ description: "Owner avatar URL", nullable: true })
  public readonly avatarUrl!: string | null;

  private constructor(data: ProjectOwnerDto) {
    this.id = data.id;
    this.displayName = data.displayName;
    this.avatarUrl = data.avatarUrl;
  }

  public static from(user: { id: string; displayName: string; avatarUrl: string | null }): ProjectOwnerDto {
    return new ProjectOwnerDto({
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    });
  }
}

export class ProjectResponseDto {
  @ApiProperty({ description: "Project ID", format: "uuid" })
  public readonly id!: string;

  @ApiProperty({ description: "Project name", example: "Q4 Campaign" })
  public readonly name!: string;

  @ApiPropertyOptional({ description: "Project description", nullable: true })
  public readonly description!: string | null;

  @ApiProperty({ description: "Project status", enum: ["ACTIVE", "DRAFT", "ARCHIVED", "COMPLETED"] })
  public readonly status!: string;

  @ApiProperty({ description: "Workspace ID", format: "uuid" })
  public readonly workspaceId!: string;

  @ApiProperty({ description: "Organization ID", format: "uuid" })
  public readonly organizationId!: string;

  @ApiProperty({ description: "Owner information", type: ProjectOwnerDto })
  public readonly owner!: ProjectOwnerDto;

  @ApiProperty({ description: "Creation date", example: "2025-01-01T00:00:00.000Z" })
  public readonly createdAt!: Date;

  @ApiProperty({ description: "Last update date", example: "2025-01-01T00:00:00.000Z" })
  public readonly updatedAt!: Date;

  private constructor(data: ProjectResponseDto) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.status = data.status;
    this.workspaceId = data.workspaceId;
    this.organizationId = data.organizationId;
    this.owner = data.owner;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public static from(
    project: {
      id: string;
      name: string;
      description: string | null;
      status: string;
      workspaceId: string;
      organizationId: string;
      createdAt: Date;
      updatedAt: Date;
    },
    owner: ProjectOwnerDto,
  ): ProjectResponseDto {
    return new ProjectResponseDto({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      workspaceId: project.workspaceId,
      organizationId: project.organizationId,
      owner,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  }
}
