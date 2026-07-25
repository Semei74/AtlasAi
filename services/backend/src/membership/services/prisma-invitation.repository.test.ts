import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaInvitationRepository } from "./prisma-invitation.repository.js";
import type { PrismaService } from "../../prisma/prisma.service.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { InvitationStatus } from "../interfaces/invitation-status.enum.js";

function createMockPrisma(): PrismaService {
  return {
    invitation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaService;
}

const DB_ROW = {
  id: "inv-1",
  organizationId: "org-1",
  workspaceId: null,
  email: "test@example.com",
  userId: null,
  inviterId: "admin-1",
  role: "Member",
  status: "Pending",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("PrismaInvitationRepository", () => {
  let mockPrisma: PrismaService;
  let repo: PrismaInvitationRepository;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    repo = new PrismaInvitationRepository(mockPrisma);
  });

  describe("findById", () => {
    it("should return invitation when found", async () => {
      (mockPrisma.invitation.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(DB_ROW);
      const result = await repo.findById("inv-1");
      expect(result).not.toBeNull();
      expect(result?.role).toBe(MembershipRole.Member);
      expect(result?.status).toBe(InvitationStatus.Pending);
      expect(result?.email).toBe("test@example.com");
    });

    it("should return null when not found", async () => {
      (mockPrisma.invitation.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const result = await repo.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByOrganizationId", () => {
    it("should return invitations for organization", async () => {
      (mockPrisma.invitation.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([DB_ROW]);
      const results = await repo.findByOrganizationId("org-1");
      expect(results).toHaveLength(1);
      expect(results[0]?.organizationId).toBe("org-1");
    });
  });

  describe("findByEmail", () => {
    it("should return invitations by email", async () => {
      (mockPrisma.invitation.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([DB_ROW]);
      const results = await repo.findByEmail("test@example.com");
      expect(results).toHaveLength(1);
    });
  });

  describe("create", () => {
    it("should create invitation with role/status mapping", async () => {
      (mockPrisma.invitation.create as ReturnType<typeof vi.fn>).mockResolvedValue(DB_ROW);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const result = await repo.create({
        organizationId: "org-1",
        inviterId: "admin-1",
        role: MembershipRole.Member,
        status: InvitationStatus.Pending,
        expiresAt,
      });
      expect(result.role).toBe(MembershipRole.Member);
      expect(result.status).toBe(InvitationStatus.Pending);
    });
  });

  describe("update", () => {
    it("should update status with mapping", async () => {
      const updatedRow = { ...DB_ROW, status: "Accepted" };
      (mockPrisma.invitation.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedRow);
      const result = await repo.update("inv-1", { status: InvitationStatus.Accepted });
      expect(result.status).toBe(InvitationStatus.Accepted);
    });

    it("should update role with mapping", async () => {
      const updatedRow = { ...DB_ROW, role: "Admin" };
      (mockPrisma.invitation.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedRow);
      const result = await repo.update("inv-1", { role: MembershipRole.Admin });
      expect(result.role).toBe(MembershipRole.Admin);
    });
  });

  describe("delete", () => {
    it("should delete invitation", async () => {
      (mockPrisma.invitation.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      await expect(repo.delete("inv-1")).resolves.toBeUndefined();
    });
  });
});
