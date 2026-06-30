export const REFRESH_TOKEN_STORE = "REFRESH_TOKEN_STORE";

export interface RefreshTokenData {
  readonly userId: string;
  readonly expiresAt: Date;
  readonly consumed: boolean;
  readonly replacedBy?: string;
}

export interface RefreshTokenStore {
  save(token: string, userId: string, expiresAt: Date): Promise<void>;
  find(token: string): Promise<RefreshTokenData | null>;
  markConsumed(token: string, replacedBy?: string): Promise<void>;
  invalidateByUser(userId: string): Promise<void>;
}
