import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsObject, MinLength, MaxLength, IsEnum, IsUUID } from "class-validator";
import type { UpdatePromptDto as IUpdatePromptDto } from "../interfaces/prompt-library.interface.js";
import { PromptVisibility } from "../../../generated/prisma/enums.js";

export class UpdatePromptDto implements IUpdatePromptDto {
  @ApiPropertyOptional({ description: "Prompt name" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  public name?: string;

  @ApiPropertyOptional({ description: "Prompt description" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  public description?: string;

  @ApiPropertyOptional({ description: "Category ID" })
  @IsOptional()
  @IsString()
  @IsUUID()
  public categoryId?: string;

  @ApiPropertyOptional({ description: "Tags" })
  @IsOptional()
  @IsArray()
  public tags?: readonly string[];

  @ApiPropertyOptional({ description: "Metadata" })
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "Visibility level", enum: ["Private", "Workspace", "Organization", "Public"] })
  @IsOptional()
  @IsEnum(PromptVisibility)
  public visibility?: PromptVisibility;
}
