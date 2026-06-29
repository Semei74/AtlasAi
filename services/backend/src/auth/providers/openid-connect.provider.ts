import { Injectable } from "@nestjs/common";
import { AuthProvider, AuthProviderType } from "../interfaces/auth-provider.interface.js";
import { AuthResult } from "../dto/auth-result.dto.js";

@Injectable()
export class OpenIDConnectProvider implements AuthProvider {
  public readonly type = AuthProviderType.OpenIDConnect;

  public authenticate(_credentials: unknown): Promise<AuthResult> {
    return Promise.resolve({
      success: false,
      userId: null,
      provider: this.type,
      failureReason: "OpenID Connect authentication is not yet implemented",
    });
  }
}
