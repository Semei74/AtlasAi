import { IsString, IsOptional, IsBoolean } from "class-validator";

export class UpdatePreferencesRequest {
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
}
