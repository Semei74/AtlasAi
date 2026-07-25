import { ApiProperty } from "@nestjs/swagger";
import type { Workspace } from "../interfaces/workspace.interface.js";

export class WorkspaceResponseDto {
  @ApiProperty({ description: "Workspace ID", format: "uuid" })
  public readonly id!: string;

  @ApiProperty({ description: "Organization ID", format: "uuid" })
  public readonly organizationId!: string;

  @ApiProperty({ description: "Workspace name", example: "My Workspace" })
  public readonly name!: string;

  @ApiProperty({ description: "Workspace description", nullable: true })
  public readonly description!: string | null;

  @ApiProperty({ description: "Workspace color hex code", nullable: true, example: "#6366f1" })
  public readonly color!: string | null;

  @ApiProperty({ description: "Workspace icon identifier", nullable: true, example: "briefcase" })
  public readonly icon!: string | null;

  @ApiProperty({ description: "Creation date", example: "2025-01-01T00:00:00.000Z" })
  public readonly createdAt!: Date;

  @ApiProperty({ description: "Last update date", example: "2025-01-01T00:00:00.000Z" })
  public readonly updatedAt!: Date;

  private constructor(data: WorkspaceResponseDto) {
    this.id = data.id;
    this.organizationId = data.organizationId;
    this.name = data.name;
    this.description = data.description;
    this.color = data.color;
    this.icon = data.icon;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public static from(workspace: Workspace): WorkspaceResponseDto {
    return new WorkspaceResponseDto({
      id: workspace.id,
      organizationId: workspace.organizationId,
      name: workspace.name,
      description: workspace.description,
      color: workspace.color,
      icon: workspace.icon,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    });
  }
}
