import { IsEmail, IsString, IsOptional, IsBoolean, MinLength, MaxLength } from "class-validator";

export class RegisterRequest {
  @IsEmail()
  public readonly email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  public readonly password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public readonly displayName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly bio?: string;

  @IsOptional()
  @IsString()
  public readonly timezone?: string;

  @IsOptional()
  @IsString()
  public readonly theme?: string;

  @IsOptional()
  @IsString()
  public readonly locale?: string;

  @IsOptional()
  @IsBoolean()
  public readonly emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  public readonly pushNotifications?: boolean;

  @IsOptional()
  @IsString()
  public readonly deviceName?: string;

  @IsOptional()
  @IsString()
  public readonly devicePlatform?: string;
}
