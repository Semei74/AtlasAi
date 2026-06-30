import { describe, it, expect, beforeAll } from "vitest";
import { PasswordHashingService } from "./services/password-hashing.service.js";
import { PasswordPolicyService } from "./services/password-policy.service.js";
import { PasswordHistoryService } from "./services/password-history.service.js";
import { PasswordResetService } from "./services/password-reset.service.js";
import { PasswordExpirationService } from "./services/password-expiration.service.js";
import { PasswordManagementService } from "./services/password-management.service.js";
import { DEFAULT_PASSWORD_POLICY } from "./interfaces/password-policy.interface.js";
import type { PasswordHistoryStore } from "./interfaces/password-history-store.interface.js";
import type {
  PasswordResetStore,
  PasswordResetTokenData,
} from "./interfaces/password-reset-store.interface.js";
import type { UserRecord, UserRepository } from "../interfaces/user-repository.interface.js";

const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_EMAIL = "test@example.com";

class InMemoryPasswordHistoryStore implements PasswordHistoryStore {
  private readonly history = new Map<string, string[]>();

  public add(userId: string, passwordHash: string): Promise<void> {
    const entries = this.history.get(userId) ?? [];
    entries.push(passwordHash);
    this.history.set(userId, entries);
    return Promise.resolve();
  }

  public getAll(userId: string): Promise<readonly string[]> {
    return Promise.resolve(this.history.get(userId) ?? []);
  }
}

class InMemoryPasswordResetStore implements PasswordResetStore {
  private readonly tokens = new Map<string, PasswordResetTokenData>();

  public save(token: string, userId: string, expiresAt: Date): Promise<void> {
    this.tokens.set(token, { userId, expiresAt, consumed: false });
    return Promise.resolve();
  }

  public find(token: string): Promise<PasswordResetTokenData | null> {
    return Promise.resolve(this.tokens.get(token) ?? null);
  }

  public markConsumed(token: string): Promise<void> {
    const data = this.tokens.get(token);
    if (data) {
      this.tokens.set(token, { ...data, consumed: true });
    }
    return Promise.resolve();
  }

  public invalidateByUser(userId: string): Promise<void> {
    for (const [token, data] of this.tokens.entries()) {
      if (data.userId === userId) {
        this.tokens.delete(token);
      }
    }
    return Promise.resolve();
  }
}

class MockUserRepository implements UserRepository {
  private readonly users = new Map<string, UserRecord>();

