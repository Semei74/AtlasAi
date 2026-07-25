import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsObject, MaxLength } from "class-validator";

export class PreviewPromptDto {
  @ApiPropertyOptional({ description: "System template to preview" })
  @IsOptional()
  @IsString()
  @MaxLength(1000000)
  public systemTemplate?: string;

  @ApiPropertyOptional({ description: "User template to preview" })
  @IsOptional()
  @IsString()
  @MaxLength(1000000)
  public userTemplate?: string;

  @ApiPropertyOptional({ description: "Assistant template to preview" })
  @IsOptional()
  @IsString()
  @MaxLength(1000000)
  public assistantTemplate?: string;

  @ApiProperty({ description: "Variables for preview" })
  @IsObject()
  public variables!: Record<string, unknown>;
}
