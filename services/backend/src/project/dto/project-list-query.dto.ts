import { IsOptional, IsInt, IsString, IsEnum, Min, Max, MinLength, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum ProjectSortField {
  UPDATED_AT = "updatedAt",
  CREATED_AT = "createdAt",
  NAME = "name",
}

export enum ProjectSortOrder {
  ASC = "asc",
  DESC = "desc",
}

export class ProjectListQueryDto {
  @ApiPropertyOptional({ description: "Page number", default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly page?: number;

  @ApiPropertyOptional({ description: "Items per page", default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  public readonly limit?: number;

  @ApiPropertyOptional({ description: "Search term for name or description" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  public readonly search?: string;

  @ApiPropertyOptional({ description: "Filter by status", enum: ["ACTIVE", "DRAFT", "ARCHIVED", "COMPLETED"] })
  @IsOptional()
  @IsString()
  public readonly status?: string;

  @ApiPropertyOptional({ description: "Filter by workspace ID", format: "uuid" })
  @IsOptional()
  @IsString()
  public readonly workspaceId?: string;

  @ApiPropertyOptional({ description: "Sort field", enum: ProjectSortField, default: "updatedAt" })
  @IsOptional()
  @IsEnum(ProjectSortField)
  public readonly sort?: ProjectSortField;

  @ApiPropertyOptional({ description: "Sort order", enum: ProjectSortOrder, default: "desc" })
  @IsOptional()
  @IsEnum(ProjectSortOrder)
  public readonly order?: ProjectSortOrder;
}
