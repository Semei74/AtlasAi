import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileRequest {
  @ApiPropertyOptional({ description: "Display name", maxLength: 100, example: "John Doe" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  public readonly displayName?: string;

  @ApiPropertyOptional({ description: "Avatar URL", maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly avatarUrl?: string;

  @ApiPropertyOptional({ description: "Short bio", maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly bio?: string;

  @ApiPropertyOptional({ description: "Timezone (IANA)", example: "America/New_York" })
  @IsOptional()
  @IsString()
  public readonly timezone?: string;
}
