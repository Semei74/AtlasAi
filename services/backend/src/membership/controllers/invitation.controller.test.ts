import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { InvitationController } from "./invitation.controller.js";
import type { InvitationService } from "../services/invitation.service.js";
import type { Invitation } from "../interfaces/invitation.interface.js";
import { InvitationStatus } from "../interfaces/invitation-status.enum.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import type { CreateInvitationDto } from "../dto/create-invitation.dto.js";

const TEST_USER_ID = "user-123";
const TEST_USER_EMAIL = "user@example.com";
const TEST_ORG_ID = "org-456";
const TEST_INVITATION_ID = "invitation-1";
const TEST_EMAIL = "test@example.com";

function createMockInvitation(overrides?: Partial<Invitation>): Invitation {
  return {
    id: TEST_INVITATION_ID,
    organizationId: TEST_ORG_ID,
    email: TEST_EMAIL,
    inviterId: "inviter-456",
    role: MembershipRole.Member,
    status: InvitationStatus.Pending,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createRequestWithUser(userId: string, orgId?: string): FastifyRequest {
  return { user: { sub: userId, email: TEST_USER_EMAIL, organizationId: orgId ?? null } } as unknown as FastifyRequest;
}

function createRequestWithoutUser(): FastifyRequest {
  return {} as FastifyRequest;
}

describe("InvitationController", () => {
  const mockInvitation = createMockInvitation();
  const mockCreate = vi.fn();
  const mockFindByOrgId = vi.fn();
  const mockAccept = vi.fn();
  const mockRevoke = vi.fn();

  const mockService = {
    create: mockCreate,
    findByOrganizationId: mockFindByOrgId,
    accept: mockAccept,
    revoke: mockRevoke,
  } as unknown as InvitationService;

  const controller = new InvitationController(mockService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    const createDto: CreateInvitationDto = {
      email: TEST_EMAIL,
      role: MembershipRole.Member,
    };

    it("should create an invitation", async () => {
      mockCreate.mockResolvedValue(mockInvitation);

      const result = await controller.create(
        createDto,
        createRequestWithUser(TEST_USER_ID, TEST_ORG_ID),
      );

      expect(result.id).toBe(TEST_INVITATION_ID);
      expect(result.email).toBe(TEST_EMAIL);
      expect(mockCreate).toHaveBeenCalledWith(createDto, TEST_ORG_ID, TEST_USER_ID);
    });

    it("should use organizationId from JWT when tenant is not available", async () => {
      mockCreate.mockResolvedValue(mockInvitation);

      await controller.create(createDto, createRequestWithUser(TEST_USER_ID, TEST_ORG_ID));

      expect(mockCreate).toHaveBeenCalledWith(expect.anything(), TEST_ORG_ID, TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.create(createDto, createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("findAll", () => {
    it("should return list of invitations", async () => {
      mockFindByOrgId.mockResolvedValue([mockInvitation]);

      const result = await controller.findAll(createRequestWithUser(TEST_USER_ID, TEST_ORG_ID));

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(TEST_INVITATION_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.findAll(createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("accept", () => {
    it("should accept an invitation", async () => {
      mockAccept.mockResolvedValue(undefined);

      await expect(
        controller.accept(TEST_INVITATION_ID, createRequestWithUser(TEST_USER_ID)),
      ).resolves.toBeUndefined();

      expect(mockAccept).toHaveBeenCalledWith(TEST_INVITATION_ID, TEST_USER_ID, TEST_USER_EMAIL);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.accept(TEST_INVITATION_ID, createRequestWithoutUser()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("revoke", () => {
    it("should revoke an invitation", async () => {
      mockRevoke.mockResolvedValue(undefined);

      await expect(
        controller.revoke(TEST_INVITATION_ID, createRequestWithUser(TEST_USER_ID)),
      ).resolves.toBeUndefined();

      expect(mockRevoke).toHaveBeenCalledWith(TEST_INVITATION_ID, TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.revoke(TEST_INVITATION_ID, createRequestWithoutUser()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
