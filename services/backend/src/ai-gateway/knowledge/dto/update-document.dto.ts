import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsArray, IsObject, MinLength, MaxLength } from "class-validator";

export class UpdateDocumentDto {
  @ApiPropertyOptional({ description: "Document classification" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  public classification?: string;

  @ApiPropertyOptional({ description: "Tags" })
  @IsOptional()
  @IsArray()
  public tags?: readonly string[];

  @ApiPropertyOptional({ description: "Custom metadata" })
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, unknown>;
}
