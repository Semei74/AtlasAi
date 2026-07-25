import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsObject, IsUUID, MinLength, MaxLength } from "class-validator";

export class CreateDocumentDto {
  /**
   * @deprecated organizationId is derived from the JWT token and the value from the request body is ignored.
   * This field is retained for backward compatibility; clients may omit it.
   */
  @ApiPropertyOptional({ description: "Organization ID (deprecated — derived from auth token)" })
  @IsOptional()
  @IsString()
  @IsUUID()
  public organizationId?: string;

  @ApiPropertyOptional({ description: "Workspace ID" })
  @IsOptional()
  @IsString()
  @IsUUID()
  public workspaceId?: string;

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
