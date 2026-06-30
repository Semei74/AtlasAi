import { IsEmail, IsString, IsOptional, MinLength } from "class-validator";

export class LoginRequest {
  @IsEmail()
  public readonly email!: string;

  @IsString()
  @MinLength(1)
  public readonly password!: string;

  @IsOptional()
  @IsString()
  public readonly deviceName?: string;

  @IsOptional()
  @IsString()
  public readonly devicePlatform?: string;
}
