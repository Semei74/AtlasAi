import { ApiProperty } from "@nestjs/swagger";
import { UserResponse } from "./user-response.dto.js";

export class AuthTokenResponse {
  @ApiProperty({ description: "JWT access token" })
  public readonly accessToken!: string;

  @ApiProperty({ description: "Refresh token" })
  public readonly refreshToken!: string;

  @ApiProperty({ description: "Access token expiration date", example: "2025-01-01T01:00:00.000Z" })
  public readonly expiresAt!: Date;

  @ApiProperty({ description: "User object", type: UserResponse })
  public readonly user!: {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
    readonly status: string;
    readonly avatarUrl: string | null;
    readonly bio: string | null;
    readonly timezone: string | null;
    readonly theme: string;
    readonly locale: string;
    readonly emailNotifications: boolean;
    readonly pushNotifications: boolean;
    readonly createdAt: Date;
  };
}
