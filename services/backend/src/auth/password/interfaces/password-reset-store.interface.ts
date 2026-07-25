export const PASSWORD_RESET_STORE = "PASSWORD_RESET_STORE";

export interface PasswordResetTokenData {
  readonly userId: string;
  readonly expiresAt: Date;
  readonly consumed: boolean;
}

export interface PasswordResetStore {
  save(token: string, userId: string, expiresAt: Date): Promise<void>;
  find(token: string): Promise<PasswordResetTokenData | null>;
  markConsumed(token: string): Promise<void>;
  invalidateByUser(userId: string): Promise<void>;
}
