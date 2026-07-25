import { Inject, Injectable } from "@nestjs/common";
import crypto from "node:crypto";
import type { PasswordResetStore } from "../interfaces/password-reset-store.interface.js";
import { PASSWORD_RESET_STORE } from "../interfaces/password-reset-store.interface.js";

const RESET_TOKEN_EXPIRY_MS = 30 * 60 * 1000;
const TOKEN_BYTES = 32;

@Injectable()
export class PasswordResetService {
  public constructor(@Inject(PASSWORD_RESET_STORE) private readonly store: PasswordResetStore) {}

  public async createResetToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");

    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await this.store.invalidateByUser(userId);
    await this.store.save(token, userId, expiresAt);

    return token;
  }

  public async verifyResetToken(token: string): Promise<string | null> {
    const data = await this.store.find(token);

    if (!data) {
      return null;
    }

    if (data.consumed) {
      return null;
    }

    if (Date.now() > data.expiresAt.getTime()) {
      return null;
    }

    return data.userId;
  }

  public async consumeResetToken(token: string): Promise<void> {
    await this.store.markConsumed(token);
  }

  public async invalidateUserTokens(userId: string): Promise<void> {
    await this.store.invalidateByUser(userId);
  }
}
