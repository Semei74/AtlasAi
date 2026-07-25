import { IsString, IsOptional, MinLength, MaxLength, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateProjectDto {
  @ApiProperty({ description: "Project name", minLength: 1, maxLength: 200, example: "Q4 Campaign" })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  public readonly name!: string;

  @ApiPropertyOptional({ description: "Project description", maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  public readonly description?: string;

  @ApiProperty({ description: "Workspace ID", format: "uuid" })
  @IsUUID()
  public readonly workspaceId!: string;
}
