import { IsString, IsOptional, MaxLength } from "class-validator";

export class UpdateProfileRequest {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  public readonly displayName?: string;

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
}
