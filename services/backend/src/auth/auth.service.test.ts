import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import argon2 from "argon2";
import { AuthService, AUTH_PROVIDERS } from "./auth.service.js";
import { AuthProviderType } from "./interfaces/auth-provider.interface.js";
import { EmailPasswordProvider } from "./providers/email-password.provider.js";
import { PasswordHashingService } from "./password/services/password-hashing.service.js";
import { OAuth2Provider } from "./providers/oauth2.provider.js";
import { OpenIDConnectProvider } from "./providers/openid-connect.provider.js";
import { ApiKeyProvider } from "./providers/api-key.provider.js";
import type { UserRecord, UserRepository } from "./interfaces/user-repository.interface.js";

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "SecurePass123!";
const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

class MockUserRepository implements UserRepository {
  private readonly users: Map<string, UserRecord>;

  public constructor() {
    this.users = new Map();
  }

  public addUser(email: string, passwordHash: string): void {
    this.users.set(email.toLowerCase(), {
      id: TEST_USER_ID,
      email: email.toLowerCase(),
      passwordHash,
      displayName: "Test User",
      status: "active",
    });
  }

  public findByEmail(email: string): Promise<UserRecord | null> {
    return Promise.resolve(this.users.get(email.toLowerCase()) ?? null);
  }

  public findById(id: string): Promise<UserRecord | null> {
    for (const user of this.users.values()) {
      if (user.id === id) {
        return Promise.resolve(user);
      }
    }

    return Promise.resolve(null);
  }
}

describe("OAuth2Provider", () => {
  let provider: OAuth2Provider;

  beforeAll(() => {
    provider = new OAuth2Provider();
  });

  it("should return not-implemented failure", async () => {
    const result = await provider.authenticate({});
    expect(result.success).toBe(false);
    expect(result.provider).toBe(AuthProviderType.OAuth2);
    expect(result.failureReason).toContain("not yet implemented");
  });
});

describe("OpenIDConnectProvider", () => {
  let provider: OpenIDConnectProvider;

  beforeAll(() => {
    provider = new OpenIDConnectProvider();
  });

  it("should return not-implemented failure", async () => {
    const result = await provider.authenticate({});
    expect(result.success).toBe(false);
    expect(result.provider).toBe(AuthProviderType.OpenIDConnect);
    expect(result.failureReason).toContain("not yet implemented");
  });
});

describe("ApiKeyProvider", () => {
  let provider: ApiKeyProvider;

  beforeAll(() => {
    provider = new ApiKeyProvider();
  });

  it("should return not-implemented failure", async () => {
    const result = await provider.authenticate({});
    expect(result.success).toBe(false);
    expect(result.provider).toBe(AuthProviderType.ApiKey);
    expect(result.failureReason).toContain("not yet implemented");
  });
});

describe("EmailPasswordProvider", () => {
  let provider: EmailPasswordProvider;
  let mockRepo: MockUserRepository;

  beforeAll(() => {
    mockRepo = new MockUserRepository();
    provider = new EmailPasswordProvider(mockRepo, new PasswordHashingService());
  });

  it("should reject missing email", async () => {
    const result = await provider.authenticate({ password: TEST_PASSWORD });
    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("Email and password are required");
  });

  it("should reject missing password", async () => {
    const result = await provider.authenticate({ email: TEST_EMAIL });
    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("Email and password are required");
  });

  it("should reject empty credentials", async () => {
    const result = await provider.authenticate({ email: "", password: "" });
    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("Email and password are required");
  });

  it("should reject non-existent user", async () => {
    const result = await provider.authenticate({
      email: "unknown@example.com",
      password: TEST_PASSWORD,
    });

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("Invalid email or password");
  });

  it("should authenticate with valid credentials", async () => {
    const hash = await argon2.hash(TEST_PASSWORD, { type: argon2.argon2id });
    mockRepo.addUser(TEST_EMAIL, hash);

    const result = await provider.authenticate({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBe(TEST_USER_ID);
    expect(result.provider).toBe(AuthProviderType.EmailPassword);
    expect(result.failureReason).toBeNull();
  });

  it("should authenticate case-insensitively", async () => {
    const result = await provider.authenticate({
      email: "TEST@EXAMPLE.COM",
      password: TEST_PASSWORD,
    });

    expect(result.success).toBe(true);
  });

  it("should trim whitespace from email", async () => {
    const result = await provider.authenticate({
      email: "  test@example.com  ",
      password: TEST_PASSWORD,
    });

    expect(result.success).toBe(true);
  });

  it("should reject wrong password", async () => {
    const result = await provider.authenticate({
      email: TEST_EMAIL,
      password: "WrongPassword123!",
    });

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe("Invalid email or password");
  });
});

describe("AuthService", () => {
  let authService: AuthService;
  let moduleRef: TestingModule;
  let emailPasswordProvider: EmailPasswordProvider;
  let mockRepo: MockUserRepository;

  beforeAll(async () => {
    mockRepo = new MockUserRepository();
    emailPasswordProvider = new EmailPasswordProvider(mockRepo, new PasswordHashingService());

    moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AUTH_PROVIDERS,
          useValue: [
            emailPasswordProvider,
            new OAuth2Provider(),
            new OpenIDConnectProvider(),
            new ApiKeyProvider(),
          ],
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it("should authenticate via email/password provider", async () => {
    const hash = await argon2.hash(TEST_PASSWORD, { type: argon2.argon2id });
    mockRepo.addUser("auth-service-test@example.com", hash);

    const result = await authService.authenticate(AuthProviderType.EmailPassword, {
      email: "auth-service-test@example.com",
      password: TEST_PASSWORD,
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe(AuthProviderType.EmailPassword);
  });

  it("should return failure for unregistered provider type", async () => {
    const unknownType = "unknown_provider" as AuthProviderType;
    const result = await authService.authenticate(unknownType, {});

    expect(result.success).toBe(false);
    expect(result.failureReason).toContain("No authentication provider registered");
  });

  it("should return failure for OAuth2 stub", async () => {
    const result = await authService.authenticate(AuthProviderType.OAuth2, {});
    expect(result.success).toBe(false);
  });

  it("should return failure for OpenID Connect stub", async () => {
    const result = await authService.authenticate(AuthProviderType.OpenIDConnect, {});
    expect(result.success).toBe(false);
  });

  it("should return failure for API Key stub", async () => {
    const result = await authService.authenticate(AuthProviderType.ApiKey, {});
    expect(result.success).toBe(false);
  });
});
