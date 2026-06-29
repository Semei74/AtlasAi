import { Inject, Injectable } from "@nestjs/common";
import type { PasswordPolicyConfig } from "../interfaces/password-policy.interface.js";
import { PASSWORD_POLICY_CONFIG } from "../interfaces/password-policy.interface.js";

@Injectable()
export class PasswordExpirationService {
  private readonly expirationDays: number;

  public constructor(@Inject(PASSWORD_POLICY_CONFIG) config: PasswordPolicyConfig) {
    this.expirationDays = config.expirationDays;
  }

  public isExpired(passwordChangedAt: Date): boolean {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.expirationDays);

    return passwordChangedAt < cutoff;
  }

  public daysUntilExpiration(passwordChangedAt: Date): number {
    const cutoff = new Date(passwordChangedAt);
    cutoff.setDate(cutoff.getDate() + this.expirationDays);

    const remaining = Math.ceil((cutoff.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return Math.max(0, remaining);
  }

  public getExpirationDays(): number {
    return this.expirationDays;
  }
}
