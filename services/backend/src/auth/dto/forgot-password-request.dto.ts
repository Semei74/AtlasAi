import { IsEmail } from "class-validator";

export class ForgotPasswordRequest {
  @IsEmail()
  public readonly email!: string;
}
