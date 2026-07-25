import { describe, it, expect, beforeEach } from "vitest";
import { AuthorizationService } from "./authorization.service.js";

describe("AuthorizationService", () => {
  let service: AuthorizationService;

  beforeEach(() => {
    service = new AuthorizationService();
  });

  describe("checkPermission", () => {
    it("should return true for Owner with any permission", () => {
      expect(service.checkPermission("owner", "billing:manage")).toBe(true);
      expect(service.checkPermission("owner", "administration:manage")).toBe(true);
    });

    it("should return true for Admin with any permission", () => {
      expect(service.checkPermission("admin", "billing:manage")).toBe(true);
      expect(service.checkPermission("admin", "administration:manage")).toBe(true);
    });

    it("should return true for Manager with workspace:create", () => {
      expect(service.checkPermission("manager", "workspaces:create")).toBe(true);
    });

    it("should return false for Manager with billing:manage", () => {
      expect(service.checkPermission("manager", "billing:manage")).toBe(false);
    });

    it("should return true for User with chats:create", () => {
      expect(service.checkPermission("user", "chats:create")).toBe(true);
    });

    it("should return false for User with workspaces:create", () => {
      expect(service.checkPermission("user", "workspaces:create")).toBe(false);
    });

    it("should return true for Viewer with workspaces:read", () => {
      expect(service.checkPermission("viewer", "workspaces:read")).toBe(true);
    });

    it("should return false for Viewer with chats:create", () => {
      expect(service.checkPermission("viewer", "chats:create")).toBe(false);
    });

    it("should return false for an unknown role", () => {
      expect(service.checkPermission("unknown-role", "workspaces:read")).toBe(false);
    });

    it("should return false for an unknown permission", () => {
      expect(service.checkPermission("admin", "nonexistent:action")).toBe(false);
    });

    it("should return false for empty permission string", () => {
      expect(service.checkPermission("admin", "")).toBe(false);
    });

    it("should be case sensitive for role matching", () => {
      expect(service.checkPermission("Owner", "workspaces:read")).toBe(false);
    });
  });

  describe("requireRole", () => {
    it("should return true when user role equals required role", () => {
      expect(service.requireRole("owner", "owner")).toBe(true);
      expect(service.requireRole("admin", "admin")).toBe(true);
    });

    it("should return true when user role is higher than required", () => {
      expect(service.requireRole("owner", "admin")).toBe(true);
      expect(service.requireRole("admin", "manager")).toBe(true);
      expect(service.requireRole("manager", "user")).toBe(true);
      expect(service.requireRole("user", "viewer")).toBe(true);
    });

    it("should return true when Owner requires any role", () => {
      expect(service.requireRole("owner", "viewer")).toBe(true);
      expect(service.requireRole("owner", "user")).toBe(true);
      expect(service.requireRole("owner", "manager")).toBe(true);
      expect(service.requireRole("owner", "admin")).toBe(true);
    });

    it("should return false when User requires Admin", () => {
      expect(service.requireRole("user", "admin")).toBe(false);
    });

    it("should return false when Viewer requires Owner", () => {
      expect(service.requireRole("viewer", "owner")).toBe(false);
    });

    it("should return false when Viewer requires Manager", () => {
      expect(service.requireRole("viewer", "manager")).toBe(false);
    });

    it("should return false for unknown user role", () => {
      expect(service.requireRole("unknown-role", "admin")).toBe(false);
    });

    it("should return false for unknown required role", () => {
      expect(service.requireRole("admin", "unknown-role")).toBe(false);
    });
  });

  describe("getEffectivePermissions", () => {
    it("should return many permissions for Owner", () => {
      const permissions = service.getEffectivePermissions("owner");
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain("billing:manage");
      expect(permissions).toContain("authentication:read");
    });

    it("should return many permissions for Admin", () => {
      const permissions = service.getEffectivePermissions("admin");
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain("administration:manage");
    });

    it("should return limited permissions for Viewer", () => {
      const permissions = service.getEffectivePermissions("viewer");
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain("workspaces:read");
      expect(permissions).not.toContain("workspaces:create");
      expect(permissions).not.toContain("files:create");
    });

    it("should return empty array for unknown role", () => {
      const permissions = service.getEffectivePermissions("unknown-role");
      expect(permissions).toHaveLength(0);
    });

    it("should contain only valid permission string formats", () => {
      const permissions = service.getEffectivePermissions("manager");
      const pattern = /^[a-z_]+:(create|read|update|delete|manage)$/;
      for (const perm of permissions) {
        expect(perm).toMatch(pattern);
      }
    });

    it("should have no duplicate permissions for a role", () => {
      const permissions = service.getEffectivePermissions("user");
      const unique = new Set(permissions);
      expect(unique.size).toBe(permissions.length);
    });

    it("should have Viewer permissions as a subset of Manager", () => {
      const viewer = service.getEffectivePermissions("viewer");
      const manager = service.getEffectivePermissions("manager");
      for (const perm of viewer) {
        expect(manager).toContain(perm);
      }
    });
  });
});
