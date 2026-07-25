import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordRequest {
  @ApiProperty({ description: "Registered email address", example: "user@example.com", format: "email" })
  @IsEmail()
  public readonly email!: string;
}
