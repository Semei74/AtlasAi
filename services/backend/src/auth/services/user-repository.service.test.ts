import { describe, it, expect, beforeEach } from "vitest";
import { UserRepositoryService } from "./user-repository.service.js";

function createMockPrisma() {
  return {
    user: {
      findUnique: async () => null,
      create: async (args: unknown) => args,
      update: async (args: unknown) => args,
    },
  } as never;
}

describe("UserRepositoryService", () => {
  let service: UserRepositoryService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new UserRepositoryService(mockPrisma);
  });

  describe("findByEmail", () => {
    it("should query with lowercase trimmed email", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        passwordHash: "hash",
        displayName: "Test",
        status: "active",
        avatarUrl: null,
        bio: null,
        timezone: null,
        theme: "light",
        locale: "en",
        emailNotifications: true,
        pushNotifications: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma as any).user.findUnique = async ({ where }: any) => {
        expect(where.email).toBe("test@example.com");
        return mockUser;
      };

      const result = await service.findByEmail("  TEST@EXAMPLE.COM  ");
      expect(result).not.toBeNull();
      expect(result!.email).toBe("test@example.com");
    });

    it("should return null when not found", async () => {
      const result = await service.findByEmail("nonexistent@example.com");
      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        passwordHash: "hash",
        displayName: "Test",
        status: "active",
        avatarUrl: null,
        bio: null,
        timezone: null,
        theme: "light",
        locale: "en",
        emailNotifications: true,
        pushNotifications: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma as any).user.findUnique = async ({ where }: any) => {
        expect(where.id).toBe("user-1");
        return mockUser;
      };

      const result = await service.findById("user-1");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("user-1");
    });

    it("should return null when not found", async () => {
      const result = await service.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create user and return UserRecord", async () => {
      const input = {
        id: "user-1",
        email: "new@example.com",
        passwordHash: "hash",
        displayName: "New User",
        status: "active",
        avatarUrl: null as string | null,
        bio: null as string | null,
        timezone: null as string | null,
        theme: "dark",
        locale: "en",
        emailNotifications: true,
        pushNotifications: false,
      };

      const created = { ...input, createdAt: new Date(), updatedAt: new Date() };
      (mockPrisma as any).user.create = async () => created;

      const result = await service.create(input);
      expect(result.id).toBe("user-1");
      expect(result.email).toBe("new@example.com");
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("update", () => {
    it("should update specified fields", async () => {
      const updated = {
        id: "user-1",
        email: "updated@example.com",
        passwordHash: "newhash",
        displayName: "Old Name",
        status: "active",
        avatarUrl: null,
        bio: null,
        timezone: null,
        theme: "light",
        locale: "en",
        emailNotifications: true,
        pushNotifications: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma as any).user.update = async ({ where, data }: any) => {
        expect(where.id).toBe("user-1");
        expect(data.email).toBe("updated@example.com");
        expect(data.displayName).toBeUndefined();
        return updated;
      };

      const result = await service.update("user-1", { email: "updated@example.com" });
      expect(result.email).toBe("updated@example.com");
    });

    it("should allow updating passwordHash", async () => {
      let capturedData: any;
      (mockPrisma as any).user.update = async ({ data }: any) => {
        capturedData = data;
        return data;
      };

      await service.update("user-1", { passwordHash: "newhash" });
      expect(capturedData.passwordHash).toBe("newhash");
    });
  });
});
