import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsArray, IsString, IsOptional, IsInt, Min } from "class-validator";

export class UpdateMetadataDto {
  @ApiProperty({ description: "Custom metadata key/value pairs to overwrite" })
  @IsObject()
  public metadata!: Record<string, unknown>;
}

export class MergeMetadataDto {
  @ApiProperty({ description: "Custom metadata key/value pairs to merge" })
  @IsObject()
  public metadata!: Record<string, unknown>;
}

export class DeleteMetadataDto {
  @ApiProperty({ description: "Metadata keys to delete" })
  @IsArray()
  @IsString({ each: true })
  public keys!: readonly string[];
}

export class MetadataFilterDto {
  @ApiProperty({ description: "Filter by MIME type" })
  @IsOptional()
  @IsString()
  public mimeType?: string;

  @ApiProperty({ description: "Filter by status" })
  @IsOptional()
  @IsString()
  public status?: string;

  @ApiProperty({ description: "Filter by owner ID" })
  @IsOptional()
  @IsString()
  public ownerId?: string;

  @ApiProperty({ description: "Filter by document version" })
  @IsOptional()
  @IsInt()
  @Min(1)
  public version?: number;

  @ApiProperty({ description: "Filter by custom metadata key (use with metadataValue)" })
  @IsOptional()
  @IsString()
  public metadataKey?: string;

  @ApiProperty({ description: "Filter by custom metadata value (use with metadataKey)" })
  @IsOptional()
  @IsString()
  public metadataValue?: string;
}
