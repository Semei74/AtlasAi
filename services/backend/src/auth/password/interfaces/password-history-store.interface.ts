export const PASSWORD_HISTORY_STORE = "PASSWORD_HISTORY_STORE";

export interface PasswordHistoryStore {
  add(userId: string, passwordHash: string): Promise<void>;
  getAll(userId: string): Promise<readonly string[]>;
}
