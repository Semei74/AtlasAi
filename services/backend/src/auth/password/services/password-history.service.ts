import { Inject, Injectable } from "@nestjs/common";
import type { PasswordHistoryStore } from "../interfaces/password-history-store.interface.js";
import { PASSWORD_HISTORY_STORE } from "../interfaces/password-history-store.interface.js";
import { PasswordHashingService } from "./password-hashing.service.js";

@Injectable()
export class PasswordHistoryService {
  public constructor(
    @Inject(PASSWORD_HISTORY_STORE) private readonly store: PasswordHistoryStore,
    @Inject(PasswordHashingService) private readonly hashingService: PasswordHashingService,
  ) {}

  public async recordPassword(userId: string, passwordHash: string): Promise<void> {
    await this.store.add(userId, passwordHash);
  }

  public async isPasswordReused(userId: string, password: string): Promise<boolean> {
    const hashes = await this.store.getAll(userId);
    for (const hash of hashes) {
      const matched = await this.hashingService.verify(hash, password);
      if (matched) return true;
    }
    return false;
  }
}
