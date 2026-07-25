import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaMembershipRepository } from "./prisma-membership.repository.js";
import type { PrismaService } from "../../prisma/prisma.service.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { MembershipStatus } from "../interfaces/membership-status.enum.js";

function createMockPrisma(): PrismaService {
  return {
    membership: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaService;
}

const DB_ROW = {
  id: "mem-1",
  organizationId: "org-1",
  userId: "user-1",
  role: "Owner",
  status: "Active",
  joinedAt: new Date("2026-01-01"),
};

describe("PrismaMembershipRepository", () => {
  let mockPrisma: PrismaService;
  let repo: PrismaMembershipRepository;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    repo = new PrismaMembershipRepository(mockPrisma);
  });

  describe("findById", () => {
    it("should return membership when found", async () => {
      (mockPrisma.membership.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(DB_ROW);
      const result = await repo.findById("mem-1");
      expect(result).not.toBeNull();
      expect(result?.role).toBe(MembershipRole.Owner);
      expect(result?.status).toBe(MembershipStatus.Active);
    });

    it("should return null when not found", async () => {
      (mockPrisma.membership.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const result = await repo.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByOrganizationId", () => {
    it("should return memberships for organization", async () => {
      (mockPrisma.membership.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([DB_ROW]);
      const results = await repo.findByOrganizationId("org-1");
      expect(results).toHaveLength(1);
      expect(results[0]?.userId).toBe("user-1");
    });
  });

  describe("findByUserId", () => {
    it("should return memberships for user", async () => {
      (mockPrisma.membership.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([DB_ROW]);
      const results = await repo.findByUserId("user-1");
      expect(results).toHaveLength(1);
    });
  });

  describe("findByOrganizationAndUser", () => {
    it("should return membership when found", async () => {
      (mockPrisma.membership.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(DB_ROW);
      const result = await repo.findByOrganizationAndUser("org-1", "user-1");
      expect(result).not.toBeNull();
    });

    it("should return null when not found", async () => {
      (mockPrisma.membership.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const result = await repo.findByOrganizationAndUser("org-1", "unknown");
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create membership with role/status mapping", async () => {
      (mockPrisma.membership.create as ReturnType<typeof vi.fn>).mockResolvedValue(DB_ROW);
      const result = await repo.create({
        organizationId: "org-1",
        userId: "user-1",
        role: MembershipRole.Owner,
        status: MembershipStatus.Active,
      });
      expect(result.role).toBe(MembershipRole.Owner);
    });
  });

  describe("update", () => {
    it("should update role with mapping", async () => {
      const updatedRow = { ...DB_ROW, role: "Admin" };
      (mockPrisma.membership.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedRow);
      const result = await repo.update("mem-1", { role: MembershipRole.Admin });
      expect(result.role).toBe(MembershipRole.Admin);
    });

    it("should update status with mapping", async () => {
      const updatedRow = { ...DB_ROW, status: "Invited" };
      (mockPrisma.membership.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedRow);
      const result = await repo.update("mem-1", { status: MembershipStatus.Invited });
      expect(result.status).toBe(MembershipStatus.Invited);
    });
  });

  describe("delete", () => {
    it("should delete membership", async () => {
      (mockPrisma.membership.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      await expect(repo.delete("mem-1")).resolves.toBeUndefined();
    });
  });
});
