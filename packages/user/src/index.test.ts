import { describe, it, expect } from "vitest";
import { UserId, Email, PasswordHash } from "./value-objects.js";
import { UserStatus, isValidUserStatus } from "./user-status.js";
import { Profile } from "./profile.js";
import { createUserPreferences } from "./preferences.js";
import { createAuditFields, touchAuditFields } from "./audit-fields.js";
import { User } from "./user.entity.js";
import type { CreateUserParams } from "./user.entity.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_EMAIL = "test@example.com";
const VALID_PASSWORD_HASH = "x".repeat(60);

function validUserParams(overrides?: Partial<CreateUserParams>): CreateUserParams {
  return {
    id: VALID_UUID,
    email: VALID_EMAIL,
    passwordHash: VALID_PASSWORD_HASH,
    displayName: "Test User",
    status: undefined,
    profile: undefined,
    preferences: undefined,
    ...overrides,
  };
}

describe("UserId", () => {
  it("should create from valid UUID", () => {
    const id = UserId.create(VALID_UUID);
    expect(id.value).toBe(VALID_UUID);
  });

  it("should throw for invalid UUID", () => {
    expect(() => UserId.create("not-a-uuid")).toThrow("Invalid UUID");
    expect(() => UserId.create("")).toThrow("Invalid UUID");
  });

  it("should correctly compare equality", () => {
    const a = UserId.create(VALID_UUID);
    const b = UserId.create(VALID_UUID);
    const c = UserId.create("550e8400-e29b-41d4-a716-446655440001");

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});

describe("Email", () => {
  it("should create from valid email", () => {
    const email = Email.create("Test@Example.COM");
    expect(email.value).toBe("test@example.com");
  });

  it("should trim whitespace", () => {
    const email = Email.create("  user@example.com  ");
    expect(email.value).toBe("user@example.com");
  });

  it("should throw for invalid email", () => {
    expect(() => Email.create("not-email")).toThrow("Invalid email");
    expect(() => Email.create("")).toThrow("Invalid email");
    expect(() => Email.create("@domain.com")).toThrow("Invalid email");
  });

  it("should correctly compare equality", () => {
    const a = Email.create("user@example.com");
    const b = Email.create("USER@EXAMPLE.COM");
    const c = Email.create("other@example.com");

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});

describe("PasswordHash", () => {
  it("should create from valid hash", () => {
    const hash = PasswordHash.create(VALID_PASSWORD_HASH);
    expect(hash.value).toBe(VALID_PASSWORD_HASH);
  });

  it("should throw for hash too short", () => {
    expect(() => PasswordHash.create("x".repeat(59))).toThrow("too short");
    expect(() => PasswordHash.create("")).toThrow("too short");
  });

  it("should correctly compare equality", () => {
    const a = PasswordHash.create(VALID_PASSWORD_HASH);
    const b = PasswordHash.create(VALID_PASSWORD_HASH);
    const c = PasswordHash.create("y".repeat(60));

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});

describe("UserStatus", () => {
  it("should have all expected statuses", () => {
    expect(UserStatus.Active).toBe("active");
    expect(UserStatus.Inactive).toBe("inactive");
    expect(UserStatus.Suspended).toBe("suspended");
    expect(UserStatus.Deleted).toBe("deleted");
  });

  it("should validate correct status values", () => {
    expect(isValidUserStatus("active")).toBe(true);
    expect(isValidUserStatus("inactive")).toBe(true);
    expect(isValidUserStatus("suspended")).toBe(true);
    expect(isValidUserStatus("deleted")).toBe(true);
  });

  it("should reject invalid status values", () => {
    expect(isValidUserStatus("")).toBe(false);
    expect(isValidUserStatus("unknown")).toBe(false);
    expect(isValidUserStatus("banned")).toBe(false);
  });
});

describe("Profile", () => {
  it("should create with required fields only", () => {
    const profile = Profile.create({ displayName: "John" });
    expect(profile.displayName).toBe("John");
    expect(profile.avatarUrl).toBeUndefined();
    expect(profile.bio).toBeUndefined();
    expect(profile.timezone).toBeUndefined();
  });

  it("should trim display name", () => {
    const profile = Profile.create({ displayName: "  John  " });
    expect(profile.displayName).toBe("John");
  });

  it("should throw for empty display name", () => {
    expect(() => Profile.create({ displayName: "" })).toThrow("non-empty string");
    expect(() => Profile.create({ displayName: "   " })).toThrow("non-empty string");
  });

  it("should create with all optional fields", () => {
    const profile = Profile.create({
      displayName: "John",
      avatarUrl: "https://example.com/avatar.png",
      bio: "Hello!",
      timezone: "UTC",
    });

    expect(profile.displayName).toBe("John");
    expect(profile.avatarUrl).toBe("https://example.com/avatar.png");
    expect(profile.bio).toBe("Hello!");
    expect(profile.timezone).toBe("UTC");
  });

  it("should throw for invalid avatar URL", () => {
    expect(() => Profile.create({ displayName: "John", avatarUrl: "not-a-url" })).toThrow(
      "Invalid avatar URL",
    );
  });

  it("should throw for invalid timezone", () => {
    expect(() => Profile.create({ displayName: "John", timezone: "Mars/ Olympus" })).toThrow(
      "Invalid timezone",
    );
  });

  it("should update with partial changes", () => {
    const profile = Profile.create({
      displayName: "John",
      bio: "Hello!",
    });

    const updated = profile.update({ bio: "Updated bio" });
    expect(updated.displayName).toBe("John");
    expect(updated.bio).toBe("Updated bio");
    expect(updated.avatarUrl).toBeUndefined();
  });
});

describe("UserPreferences", () => {
  it("should create with defaults when no params given", () => {
    const prefs = createUserPreferences();
    expect(prefs.theme).toBe("system");
    expect(prefs.locale).toBe("en-US");
    expect(prefs.emailNotifications).toBe(true);
    expect(prefs.pushNotifications).toBe(true);
  });

  it("should create with partial overrides", () => {
    const prefs = createUserPreferences({ theme: "dark", emailNotifications: false });
    expect(prefs.theme).toBe("dark");
    expect(prefs.locale).toBe("en-US");
    expect(prefs.emailNotifications).toBe(false);
    expect(prefs.pushNotifications).toBe(true);
  });

  it("should throw for unsupported locale", () => {
    expect(() => createUserPreferences({ locale: "xx-XX" })).toThrow("Unsupported locale");
  });
});

describe("AuditFields", () => {
  it("should create with same createdAt and updatedAt", () => {
    const audit = createAuditFields();
    expect(audit.createdAt).toBeInstanceOf(Date);
    expect(audit.updatedAt).toBeInstanceOf(Date);
    expect(audit.updatedAt.getTime()).toBeGreaterThanOrEqual(audit.createdAt.getTime());
  });

  it("should preserve createdAt on touch", () => {
    const audit = createAuditFields();
    const touched = touchAuditFields(audit);

    expect(touched.createdAt).toBe(audit.createdAt);
    expect(touched.updatedAt.getTime()).toBeGreaterThanOrEqual(audit.createdAt.getTime());
  });
});

describe("User", () => {
  it("should create a valid user", () => {
    const user = User.create(validUserParams());

    expect(user.id.value).toBe(VALID_UUID);
    expect(user.email.value).toBe(VALID_EMAIL);
    expect(user.passwordHash.value).toBe(VALID_PASSWORD_HASH);
    expect(user.displayName).toBe("Test User");
    expect(user.status).toBe(UserStatus.Active);
    expect(user.profile.displayName).toBe("Test User");
    expect(user.preferences.theme).toBe("system");
    expect(user.audit.createdAt).toBeInstanceOf(Date);
  });

  it("should use provided status", () => {
    const user = User.create(validUserParams({ status: "inactive" }));
    expect(user.status).toBe(UserStatus.Inactive);
  });

  it("should use provided profile", () => {
    const user = User.create(
      validUserParams({ profile: { displayName: "Custom", bio: "My bio", timezone: "UTC" } }),
    );

    expect(user.profile.displayName).toBe("Test User");
    expect(user.profile.bio).toBe("My bio");
    expect(user.profile.timezone).toBe("UTC");
  });

  it("should use provided preferences", () => {
    const user = User.create(
      validUserParams({
        preferences: {
          theme: "dark",
          locale: "de-DE",
          emailNotifications: false,
          pushNotifications: false,
        },
      }),
    );

    expect(user.preferences.theme).toBe("dark");
    expect(user.preferences.locale).toBe("de-DE");
    expect(user.preferences.emailNotifications).toBe(false);
    expect(user.preferences.pushNotifications).toBe(false);
  });

  it("should throw for invalid email on creation", () => {
    expect(() => User.create(validUserParams({ email: "invalid" }))).toThrow("Invalid email");
  });

  it("should throw for invalid UUID on creation", () => {
    expect(() => User.create(validUserParams({ id: "bad" }))).toThrow("Invalid UUID");
  });

  it("should throw for empty displayName on creation", () => {
    expect(() => User.create(validUserParams({ displayName: "" }))).toThrow("non-empty string");
  });

  describe("updateDisplayName", () => {
    it("should update display name", () => {
      const user = User.create(validUserParams());
      user.updateDisplayName("New Name");
      expect(user.displayName).toBe("New Name");
    });

    it("should be no-op for same name", () => {
      const user = User.create(validUserParams());
      user.updateDisplayName("Test User");
      expect(user.displayName).toBe("Test User");
    });
  });

  describe("changePassword", () => {
    it("should change password hash", () => {
      const user = User.create(validUserParams());
      const newHash = PasswordHash.create("z".repeat(60));
      user.changePassword(newHash);
      expect(user.passwordHash.value).toBe("z".repeat(60));
    });

    it("should throw for same password hash", () => {
      const user = User.create(validUserParams());
      const sameHash = PasswordHash.create(VALID_PASSWORD_HASH);
      expect(() => {
        user.changePassword(sameHash);
      }).toThrow("must differ");
    });
  });

  describe("suspend / activate / markDeleted", () => {
    it("should suspend an active user", () => {
      const user = User.create(validUserParams());
      user.suspend();
      expect(user.status).toBe(UserStatus.Suspended);
    });

    it("should throw when suspending an already suspended user", () => {
      const user = User.create(validUserParams());
      user.suspend();
      expect(() => {
        user.suspend();
      }).toThrow("already suspended");
    });

    it("should throw when suspending a deleted user", () => {
      const user = User.create(validUserParams());
      user.markDeleted();
      expect(() => {
        user.suspend();
      }).toThrow("Cannot suspend a deleted user");
    });

    it("should activate a suspended user", () => {
      const user = User.create(validUserParams());
      user.suspend();
      user.activate();
      expect(user.status).toBe(UserStatus.Active);
    });

    it("should be no-op activating an active user", () => {
      const user = User.create(validUserParams());
      user.activate();
      expect(user.status).toBe(UserStatus.Active);
    });

    it("should throw when activating a deleted user", () => {
      const user = User.create(validUserParams());
      user.markDeleted();
      expect(() => {
        user.activate();
      }).toThrow("Cannot activate a deleted user");
    });

    it("should mark user as deleted", () => {
      const user = User.create(validUserParams());
      user.markDeleted();
      expect(user.status).toBe(UserStatus.Deleted);
    });

    it("should be no-op when deleting an already deleted user", () => {
      const user = User.create(validUserParams());
      user.markDeleted();
      user.markDeleted();
      expect(user.status).toBe(UserStatus.Deleted);
    });
  });

  describe("updateProfile", () => {
    it("should update profile fields", () => {
      const user = User.create(validUserParams());
      user.updateProfile({ bio: "New bio", avatarUrl: "https://example.com/pic.jpg" });

      expect(user.profile.bio).toBe("New bio");
      expect(user.profile.avatarUrl).toBe("https://example.com/pic.jpg");
    });

    it("should preserve unchanged fields", () => {
      const user = User.create(
        validUserParams({
          displayName: "Original",
          profile: { displayName: "Original", bio: "Original bio" },
        }),
      );

      user.updateProfile({ bio: "Updated bio" });
      expect(user.profile.displayName).toBe("Original");
      expect(user.profile.bio).toBe("Updated bio");
    });
  });

  describe("updatePreferences", () => {
    it("should update preference fields", () => {
      const user = User.create(validUserParams());
      user.updatePreferences({ theme: "dark", emailNotifications: false });

      expect(user.preferences.theme).toBe("dark");
      expect(user.preferences.emailNotifications).toBe(false);
    });

    it("should preserve unchanged preferences", () => {
      const user = User.create(validUserParams({ preferences: { locale: "de-DE" } }));
      user.updatePreferences({ theme: "light" });

      expect(user.preferences.theme).toBe("light");
      expect(user.preferences.locale).toBe("de-DE");
    });
  });

  describe("audit tracking", () => {
    it("should update audit on domain changes", () => {
      const user = User.create(validUserParams());
      const originalUpdatedAt = user.audit.updatedAt;

      user.updateDisplayName("New Name");
      expect(user.audit.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });
});
