import { Injectable } from "@nestjs/common";
import { AuthProvider, AuthProviderType } from "../interfaces/auth-provider.interface.js";
import { AuthResult } from "../dto/auth-result.dto.js";

@Injectable()
export class OAuth2Provider implements AuthProvider {
  public readonly type = AuthProviderType.OAuth2;

  public authenticate(_credentials: unknown): Promise<AuthResult> {
    return Promise.resolve({
      success: false,
      userId: null,
      provider: this.type,
      failureReason: "OAuth2 authentication is not yet implemented",
    });
  }
}
