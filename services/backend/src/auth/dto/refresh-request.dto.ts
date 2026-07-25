import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshRequest {
  @ApiProperty({ description: "Refresh token from previous authentication" })
  @IsString()
  @MinLength(1)
  public readonly refreshToken!: string;
}
