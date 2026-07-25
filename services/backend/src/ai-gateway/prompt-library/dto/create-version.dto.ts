import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsObject, MaxLength } from "class-validator";
import type { CreateVersionDto as ICreateVersionDto, PromptVariableDefinition } from "../interfaces/prompt-library.interface.js";

export class CreateVersionDto implements ICreateVersionDto {
  @ApiPropertyOptional({ description: "System template content" })
  @IsOptional()
  @IsString()
  @MaxLength(1000000)
  public systemTemplate?: string;

  @ApiPropertyOptional({ description: "User template content" })
  @IsOptional()
  @IsString()
  @MaxLength(1000000)
  public userTemplate?: string;

  @ApiPropertyOptional({ description: "Assistant template content" })
  @IsOptional()
  @IsString()
  @MaxLength(1000000)
  public assistantTemplate?: string;

  @ApiPropertyOptional({ description: "Variable definitions" })
  @IsOptional()
  @IsArray()
  public variables?: readonly PromptVariableDefinition[];

  @ApiPropertyOptional({ description: "JSON Schema" })
  @IsOptional()
  @IsObject()
  public schema?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "Changelog entry" })
  @IsOptional()
  @IsString()
  public changelog?: string;
}
