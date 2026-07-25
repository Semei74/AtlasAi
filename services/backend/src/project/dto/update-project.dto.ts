import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum UpdateProjectStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  DRAFT = "DRAFT",
  COMPLETED = "COMPLETED",
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ description: "Project name", minLength: 1, maxLength: 200, example: "Q4 Campaign" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  public readonly name?: string;

  @ApiPropertyOptional({ description: "Project description", maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  public readonly description?: string;

  @ApiPropertyOptional({ description: "Project status", enum: UpdateProjectStatus })
  @IsOptional()
  @IsEnum(UpdateProjectStatus)
  public readonly status?: UpdateProjectStatus;
}
