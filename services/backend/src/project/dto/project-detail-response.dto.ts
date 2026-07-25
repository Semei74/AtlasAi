import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProjectOwnerDto } from "./project-response.dto.js";

export class ActivityLogEntryDto {
  @ApiProperty({ description: "Activity entry ID", format: "uuid" })
  public readonly id!: string;

  @ApiProperty({ description: "Activity type", example: "CREATED" })
  public readonly type!: string;

  @ApiProperty({ description: "Activity description", example: 'Project "Q4 Campaign" created' })
  public readonly description!: string;

  @ApiProperty({ description: "Actor display name", example: "Jane Doe" })
  public readonly actorName!: string;

  @ApiProperty({ description: "Date the activity occurred", example: "2025-01-01T00:00:00.000Z" })
  public readonly createdAt!: string;

  private constructor(data: ActivityLogEntryDto) {
    this.id = data.id;
    this.type = data.type;
    this.description = data.description;
    this.actorName = data.actorName;
    this.createdAt = data.createdAt;
  }

  public static from(log: {
    id: string;
    type: string;
    description: string;
    actor: { displayName: string } | null;
    createdAt: Date;
  }): ActivityLogEntryDto {
    return new ActivityLogEntryDto({
      id: log.id,
      type: log.type,
      description: log.description,
      actorName: log.actor?.displayName ?? "Unknown",
      createdAt: log.createdAt.toISOString(),
    });
  }
}

export class ProjectDetailResponseDto {
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

  @ApiProperty({ description: "Workspace name", example: "Marketing" })
  public readonly workspaceName!: string;

  @ApiProperty({ description: "Organization ID", format: "uuid" })
  public readonly organizationId!: string;

  @ApiProperty({ description: "Owner information", type: ProjectOwnerDto })
  public readonly owner!: ProjectOwnerDto;

  @ApiProperty({ description: "Creation date", example: "2025-01-01T00:00:00.000Z" })
  public readonly createdAt!: string;

  @ApiProperty({ description: "Last update date", example: "2025-01-01T00:00:00.000Z" })
  public readonly updatedAt!: string;

  @ApiProperty({ description: "Whether the project is archived (soft-deleted)" })
  public readonly isArchived!: boolean;

  @ApiProperty({ description: "Recent activity logs", type: [ActivityLogEntryDto] })
  public readonly activityLogs!: ActivityLogEntryDto[];

  private constructor(data: ProjectDetailResponseDto) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.status = data.status;
    this.workspaceId = data.workspaceId;
    this.workspaceName = data.workspaceName;
    this.organizationId = data.organizationId;
    this.owner = data.owner;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.isArchived = data.isArchived;
    this.activityLogs = data.activityLogs;
  }

  public static from(data: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    workspaceId: string;
    workspaceName: string;
    organizationId: string;
    owner: ProjectOwnerDto;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    activityLogs: {
      id: string;
      type: string;
      description: string;
      actor: { displayName: string } | null;
      createdAt: Date;
    }[];
  }): ProjectDetailResponseDto {
    return new ProjectDetailResponseDto({
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      isArchived: data.deletedAt !== null,
      activityLogs: data.activityLogs.map((l) => ActivityLogEntryDto.from(l)),
    });
  }
}
