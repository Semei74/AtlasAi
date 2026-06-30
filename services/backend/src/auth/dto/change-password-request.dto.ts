import { IsString, MinLength, MaxLength } from "class-validator";

export class ChangePasswordRequest {
  @IsString()
  @MinLength(1)
  public readonly currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  public readonly newPassword!: string;
}
