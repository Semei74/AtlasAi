import type { AuthProviderType } from "../interfaces/auth-provider.interface.js";

export interface AuthResult {
  readonly success: boolean;
  readonly userId: string | null;
  readonly provider: AuthProviderType;
  readonly failureReason: string | null;
}
