import type { AuthResult } from "../dto/auth-result.dto.js";

export enum AuthProviderType {
  EmailPassword = "email_password",
  OAuth2 = "oauth2",
  OpenIDConnect = "openid_connect",
  ApiKey = "api_key",
}

export interface AuthProvider {
  readonly type: AuthProviderType;
  authenticate(credentials: unknown): Promise<AuthResult>;
}
