import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsObject, MinLength, MaxLength, Matches, IsUUID, IsEnum } from "class-validator";
import type { CreatePromptDto as ICreatePromptDto, PromptVariableDefinition } from "../interfaces/prompt-library.interface.js";
import { PromptVisibility } from "../../../generated/prisma/enums.js";

export class CreatePromptDto implements ICreatePromptDto {
  @ApiProperty({ description: "Unique slug for the prompt" })
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  public slug!: string;

  @ApiProperty({ description: "Prompt name" })
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  public name!: string;

  @ApiPropertyOptional({ description: "Prompt description" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  public description?: string;

  @ApiProperty({ description: "Category ID" })
  @IsString()
  @IsUUID()
  public categoryId!: string;

  @ApiPropertyOptional({ description: "System template" })
  @IsOptional()
  @IsString()
  public systemTemplate?: string;

  @ApiPropertyOptional({ description: "User template" })
  @IsOptional()
  @IsString()
  public userTemplate?: string;

  @ApiPropertyOptional({ description: "Assistant template" })
  @IsOptional()
  @IsString()
  public assistantTemplate?: string;

  @ApiPropertyOptional({ description: "Variable definitions" })
  @IsOptional()
  @IsArray()
  public variables?: readonly PromptVariableDefinition[];

  @ApiPropertyOptional({ description: "JSON Schema for validation" })
  @IsOptional()
  @IsObject()
  public schema?: Record<string, unknown>;

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
