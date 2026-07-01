import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InvitationService } from "./invitation.service.js";
import { INVITATION_REPOSITORY } from "../interfaces/invitation-repository.interface.js";
import type { InvitationRepository } from "../interfaces/invitation-repository.interface.js";
import { MEMBERSHIP_REPOSITORY } from "../interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../interfaces/membership-repository.interface.js";
import type { Invitation } from "../interfaces/invitation.interface.js";
import { InvitationStatus } from "../interfaces/invitation-status.enum.js";
import type { Membership } from "../interfaces/membership.interface.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { MembershipStatus } from "../interfaces/membership-status.enum.js";
import type { CreateInvitationDto } from "../dto/create-invitation.dto.js";

const TEST_USER_ID = "user-123";
const TEST_ORG_ID = "org-456";
const TEST_INVITATION_ID = "invitation-1";
const TEST_INVITER_ID = "inviter-456";
const TEST_EMAIL = "test@example.com";

function createMockInvitation(overrides?: Partial<Invitation>): Invitation {
  return {
    id: TEST_INVITATION_ID,
    organizationId: TEST_ORG_ID,
    inviterId: TEST_INVITER_ID,
    role: MembershipRole.Member,
    status: InvitationStatus.Pending,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createMockMembership(overrides?: Partial<Membership>): Membership {
  return {
    id: "membership-1",
    organizationId: TEST_ORG_ID,
    userId: TEST_USER_ID,
    role: MembershipRole.Owner,
    status: MembershipStatus.Active,
    joinedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

class MockInvitationRepository implements InvitationRepository {
  public invitations = new Map<string, Invitation>();

  public findById(id: string): Promise<Invitation | null> {
    return Promise.resolve(this.invitations.get(id) ?? null);
  }

  public findByOrganizationId(organizationId: string): Promise<Invitation[]> {
    return Promise.resolve(
      Array.from(this.invitations.values()).filter((i) => i.organizationId === organizationId),
    );
  }

  public findByEmail(email: string): Promise<Invitation[]> {
    return Promise.resolve(Array.from(this.invitations.values()).filter((i) => i.email === email));
  }

  public create(data: Omit<Invitation, "id" | "createdAt" | "updatedAt">): Promise<Invitation> {
    const invitation: Invitation = {
      id: "invitation-" + String(this.invitations.size + 1),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.invitations.set(invitation.id, invitation);
    return Promise.resolve(invitation);
  }

  public update(id: string, changes: Partial<Omit<Invitation, "id">>): Promise<Invitation> {
    const existing = this.invitations.get(id);
    if (existing === undefined) return Promise.reject(new Error("Not found"));
    const updated = { ...existing, ...changes, updatedAt: new Date() };
    const result: Invitation = updated;
    this.invitations.set(id, result);
    return Promise.resolve(result);
  }

  public delete(id: string): Promise<void> {
    this.invitations.delete(id);
    return Promise.resolve();
  }
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

describe("InvitationService", () => {
  let invitationService: InvitationService;
  let mockInvRepo: MockInvitationRepository;
  let mockMembershipRepo: MockMembershipRepository;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    mockInvRepo = new MockInvitationRepository();
    mockMembershipRepo = new MockMembershipRepository();

    moduleRef = await Test.createTestingModule({
      providers: [
        InvitationService,
        { provide: INVITATION_REPOSITORY, useValue: mockInvRepo },
        { provide: MEMBERSHIP_REPOSITORY, useValue: mockMembershipRepo },
      ],
    }).compile();

    invitationService = moduleRef.get<InvitationService>(InvitationService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    mockInvRepo.invitations.clear();
    mockMembershipRepo.memberships.clear();
  });

  describe("create", () => {
    const createDto: CreateInvitationDto = {
      email: TEST_EMAIL,
      role: MembershipRole.Member,
    };

    it("should create an invitation", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());

      const result = await invitationService.create(createDto, TEST_ORG_ID, TEST_USER_ID);

      expect(result.organizationId).toBe(TEST_ORG_ID);
      expect(result.email).toBe(TEST_EMAIL);
      expect(result.role).toBe(MembershipRole.Member);
      expect(result.status).toBe(InvitationStatus.Pending);
      expect(result.inviterId).toBe(TEST_USER_ID);
    });

    it("should throw BadRequestException when neither email nor userId is provided", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());

      await expect(
        invitationService.create({ role: MembershipRole.Member }, TEST_ORG_ID, TEST_USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw ForbiddenException when inviter is not admin or owner", async () => {
      mockMembershipRepo.memberships.set(
        "m1",
        createMockMembership({ role: MembershipRole.Member }),
      );

      await expect(invitationService.create(createDto, TEST_ORG_ID, TEST_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw ConflictException when user is already a member", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());
      mockMembershipRepo.memberships.set(
        "m2",
        createMockMembership({ id: "m2", userId: "target-user" }),
      );

      await expect(
        invitationService.create(
          { userId: "target-user", role: MembershipRole.Member },
          TEST_ORG_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException when a pending invitation already exists for the email", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());
      mockInvRepo.invitations.set(TEST_INVITATION_ID, createMockInvitation({ email: TEST_EMAIL }));

      await expect(invitationService.create(createDto, TEST_ORG_ID, TEST_USER_ID)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should allow invitation if existing invitation was revoked", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());
      mockInvRepo.invitations.set(
        TEST_INVITATION_ID,
        createMockInvitation({ email: TEST_EMAIL, status: InvitationStatus.Revoked }),
      );

      const result = await invitationService.create(createDto, TEST_ORG_ID, TEST_USER_ID);

      expect(result.status).toBe(InvitationStatus.Pending);
    });
  });

  describe("findByOrganizationId", () => {
    it("should return invitations for an organization", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());
      mockInvRepo.invitations.set(TEST_INVITATION_ID, createMockInvitation());

      const result = await invitationService.findByOrganizationId(TEST_ORG_ID, TEST_USER_ID);

      expect(result).toHaveLength(1);
    });

    it("should throw ForbiddenException when user is not a member", async () => {
      await expect(
        invitationService.findByOrganizationId(TEST_ORG_ID, TEST_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("accept", () => {
    it("should accept a pending invitation and create membership", async () => {
      mockInvRepo.invitations.set(TEST_INVITATION_ID, createMockInvitation());

      await invitationService.accept(TEST_INVITATION_ID, "new-user");

      const invitation = await mockInvRepo.findById(TEST_INVITATION_ID);
      expect(invitation?.status).toBe(InvitationStatus.Accepted);

      const memberships = await mockMembershipRepo.findByUserId("new-user");
      expect(memberships).toHaveLength(1);
      expect(memberships[0]?.role).toBe(MembershipRole.Member);
    });

    it("should throw NotFoundException when invitation does not exist", async () => {
      await expect(invitationService.accept("nonexistent", TEST_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when invitation is not pending", async () => {
      mockInvRepo.invitations.set(
        TEST_INVITATION_ID,
        createMockInvitation({ status: InvitationStatus.Accepted }),
      );

      await expect(invitationService.accept(TEST_INVITATION_ID, TEST_USER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when invitation has expired", async () => {
      mockInvRepo.invitations.set(
        TEST_INVITATION_ID,
        createMockInvitation({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(invitationService.accept(TEST_INVITATION_ID, TEST_USER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should mark invitation as expired if it has expired", async () => {
      mockInvRepo.invitations.set(
        TEST_INVITATION_ID,
        createMockInvitation({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(invitationService.accept(TEST_INVITATION_ID, TEST_USER_ID)).rejects.toThrow(
        BadRequestException,
      );

      const invitation = await mockInvRepo.findById(TEST_INVITATION_ID);
      expect(invitation?.status).toBe(InvitationStatus.Expired);
    });

    it("should accept invitation gracefully when user is already a member", async () => {
      mockInvRepo.invitations.set(TEST_INVITATION_ID, createMockInvitation());
      mockMembershipRepo.memberships.set(
        "existing-membership",
        createMockMembership({ userId: "existing-user" }),
      );

      await invitationService.accept(TEST_INVITATION_ID, "existing-user");

      const invitation = await mockInvRepo.findById(TEST_INVITATION_ID);
      expect(invitation?.status).toBe(InvitationStatus.Accepted);
    });
  });

  describe("revoke", () => {
    it("should revoke a pending invitation", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());
      mockInvRepo.invitations.set(TEST_INVITATION_ID, createMockInvitation());

      await invitationService.revoke(TEST_INVITATION_ID, TEST_USER_ID);

      const invitation = await mockInvRepo.findById(TEST_INVITATION_ID);
      expect(invitation?.status).toBe(InvitationStatus.Revoked);
    });

    it("should throw NotFoundException when invitation does not exist", async () => {
      await expect(invitationService.revoke("nonexistent", TEST_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when invitation is not pending", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());
      mockInvRepo.invitations.set(
        TEST_INVITATION_ID,
        createMockInvitation({ status: InvitationStatus.Accepted }),
      );

      await expect(invitationService.revoke(TEST_INVITATION_ID, TEST_USER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw ForbiddenException when user is not admin or owner", async () => {
      mockMembershipRepo.memberships.set(
        "m1",
        createMockMembership({ role: MembershipRole.Member }),
      );
      mockInvRepo.invitations.set(TEST_INVITATION_ID, createMockInvitation());

      await expect(invitationService.revoke(TEST_INVITATION_ID, TEST_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
