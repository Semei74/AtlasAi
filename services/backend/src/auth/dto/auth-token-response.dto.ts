export interface AuthTokenResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: Date;
  readonly user: {
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
