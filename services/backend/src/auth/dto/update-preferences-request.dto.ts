import { IsString, IsOptional, IsBoolean } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatePreferencesRequest {
  @ApiPropertyOptional({ description: "Preferred theme", example: "light" })
  @IsOptional()
  @IsString()
  public readonly theme?: string;

  @ApiPropertyOptional({ description: "Locale", example: "en-US" })
  @IsOptional()
  @IsString()
  public readonly locale?: string;

  @ApiPropertyOptional({ description: "Email notifications enabled", default: true })
  @IsOptional()
  @IsBoolean()
  public readonly emailNotifications?: boolean;

  @ApiPropertyOptional({ description: "Push notifications enabled", default: true })
  @IsOptional()
  @IsBoolean()
  public readonly pushNotifications?: boolean;
}
