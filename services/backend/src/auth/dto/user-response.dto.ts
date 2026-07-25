import { ApiProperty } from "@nestjs/swagger";

export class UserResponse {
  @ApiProperty({ description: "User ID", example: "clx...", format: "uuid" })
  public readonly id!: string;

  @ApiProperty({ description: "Email address", example: "user@example.com", format: "email" })
  public readonly email!: string;

  @ApiProperty({ description: "Display name", example: "John Doe" })
  public readonly displayName!: string;

  @ApiProperty({ description: "Account status", example: "active" })
  public readonly status!: string;

  @ApiProperty({ description: "Avatar URL", nullable: true })
  public readonly avatarUrl!: string | null;

  @ApiProperty({ description: "Short bio", nullable: true })
  public readonly bio!: string | null;

  @ApiProperty({ description: "Timezone (IANA)", nullable: true, example: "America/New_York" })
  public readonly timezone!: string | null;

  @ApiProperty({ description: "Preferred theme", example: "light" })
  public readonly theme!: string;

  @ApiProperty({ description: "Locale", example: "en-US" })
  public readonly locale!: string;

  @ApiProperty({ description: "Email notifications enabled" })
  public readonly emailNotifications!: boolean;

  @ApiProperty({ description: "Push notifications enabled" })
  public readonly pushNotifications!: boolean;

  @ApiProperty({ description: "Account creation date", example: "2025-01-01T00:00:00.000Z" })
  public readonly createdAt!: Date;

  @ApiProperty({ description: "Last update date", example: "2025-01-01T00:00:00.000Z" })
  public readonly updatedAt!: Date;
}
