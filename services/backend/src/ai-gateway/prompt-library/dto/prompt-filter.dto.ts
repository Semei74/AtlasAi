import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt, Min, IsArray, IsEnum, MaxLength } from "class-validator";
import { Type } from "class-transformer";

import { PromptStatus } from "../../../generated/prisma/enums.js";

export class PromptFilterDto {
  @ApiPropertyOptional({ description: "Filter by status" })
  @IsOptional()
  @IsEnum(PromptStatus)
  public status?: PromptStatus;

  @ApiPropertyOptional({ description: "Filter by category ID" })
  @IsOptional()
  @IsString()
  public categoryId?: string;

  @ApiPropertyOptional({ description: "Search in name and description" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  public search?: string;

  @ApiPropertyOptional({ description: "Filter by tags" })
  @IsOptional()
  @IsArray()
  public tags?: readonly string[];

  @ApiPropertyOptional({ description: "Page number" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public page?: number;

  @ApiPropertyOptional({ description: "Items per page" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public limit?: number;
}
