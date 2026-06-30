import { IsString, MinLength } from "class-validator";

export class RefreshRequest {
  @IsString()
  @MinLength(1)
  public readonly refreshToken!: string;
}
