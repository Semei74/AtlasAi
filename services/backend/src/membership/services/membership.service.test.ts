import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException, ForbiddenException } from "@nestjs/common";
import { MembershipService } from "./membership.service.js";
import { MEMBERSHIP_REPOSITORY } from "../interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../interfaces/membership-repository.interface.js";
import type { Membership } from "../interfaces/membership.interface.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { MembershipStatus } from "../interfaces/membership-status.enum.js";
import type { CreateMembershipDto } from "../dto/create-membership.dto.js";
import type { UpdateMembershipDto } from "../dto/update-membership.dto.js";

const TEST_USER_ID = "user-123";
const TEST_ORG_ID = "org-456";
const TEST_MEMBERSHIP_ID = "membership-1";
const TARGET_USER_ID = "target-user-789";

function createMockMembership(overrides?: Partial<Membership>): Membership {
  return {
    id: TEST_MEMBERSHIP_ID,
    organizationId: TEST_ORG_ID,
    userId: TEST_USER_ID,
    role: MembershipRole.Owner,
    status: MembershipStatus.Active,
    joinedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

class MockMembershipRepository implements MembershipRepository {
  public memberships = new Map<string, Membership>();

  public findById(id: string): Promise<Membership | null> {
    return Promise.resolve(this.memberships.get(id) ?? null);
  }

  public findByOrganizationId(organizationId: string): Promise<Membership[]> {
    return Promise.resolve(
      Array.from(this.memberships.values()).filter((m) => m.organizationId === organizationId),
    );
  }

  public findByUserId(userId: string): Promise<Membership[]> {
    return Promise.resolve(
      Array.from(this.memberships.values()).filter((m) => m.userId === userId),
    );
  }

  public findByOrganizationAndUser(
    organizationId: string,
    userId: string,
  ): Promise<Membership | null> {
    for (const m of this.memberships.values()) {
      if (m.organizationId === organizationId && m.userId === userId) return Promise.resolve(m);
    }
    return Promise.resolve(null);
  }

  public create(data: Omit<Membership, "id" | "joinedAt">): Promise<Membership> {
    const membership: Membership = {
      id: "membership-" + String(this.memberships.size + 1),
      ...data,
      joinedAt: new Date(),
    };
    this.memberships.set(membership.id, membership);
    return Promise.resolve(membership);
  }

  public update(id: string, changes: Partial<Omit<Membership, "id">>): Promise<Membership> {
    const existing = this.memberships.get(id);
    if (existing === undefined) return Promise.reject(new Error("Not found"));
    const updated = { ...existing, ...changes };
    const result: Membership = updated;
    this.memberships.set(id, result);
    return Promise.resolve(result);
  }

  public delete(id: string): Promise<void> {
    this.memberships.delete(id);
    return Promise.resolve();
  }
}

describe("MembershipService", () => {
  let membershipService: MembershipService;
  let mockRepo: MockMembershipRepository;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    mockRepo = new MockMembershipRepository();

    moduleRef = await Test.createTestingModule({
      providers: [MembershipService, { provide: MEMBERSHIP_REPOSITORY, useValue: mockRepo }],
    }).compile();

    membershipService = moduleRef.get<MembershipService>(MembershipService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    mockRepo.memberships.clear();
  });

  describe("create", () => {
    const createDto: CreateMembershipDto = {
      userId: TARGET_USER_ID,
      role: MembershipRole.Member,
    };

    it("should create a membership when current user is admin or owner", async () => {
      mockRepo.memberships.set(TEST_MEMBERSHIP_ID, createMockMembership());

      const result = await membershipService.create(TEST_ORG_ID, createDto, TEST_USER_ID);

      expect(result.organizationId).toBe(TEST_ORG_ID);
      expect(result.userId).toBe(TARGET_USER_ID);
      expect(result.role).toBe(MembershipRole.Member);
      expect(result.status).toBe(MembershipStatus.Active);
    });

    it("should throw ConflictException when user is already a member", async () => {
      mockRepo.memberships.set(TEST_MEMBERSHIP_ID, createMockMembership());
      mockRepo.memberships.set(
        "membership-existing",
        createMockMembership({
          id: "membership-existing",
          userId: TARGET_USER_ID,
        }),
      );

      await expect(membershipService.create(TEST_ORG_ID, createDto, TEST_USER_ID)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw ForbiddenException when current user is not admin or owner", async () => {
      mockRepo.memberships.set(
        TEST_MEMBERSHIP_ID,
        createMockMembership({ role: MembershipRole.Member }),
      );

      await expect(membershipService.create(TEST_ORG_ID, createDto, TEST_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw ForbiddenException when current user is not a member", async () => {
      await expect(membershipService.create(TEST_ORG_ID, createDto, TEST_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should allow admin to create membership", async () => {
      mockRepo.memberships.set(
        TEST_MEMBERSHIP_ID,
        createMockMembership({ role: MembershipRole.Admin }),
      );

      const result = await membershipService.create(TEST_ORG_ID, createDto, TEST_USER_ID);

      expect(result.role).toBe(MembershipRole.Member);
    });
  });

  describe("findByOrganizationId", () => {
    it("should return memberships for an organization", async () => {
      mockRepo.memberships.set(TEST_MEMBERSHIP_ID, createMockMembership());
      mockRepo.memberships.set(
        "membership-2",
        createMockMembership({
          id: "membership-2",
          userId: TARGET_USER_ID,
        }),
      );

      const result = await membershipService.findByOrganizationId(TEST_ORG_ID, TEST_USER_ID);

      expect(result).toHaveLength(2);
    });

    it("should throw ForbiddenException when user is not a member", async () => {
      await expect(
        membershipService.findByOrganizationId(TEST_ORG_ID, TEST_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should return memberships including the current user", async () => {
      mockRepo.memberships.set(
        TEST_MEMBERSHIP_ID,
        createMockMembership({ organizationId: "empty-org" }),
      );

      const memberships = await membershipService.findByOrganizationId("empty-org", TEST_USER_ID);

      expect(memberships).toHaveLength(1);
      expect(memberships[0]?.userId).toBe(TEST_USER_ID);
    });
  });

  describe("update", () => {
    const updateDto: UpdateMembershipDto = { role: MembershipRole.Admin };

    it("should update a membership role", async () => {
      mockRepo.memberships.set(
        "current-membership",
        createMockMembership({ id: "current-membership" }),
      );
      mockRepo.memberships.set(
        TEST_MEMBERSHIP_ID,
        createMockMembership({ role: MembershipRole.Member }),
      );

      const result = await membershipService.update(TEST_MEMBERSHIP_ID, updateDto, TEST_USER_ID);

      expect(result.role).toBe(MembershipRole.Admin);
    });

    it("should throw NotFoundException when membership does not exist", async () => {
      await expect(
        membershipService.update("nonexistent", updateDto, TEST_USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException when current user is not admin or owner", async () => {
      mockRepo.memberships.set(
        TEST_MEMBERSHIP_ID,
        createMockMembership({ role: MembershipRole.Member }),
      );

      await expect(
        membershipService.update(TEST_MEMBERSHIP_ID, updateDto, TEST_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw ForbiddenException when trying to change the owner's role", async () => {
      mockRepo.memberships.set(
        TEST_MEMBERSHIP_ID,
        createMockMembership({ id: TEST_MEMBERSHIP_ID, role: MembershipRole.Owner }),
      );

      await expect(
        membershipService.update(TEST_MEMBERSHIP_ID, updateDto, TEST_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("delete", () => {
    it("should delete a membership", async () => {
      mockRepo.memberships.set(
        "target-membership",
        createMockMembership({
          id: "target-membership",
          userId: TARGET_USER_ID,
          role: MembershipRole.Member,
        }),
      );
      mockRepo.memberships.set(
        TEST_MEMBERSHIP_ID,
        createMockMembership({ role: MembershipRole.Admin }),
      );

      await membershipService.delete("target-membership", TEST_USER_ID);

      expect(mockRepo.memberships.has("target-membership")).toBe(false);
    });

    it("should throw NotFoundException when membership does not exist", async () => {
      await expect(membershipService.delete("nonexistent", TEST_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when trying to remove the owner", async () => {
      mockRepo.memberships.set(
        TEST_MEMBERSHIP_ID,
        createMockMembership({ role: MembershipRole.Owner }),
      );
      mockRepo.memberships.set(
        "admin-membership",
        createMockMembership({ id: "admin-membership", role: MembershipRole.Admin }),
      );

      await expect(membershipService.delete(TEST_MEMBERSHIP_ID, TEST_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
