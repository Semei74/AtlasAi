import { Injectable } from "@nestjs/common";
import { DEFAULT_PASSWORD_POLICY } from "../interfaces/password-policy.interface.js";

@Injectable()
export class PasswordExpirationService {
  private readonly expirationDays: number = DEFAULT_PASSWORD_POLICY.expirationDays;

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
