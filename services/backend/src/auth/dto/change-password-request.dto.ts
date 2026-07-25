import { IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordRequest {
  @ApiProperty({ description: "Current password" })
  @IsString()
  @MinLength(1)
  public readonly currentPassword!: string;

  @ApiProperty({ description: "New password (min 8 characters)", minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  public readonly newPassword!: string;
}
