import { IsEmail, IsString, IsOptional, IsBoolean, MinLength, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterRequest {
  @ApiProperty({ description: "User email address", example: "user@example.com", format: "email" })
  @IsEmail()
  public readonly email!: string;

  @ApiProperty({ description: "User password (min 8 characters)", minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  public readonly password!: string;

  @ApiProperty({ description: "Display name", example: "John Doe", minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public readonly displayName!: string;

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

  @ApiPropertyOptional({ description: "Device name", example: "iPhone 15" })
  @IsOptional()
  @IsString()
  public readonly deviceName?: string;

  @ApiPropertyOptional({ description: "Device platform", example: "ios" })
  @IsOptional()
  @IsString()
  public readonly devicePlatform?: string;
}
