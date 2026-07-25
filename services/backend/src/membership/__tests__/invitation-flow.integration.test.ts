import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { ORGANIZATION_REPOSITORY } from "../../organization/interfaces/organization-repository.interface.js";
import type { OrganizationRepository } from "../../organization/interfaces/organization-repository.interface.js";
import type { Organization } from "../../organization/interfaces/organization.interface.js";
import { InvitationService } from "../services/invitation.service.js";
import { INVITATION_REPOSITORY } from "../interfaces/invitation-repository.interface.js";
import type { InvitationRepository } from "../interfaces/invitation-repository.interface.js";
import { MEMBERSHIP_REPOSITORY } from "../interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../interfaces/membership-repository.interface.js";
import type { Membership } from "../interfaces/membership.interface.js";
import type { Invitation } from "../interfaces/invitation.interface.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { MembershipStatus } from "../interfaces/membership-status.enum.js";
import { InvitationStatus } from "../interfaces/invitation-status.enum.js";

const OWNER_ID = "owner-user";
const ADMIN_ID = "admin-user";
const NEW_USER_ID = "new-user";
const NEW_USER_EMAIL = "new@example.com";
const TEST_ORG_ID = "org-invite";

class StubOrgRepo implements OrganizationRepository {
  public data = new Map<string, Organization>();
  public findById(_id: string): Promise<Organization | null> {
    return Promise.resolve(null);
  }
  public findBySlug(_slug: string): Promise<Organization | null> {
    return Promise.resolve(null);
  }
  public findByIds(_ids: string[]): Promise<Organization[]> {
    return Promise.resolve([]);
  }
  public create(_d: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization> {
    return Promise.reject(new Error("not used"));
  }
  public update(_id: string, _c: Partial<Omit<Organization, "id">>): Promise<Organization> {
    return Promise.reject(new Error("not used"));
  }
  public delete(_id: string): Promise<void> {
    return Promise.resolve();
  }
}

class InMemoryInvitationRepo implements InvitationRepository {
  public data = new Map<string, Invitation>();
  public findById(id: string): Promise<Invitation | null> {
    for (const inv of this.data.values()) {
      if (inv.id === id) return Promise.resolve(inv);
    }
    return Promise.resolve(null);
  }
  public findByOrganizationId(oid: string): Promise<Invitation[]> {
    return Promise.resolve(Array.from(this.data.values()).filter((i) => i.organizationId === oid));
  }
  public findByEmail(email: string): Promise<Invitation[]> {
    return Promise.resolve(Array.from(this.data.values()).filter((i) => i.email === email));
  }
  public create(d: Omit<Invitation, "id" | "createdAt" | "updatedAt">): Promise<Invitation> {
    const inv = {
      id: "invitation-" + String(this.data.size + 1),
      ...d,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Invitation;
    this.data.set(inv.id, inv);
    return Promise.resolve(inv);
  }
  public update(id: string, c: Partial<Omit<Invitation, "id">>): Promise<Invitation> {
    const existing = this.findInvById(id);
    if (existing === null) return Promise.reject(new Error("Not found"));
    const updated = { ...existing, ...c, updatedAt: new Date() } as Invitation;
    this.data.set(existing.id, updated);
    return Promise.resolve(updated);
  }
  public delete(id: string): Promise<void> {
    for (const [key, inv] of this.data.entries()) {
      if (inv.id === id) {
        this.data.delete(key);
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  }
  private findInvById(id: string): Invitation | null {
    for (const inv of this.data.values()) {
      if (inv.id === id) return inv;
    }
    return null;
  }
}

class InMemoryMembershipRepo implements MembershipRepository {
  public data = new Map<string, Membership>();
  public findById(id: string): Promise<Membership | null> {
    for (const m of this.data.values()) {
      if (m.id === id) return Promise.resolve(m);
    }
    return Promise.resolve(null);
  }
  public findByOrganizationId(oid: string): Promise<Membership[]> {
    return Promise.resolve(Array.from(this.data.values()).filter((m) => m.organizationId === oid));
  }
  public findByUserId(uid: string): Promise<Membership[]> {
    return Promise.resolve(Array.from(this.data.values()).filter((m) => m.userId === uid));
  }
  public findByOrganizationAndUser(oid: string, uid: string): Promise<Membership | null> {
    for (const m of this.data.values()) {
      if (m.organizationId === oid && m.userId === uid) return Promise.resolve(m);
    }
    return Promise.resolve(null);
  }
  public create(d: Omit<Membership, "id" | "joinedAt">): Promise<Membership> {
    const m = {
      id: "membership-" + String(this.data.size + 1),
      ...d,
      joinedAt: new Date(),
    } as Membership;
    this.data.set(m.id, m);
    return Promise.resolve(m);
  }
  public update(id: string, c: Partial<Omit<Membership, "id">>): Promise<Membership> {
    const existing = this.findMemById(id);
    if (existing === null) return Promise.reject(new Error("Not found"));
    const updated: Membership = { ...existing, ...c };
    this.data.set(existing.id, updated);
    return Promise.resolve(updated);
  }
  public delete(id: string): Promise<void> {
    for (const [key, m] of this.data.entries()) {
      if (m.id === id) {
        this.data.delete(key);
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  }
  private findMemById(id: string): Membership | null {
    for (const m of this.data.values()) {
      if (m.id === id) return m;
    }
    return null;
  }
}

describe("Invitation Lifecycle Integration", () => {
  let invitationService: InvitationService;
  let invRepo: InMemoryInvitationRepo;
  let mRepo: InMemoryMembershipRepo;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    invRepo = new InMemoryInvitationRepo();
    mRepo = new InMemoryMembershipRepo();

    moduleRef = await Test.createTestingModule({
      providers: [
        InvitationService,
        { provide: INVITATION_REPOSITORY, useValue: invRepo },
        { provide: MEMBERSHIP_REPOSITORY, useValue: mRepo },
        { provide: ORGANIZATION_REPOSITORY, useValue: new StubOrgRepo() },
      ],
    }).compile();

    invitationService = moduleRef.get<InvitationService>(InvitationService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    invRepo.data.clear();
    mRepo.data.clear();
    mRepo.data.set("m-owner", {
      id: "m-owner",
      organizationId: TEST_ORG_ID,
      userId: OWNER_ID,
      role: MembershipRole.Owner,
      status: MembershipStatus.Active,
      joinedAt: new Date(),
    });
    mRepo.data.set("m-admin", {
      id: "m-admin",
      organizationId: TEST_ORG_ID,
      userId: ADMIN_ID,
      role: MembershipRole.Admin,
      status: MembershipStatus.Active,
      joinedAt: new Date(),
    });
  });

  it("should complete full invitation lifecycle (email-based)", async () => {
    const invitation = await invitationService.create(
      { email: NEW_USER_EMAIL, role: MembershipRole.Member },
      TEST_ORG_ID,
      OWNER_ID,
    );
    expect(invitation.email).toBe(NEW_USER_EMAIL);
    expect(invitation.role).toBe(MembershipRole.Member);
    expect(invitation.status).toBe(InvitationStatus.Pending);
    expect(invitation.inviterId).toBe(OWNER_ID);

    const invitations = await invitationService.findByOrganizationId(TEST_ORG_ID, OWNER_ID);
    expect(invitations).toHaveLength(1);

    await invitationService.accept(invitation.id, NEW_USER_ID, NEW_USER_EMAIL);

    const acceptedInvite = await invRepo.findById(invitation.id);
    expect(acceptedInvite?.status).toBe(InvitationStatus.Accepted);

    const membership = await mRepo.findByOrganizationAndUser(TEST_ORG_ID, NEW_USER_ID);
    expect(membership).not.toBeNull();
    expect(membership?.role).toBe(MembershipRole.Member);
    expect(membership?.status).toBe(MembershipStatus.Active);
  });

  it("should prevent duplicate pending invitation for same email", async () => {
    await invitationService.create(
      { email: NEW_USER_EMAIL, role: MembershipRole.Member },
      TEST_ORG_ID,
      OWNER_ID,
    );

    await expect(
      invitationService.create(
        { email: NEW_USER_EMAIL, role: MembershipRole.Member },
        TEST_ORG_ID,
        OWNER_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it("should reject expired invitation", async () => {
    const invitation = await invitationService.create(
      { email: NEW_USER_EMAIL, role: MembershipRole.Member },
      TEST_ORG_ID,
      OWNER_ID,
    );

    const expiredInvitation = await invRepo.update(invitation.id, {
      expiresAt: new Date(Date.now() - 1000),
    });
    expect(expiredInvitation.expiresAt.getTime()).toBeLessThan(Date.now());

    await expect(invitationService.accept(invitation.id, NEW_USER_ID, NEW_USER_EMAIL)).rejects.toThrow(
      BadRequestException,
    );

    const updated = await invRepo.findById(invitation.id);
    expect(updated?.status).toBe(InvitationStatus.Expired);
  });

  it("should reject non-pending invitation", async () => {
    const invitation = await invitationService.create(
      { email: NEW_USER_EMAIL, role: MembershipRole.Member },
      TEST_ORG_ID,
      OWNER_ID,
    );

    await invitationService.revoke(invitation.id, OWNER_ID);

    await expect(invitationService.accept(invitation.id, NEW_USER_ID, NEW_USER_EMAIL)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should revoke a pending invitation", async () => {
    const invitation = await invitationService.create(
      { email: NEW_USER_EMAIL, role: MembershipRole.Member },
      TEST_ORG_ID,
      OWNER_ID,
    );

    await invitationService.revoke(invitation.id, OWNER_ID);

    const revoked = await invRepo.findById(invitation.id);
    expect(revoked?.status).toBe(InvitationStatus.Revoked);
  });

  it("should allow re-invitation after revocation", async () => {
    await invitationService.create(
      { email: NEW_USER_EMAIL, role: MembershipRole.Member },
      TEST_ORG_ID,
      OWNER_ID,
    );

    await invitationService.revoke("invitation-1", OWNER_ID);

    const newInvite = await invitationService.create(
      { email: NEW_USER_EMAIL, role: MembershipRole.Member },
      TEST_ORG_ID,
      OWNER_ID,
    );
    expect(newInvite.status).toBe(InvitationStatus.Pending);
  });

  it("should accept gracefully when user is already a member", async () => {
    const invitation = await invitationService.create(
      { email: NEW_USER_EMAIL, role: MembershipRole.Member },
      TEST_ORG_ID,
      OWNER_ID,
    );

    mRepo.data.set("m-existing", {
      id: "m-existing",
      organizationId: TEST_ORG_ID,
      userId: NEW_USER_ID,
      role: MembershipRole.Member,
      status: MembershipStatus.Active,
      joinedAt: new Date(),
    });

    await invitationService.accept(invitation.id, NEW_USER_ID, NEW_USER_EMAIL);

    const accepted = await invRepo.findById(invitation.id);
    expect(accepted?.status).toBe(InvitationStatus.Accepted);
  });

  it("should throw NotFoundException for non-existent invitation", async () => {
    await expect(invitationService.accept("nonexistent", NEW_USER_ID, NEW_USER_EMAIL)).rejects.toThrow(
      NotFoundException,
    );
    await expect(invitationService.revoke("nonexistent", OWNER_ID)).rejects.toThrow(
      NotFoundException,
    );
  });
});
