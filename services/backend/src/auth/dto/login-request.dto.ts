import { IsEmail, IsString, IsOptional, IsBoolean, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LoginRequest {
  @ApiProperty({ description: "User email address", example: "user@example.com", format: "email" })
  @IsEmail()
  public readonly email!: string;

  @ApiProperty({ description: "User password", minLength: 1 })
  @IsString()
  @MinLength(1)
  public readonly password!: string;

  @ApiPropertyOptional({ description: "Device name", example: "iPhone 15" })
  @IsOptional()
  @IsString()
  public readonly deviceName?: string;

  @ApiPropertyOptional({ description: "Device platform", example: "ios" })
  @IsOptional()
  @IsString()
  public readonly devicePlatform?: string;

  @ApiPropertyOptional({ description: "Remember me — extends session lifetime", default: false })
  @IsOptional()
  @IsBoolean()
  public readonly rememberMe?: boolean;
}
