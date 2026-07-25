import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({ description: "Workspace name", minLength: 1, maxLength: 100, example: "My Workspace" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public readonly name?: string;

  @ApiPropertyOptional({ description: "Workspace description", maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly description?: string;

  @ApiPropertyOptional({ description: "Workspace color hex code", maxLength: 20, example: "#6366f1" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  public readonly color?: string;

  @ApiPropertyOptional({ description: "Workspace icon identifier", maxLength: 50, example: "briefcase" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  public readonly icon?: string;
}
