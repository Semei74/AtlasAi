import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsArray, IsUUID, IsInt, Min, Max, IsEnum } from "class-validator";
import { DocumentStatus } from "../../../generated/prisma/enums.js";

export class DocumentFilterDto {
  @ApiPropertyOptional({ description: "Filter by workspace ID" })
  @IsOptional()
  @IsString()
  @IsUUID()
  public workspaceId?: string;

  @ApiPropertyOptional({ description: "Filter by owner ID" })
  @IsOptional()
  @IsString()
  @IsUUID()
  public ownerId?: string;

  @ApiPropertyOptional({ description: "Filter by status" })
  @IsOptional()
  @IsString()
  @IsEnum(DocumentStatus)
  public status?: DocumentStatus;

  @ApiPropertyOptional({ description: "Search in name and classification" })
  @IsOptional()
  @IsString()
  public search?: string;

  @ApiPropertyOptional({ description: "Filter by MIME type" })
  @IsOptional()
  @IsString()
  public mimeType?: string;

  @ApiPropertyOptional({ description: "Filter by tags" })
  @IsOptional()
  @IsArray()
  public tags?: readonly string[];

  @ApiPropertyOptional({ description: "Sort field", default: "createdAt" })
  @IsOptional()
  @IsString()
  public sortBy?: string;

  @ApiPropertyOptional({ description: "Sort order", default: "desc" })
  @IsOptional()
  @IsString()
  public sortOrder?: string;

  @ApiPropertyOptional({ description: "Offset", default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  public offset?: number;

  @ApiPropertyOptional({ description: "Limit", default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  public limit?: number;
}
