import { IsString, IsOptional, MinLength, MaxLength, Matches } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ description: "Organization name", minLength: 1, maxLength: 100, example: "Acme Corp" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public readonly name?: string;

  @ApiPropertyOptional({ description: "URL-friendly slug", minLength: 1, maxLength: 100, example: "acme-corp", pattern: "^[a-z0-9-]+$" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: "Slug must contain only lowercase letters, numbers, and hyphens" })
  public readonly slug?: string;

  @ApiPropertyOptional({ description: "Organization logo URL", maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly logoUrl?: string;
}