  public constructor() {
    this.users.set(TEST_USER_ID, {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      passwordHash: "",
      displayName: "Test User",
      status: "active",
      avatarUrl: null,
      bio: null,
      timezone: null,
      theme: "system",
      locale: "en-US",
      emailNotifications: true,
      pushNotifications: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public findByEmail(email: string): Promise<UserRecord | null> {
    for (const user of this.users.values()) {
      if (user.email === email.toLowerCase()) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }

  public findById(id: string): Promise<UserRecord | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  public setPasswordHash(userId: string, hash: string): void {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, passwordHash: hash });
    }
  }

  public create(record: Omit<UserRecord, "createdAt" | "updatedAt">): Promise<UserRecord> {
    const now = new Date();
    const user: UserRecord = { ...record, createdAt: now, updatedAt: now };
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  public update(id: string, changes: Partial<Omit<UserRecord, "id">>): Promise<UserRecord> {
    const existing = this.users.get(id);
    if (existing === undefined) {
      throw new Error("User not found");
    }
    const updated: UserRecord = { ...existing, ...changes, updatedAt: new Date() };
    this.users.set(updated.id, updated);
    return Promise.resolve(updated);
  }
}

describe("PasswordHashingService", () => {
  let service: PasswordHashingService;

  beforeAll(() => {
    service = new PasswordHashingService();
  });

  it("should hash a password", async () => {
    const hash = await service.hash("MySecureP@ss1");
    expect(hash).toBeTruthy();
    expect(hash).not.toBe("MySecureP@ss1");
  });

  it("should verify correct password", async () => {
    const hash = await service.hash("MySecureP@ss1");
    const valid = await service.verify(hash, "MySecureP@ss1");
    expect(valid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const hash = await service.hash("MySecureP@ss1");
    const valid = await service.verify(hash, "WrongPassword1!");
    expect(valid).toBe(false);
  });

  it("should use argon2id algorithm", async () => {
    const hash = await service.hash("MySecureP@ss1");
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });
});

describe("PasswordPolicyService", () => {
  let service: PasswordPolicyService;

  beforeAll(() => {
    service = new PasswordPolicyService(DEFAULT_PASSWORD_POLICY);
  });

  it("should reject password shorter than 12 chars", () => {
    const result = service.validate("Short1A!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must be at least 12 characters long");
  });

  it("should reject missing uppercase", () => {
    const result = service.validate("lowercaseonly1!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one uppercase letter");
  });

  it("should reject missing lowercase", () => {
    const result = service.validate("UPPERCASEONLY1!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one lowercase letter");
  });

  it("should reject missing number", () => {
    const result = service.validate("NoNumbersHere!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one number");
  });

  it("should reject missing special character", () => {
    const result = service.validate("NoSpecialChar1");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one special character");
  });

  it("should reject common passwords", () => {
    const result = service.validate("Password123");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("This password is too common and has been compromised");
  });

  it("should reject password containing email", () => {
    const result = service.validate("test@example.comSecure1!", { email: "test@example.com" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must not contain your email address");
  });

  it("should reject sequential characters", () => {
    const result = service.validate("Abcdefgh1!@#$");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must not contain sequential characters");
  });

  it("should accept a valid password", () => {
    const result = service.validate("MySecureP@ss1!");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should report multiple errors", () => {
    const result = service.validate("short");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  it("should accept config injection", () => {
    const customService = new PasswordPolicyService({ ...DEFAULT_PASSWORD_POLICY, minLength: 8 });
    expect(customService.config.minLength).toBe(8);
  });
});

describe("PasswordHistoryService", () => {
  let store: InMemoryPasswordHistoryStore;
  let hashingService: PasswordHashingService;
  let service: PasswordHistoryService;

  beforeAll(() => {
    store = new InMemoryPasswordHistoryStore();
    hashingService = new PasswordHashingService();
    service = new PasswordHistoryService(store, hashingService);
  });

  it("should record a password", async () => {
    const hash = await hashingService.hash("TestP@ss1!");
    await service.recordPassword(TEST_USER_ID, hash);
    const reused = await service.isPasswordReused(TEST_USER_ID, "TestP@ss1!");
    expect(reused).toBe(true);
  });

  it("should detect reused password", async () => {
    const hash = await hashingService.hash("AnotherP@ss1!");
    await service.recordPassword(TEST_USER_ID, hash);
    const reused = await service.isPasswordReused(TEST_USER_ID, "AnotherP@ss1!");
    expect(reused).toBe(true);
  });

  it("should not flag unused password as reused", async () => {
    const reused = await service.isPasswordReused(TEST_USER_ID, "UnknownP@ss1!");
    expect(reused).toBe(false);
  });

  it("should track history per user", async () => {
    const userA = "user_a";
    const userB = "user_b";
    const hash = await hashingService.hash("SharedP@ss1!");
    await service.recordPassword(userA, hash);
    await service.recordPassword(userB, hash);
    expect(await service.isPasswordReused(userA, "SharedP@ss1!")).toBe(true);
    expect(await service.isPasswordReused(userB, "SharedP@ss1!")).toBe(true);
  });
});

describe("PasswordResetService", () => {
  let store: InMemoryPasswordResetStore;
  let service: PasswordResetService;

  beforeAll(() => {
    store = new InMemoryPasswordResetStore();
    service = new PasswordResetService(store);
  });

  it("should create a reset token", async () => {
    const token = await service.createResetToken(TEST_USER_ID);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("should verify a valid token", async () => {
    const token = await service.createResetToken(TEST_USER_ID);
    const userId = await service.verifyResetToken(token);
    expect(userId).toBe(TEST_USER_ID);
  });

  it("should reject consumed token", async () => {
    const token = await service.createResetToken(TEST_USER_ID);
    await service.consumeResetToken(token);
    const userId = await service.verifyResetToken(token);
    expect(userId).toBeNull();
  });

  it("should reject unknown token", async () => {
    const userId = await service.verifyResetToken("nonexistent_token");
    expect(userId).toBeNull();
  });

  it("should reject expired token", async () => {
    const expiredStore: PasswordResetStore = {
      save(_token: string, _userId: string, _expiresAt: Date): Promise<void> {
        return Promise.resolve();
      },
      find(_token: string): Promise<PasswordResetTokenData | null> {
        return Promise.resolve({ userId: TEST_USER_ID, expiresAt: new Date(0), consumed: false });
      },
      markConsumed(_token: string): Promise<void> {
        return Promise.resolve();
      },
      invalidateByUser(_userId: string): Promise<void> {
        return Promise.resolve();
      },
    };

    const expiredService = new PasswordResetService(expiredStore);
    const userId = await expiredService.verifyResetToken("any_token");
    expect(userId).toBeNull();
  });

  it("should invalidate previous tokens for user", async () => {
    const token1 = await service.createResetToken(TEST_USER_ID);
    const token2 = await service.createResetToken(TEST_USER_ID);

    const userId1 = await service.verifyResetToken(token1);
    const userId2 = await service.verifyResetToken(token2);

    expect(userId1).toBeNull();
    expect(userId2).toBe(TEST_USER_ID);
  });
});

describe("PasswordExpirationService", () => {
  let service: PasswordExpirationService;

  beforeAll(() => {
    service = new PasswordExpirationService(DEFAULT_PASSWORD_POLICY);
  });

  it("should not flag recent password as expired", () => {
    const expired = service.isExpired(new Date());
    expect(expired).toBe(false);
  });

  it("should flag old password as expired", () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 1);
    const expired = service.isExpired(oldDate);
    expect(expired).toBe(true);
  });

  it("should return days until expiration for recent password", () => {
    const days = service.daysUntilExpiration(new Date());
    expect(days).toBe(90);
  });

  it("should return 0 days for expired password", () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 1);
    const days = service.daysUntilExpiration(oldDate);
    expect(days).toBe(0);
  });

  it("should return configured expiration days", () => {
    expect(service.getExpirationDays()).toBe(90);
  });
});

describe("PasswordManagementService", () => {
  let hashingService: PasswordHashingService;
  let policyService: PasswordPolicyService;
  let historyStore: InMemoryPasswordHistoryStore;
  let historyService: PasswordHistoryService;
  let resetStore: InMemoryPasswordResetStore;
  let resetService: PasswordResetService;
  let userRepo: MockUserRepository;
  let managementService: PasswordManagementService;

  beforeAll(async () => {
    hashingService = new PasswordHashingService();
    policyService = new PasswordPolicyService(DEFAULT_PASSWORD_POLICY);
    historyStore = new InMemoryPasswordHistoryStore();
    historyService = new PasswordHistoryService(historyStore, hashingService);
    resetStore = new InMemoryPasswordResetStore();
    resetService = new PasswordResetService(resetStore);
    userRepo = new MockUserRepository();

    const currentHash = await hashingService.hash("CurrentP@ss1!");
    userRepo.setPasswordHash(TEST_USER_ID, currentHash);

    managementService = new PasswordManagementService(
      hashingService,
      policyService,
      historyService,
      resetService,
      userRepo,
    );
  });

  it("should reject change with wrong current password", async () => {
    const result = await managementService.changePassword({
      userId: TEST_USER_ID,
      currentPassword: "WrongPassword1!",
      newPassword: "NewSecureP@ss1!",
    });

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("Current password is incorrect");
  });

  it("should reject change with weak new password", async () => {
    const result = await managementService.changePassword({
      userId: TEST_USER_ID,
      currentPassword: "CurrentP@ss1!",
      newPassword: "weak",
    });

    expect(result.success).toBe(false);
    expect(result.failureReason).toBeTruthy();
  });

  it("should reject change when password is reused", async () => {
    const newHash = await hashingService.hash("AnotherP@ss1!");
    await historyService.recordPassword(TEST_USER_ID, newHash);

    const result = await managementService.changePassword({
      userId: TEST_USER_ID,
      currentPassword: "CurrentP@ss1!",
      newPassword: "AnotherP@ss1!",
    });

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("Password has been used recently");
  });

  it("should accept valid password change", async () => {
    const result = await managementService.changePassword({
      userId: TEST_USER_ID,
      currentPassword: "CurrentP@ss1!",
      newPassword: "BrandNewP@ss1!",
    });

    expect(result.success).toBe(true);
    expect(result.failureReason).toBeNull();
  });

  it("should reject change for non-existent user", async () => {
    const result = await managementService.changePassword({
      userId: "nonexistent",
      currentPassword: "CurrentP@ss1!",
      newPassword: "NewSecureP@ss1!",
    });

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("User not found");
  });

  it("should reject reset with invalid token", async () => {
    const result = await managementService.resetPassword({
      token: "invalid_token",
      newPassword: "ResetSecureP@ss1!",
    });

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("Invalid or expired reset token");
  });

  it("should reject reset with consumed token", async () => {
    const token = await resetService.createResetToken(TEST_USER_ID);
    await resetService.consumeResetToken(token);

    const result = await managementService.resetPassword({
      token,
      newPassword: "ResetSecureP@ss1!",
    });

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("Invalid or expired reset token");
  });

  it("should reject reset with expired token", async () => {
    const expiredStore: PasswordResetStore = {
      save(_token: string, _userId: string, _expiresAt: Date): Promise<void> {
        return Promise.resolve();
      },
      find(_token: string): Promise<PasswordResetTokenData | null> {
        return Promise.resolve({ userId: TEST_USER_ID, expiresAt: new Date(0), consumed: false });
      },
      markConsumed(_token: string): Promise<void> {
        return Promise.resolve();
      },
      invalidateByUser(_userId: string): Promise<void> {
        return Promise.resolve();
      },
    };

    const expiredService = new PasswordResetService(expiredStore);

    const expiredManagement = new PasswordManagementService(
      hashingService,
      policyService,
      historyService,
      expiredService,
      userRepo,
    );

    const result = await expiredManagement.resetPassword({
      token: "any_token",
      newPassword: "ResetSecureP@ss1!",
    });

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("Invalid or expired reset token");
  });

  it("should reject reset with weak password", async () => {
    const token = await resetService.createResetToken(TEST_USER_ID);

    const result = await managementService.resetPassword({
      token,
      newPassword: "weak",
    });

    expect(result.success).toBe(false);
    expect(result.failureReason).toBeTruthy();
  });

  it("should accept valid password reset", async () => {
    const token = await resetService.createResetToken(TEST_USER_ID);

    const result = await managementService.resetPassword({
      token,
      newPassword: "ResetSecureP@ss1!",
    });

    expect(result.success).toBe(true);
    expect(result.failureReason).toBeNull();
  });

  it("should consume token after successful reset", async () => {
    const token = await resetService.createResetToken(TEST_USER_ID);

    await managementService.resetPassword({
      token,
      newPassword: "ResetPassword1@!",
    });

    const replayed = await managementService.resetPassword({
      token,
      newPassword: "AnotherResetP@ss1!",
    });

    expect(replayed.success).toBe(false);
    expect(replayed.failureReason).toBe("Invalid or expired reset token");
  });
});
