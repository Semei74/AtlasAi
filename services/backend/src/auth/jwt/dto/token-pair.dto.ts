export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: Date;
}
