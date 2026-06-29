import { Injectable } from "@nestjs/common";
import type { PasswordValidationResult } from "../dto/password-validation-result.js";
import { VALID_PASSWORD } from "../dto/password-validation-result.js";
import type {
  PasswordPolicy,
  PasswordPolicyConfig,
} from "../interfaces/password-policy.interface.js";
import { DEFAULT_PASSWORD_POLICY } from "../interfaces/password-policy.interface.js";

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "qwertyuiop",
  "abcdefgh",
  "letmein",
  "welcome",
  "admin123",
  "iloveyou",
  "sunshine",
  "monkey",
  "dragon",
  "passw0rd",
  "master",
  "shadow",
  "trustno1",
  "football",
  "baseball",
  "abc123",
  "11111111",
  "00000000",
  "login",
]);

@Injectable()
export class PasswordPolicyService implements PasswordPolicy {
  public readonly config: PasswordPolicyConfig = { ...DEFAULT_PASSWORD_POLICY };

  public validate(password: string, context?: { email?: string }): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < this.config.minLength) {
      errors.push(`Password must be at least ${String(this.config.minLength)} characters long`);
    }

    if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (this.config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (this.config.requireNumber && !/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (this.config.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    if (this.config.forbidCommonPasswords && COMMON_PASSWORDS.has(password.toLowerCase())) {
      errors.push("This password is too common and has been compromised");
    }

    if (this.config.forbidEmailInclusion) {
      const userEmail = context?.email;
      if (userEmail) {
        const atIndex = userEmail.indexOf("@");
        const emailPrefix =
          atIndex >= 0 ? userEmail.slice(0, atIndex).toLowerCase() : userEmail.toLowerCase();

        if (password.toLowerCase().includes(emailPrefix)) {
          errors.push("Password must not contain your email address");
        }
      }
    }

    if (this.config.forbidSequentialChars) {
      for (let i = 0; i < password.length - 2; i++) {
        const a = password.charCodeAt(i);
        const b = password.charCodeAt(i + 1);
        const c = password.charCodeAt(i + 2);

        if ((b === a + 1 && c === a + 2) || (b === a - 1 && c === a - 2)) {
          errors.push("Password must not contain sequential characters");
          break;
        }
      }
    }

    return errors.length === 0 ? VALID_PASSWORD : { valid: false, errors };
  }
}
