import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsObject, IsBoolean, Matches } from "class-validator";

export class RenderPromptDto {
  @ApiProperty({ description: "Variables to substitute in the template" })
  @IsObject()
  public variables!: Record<string, unknown>;

  @ApiPropertyOptional({ description: "Specific version to render (defaults to current)" })
  @IsOptional()
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/)
  public version?: string;

  @ApiPropertyOptional({ description: "Redact PII from rendered output" })
  @IsOptional()
  @IsBoolean()
  public redactPii?: boolean;
}
