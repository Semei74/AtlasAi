import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { MembershipController } from "./membership.controller.js";
import type { MembershipService } from "../services/membership.service.js";
import type { Membership } from "../interfaces/membership.interface.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { MembershipStatus } from "../interfaces/membership-status.enum.js";
import type { CreateMembershipDto } from "../dto/create-membership.dto.js";
import type { UpdateMembershipDto } from "../dto/update-membership.dto.js";

const TEST_USER_ID = "user-123";
const TEST_ORG_ID = "org-456";
const TEST_MEMBERSHIP_ID = "membership-1";

function createMockMembership(overrides?: Partial<Membership>): Membership {
  return {
    id: TEST_MEMBERSHIP_ID,
    organizationId: TEST_ORG_ID,
    userId: TEST_USER_ID,
    role: MembershipRole.Admin,
    status: MembershipStatus.Active,
    joinedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createRequestWithUser(userId: string): FastifyRequest {
  return { user: { sub: userId } } as unknown as FastifyRequest;
}

function createRequestWithoutUser(): FastifyRequest {
  return {} as FastifyRequest;
}

describe("MembershipController", () => {
  const mockMembership = createMockMembership();
  const mockCreate = vi.fn();
  const mockFindByOrgId = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();

  const mockService = {
    create: mockCreate,
    findByOrganizationId: mockFindByOrgId,
    update: mockUpdate,
    delete: mockDelete,
  } as unknown as MembershipService;

  const controller = new MembershipController(mockService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    const createDto: CreateMembershipDto = {
      userId: "target-user",
      role: MembershipRole.Member,
    };

    it("should create a membership", async () => {
      mockCreate.mockResolvedValue(mockMembership);

      const result = await controller.create(
        TEST_ORG_ID,
        createDto,
        createRequestWithUser(TEST_USER_ID),
      );

      expect(result.id).toBe(TEST_MEMBERSHIP_ID);
      expect(mockCreate).toHaveBeenCalledWith(TEST_ORG_ID, createDto, TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.create(TEST_ORG_ID, createDto, createRequestWithoutUser()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("findAll", () => {
    it("should return list of memberships", async () => {
      mockFindByOrgId.mockResolvedValue([mockMembership]);

      const result = await controller.findAll(TEST_ORG_ID, createRequestWithUser(TEST_USER_ID));

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(TEST_MEMBERSHIP_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.findAll(TEST_ORG_ID, createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("update", () => {
    const updateDto: UpdateMembershipDto = { role: MembershipRole.Admin };

    it("should update a membership role", async () => {
      mockUpdate.mockResolvedValue(mockMembership);

      const result = await controller.update(
        TEST_ORG_ID,
        TEST_MEMBERSHIP_ID,
        updateDto,
        createRequestWithUser(TEST_USER_ID),
      );

      expect(result.id).toBe(TEST_MEMBERSHIP_ID);
      expect(mockUpdate).toHaveBeenCalledWith(TEST_MEMBERSHIP_ID, updateDto, TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.update(TEST_ORG_ID, TEST_MEMBERSHIP_ID, updateDto, createRequestWithoutUser()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("delete", () => {
    it("should delete a membership", async () => {
      mockDelete.mockResolvedValue(undefined);

      await expect(
        controller.delete(TEST_ORG_ID, TEST_MEMBERSHIP_ID, createRequestWithUser(TEST_USER_ID)),
      ).resolves.toBeUndefined();

      expect(mockDelete).toHaveBeenCalledWith(TEST_MEMBERSHIP_ID, TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.delete(TEST_ORG_ID, TEST_MEMBERSHIP_ID, createRequestWithoutUser()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
