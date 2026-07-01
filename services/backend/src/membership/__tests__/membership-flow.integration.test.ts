import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { OrganizationService } from "../../organization/services/organization.service.js";
import { ORGANIZATION_REPOSITORY } from "../../organization/interfaces/organization-repository.interface.js";
import type { OrganizationRepository } from "../../organization/interfaces/organization-repository.interface.js";
import { MembershipService } from "../services/membership.service.js";
import { MEMBERSHIP_REPOSITORY } from "../interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../interfaces/membership-repository.interface.js";
import type { Organization } from "../../organization/interfaces/organization.interface.js";
import type { Membership } from "../interfaces/membership.interface.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";

const OWNER_ID = "owner-user";
const ADMIN_ID = "admin-user";
const MEMBER_ID = "member-user";
const NEW_USER_ID = "new-user";

class InMemoryOrgRepo implements OrganizationRepository {
  public data = new Map<string, Organization>();
  public findById(id: string): Promise<Organization | null> {
    for (const o of this.data.values()) {
      if (o.id === id) return Promise.resolve(o);
    }
    return Promise.resolve(null);
  }
  public findBySlug(slug: string): Promise<Organization | null> {
    for (const o of this.data.values()) {
      if (o.slug === slug) return Promise.resolve(o);
    }
    return Promise.resolve(null);
  }
  public create(d: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization> {
    const org = {
      id: "org-" + String(this.data.size + 1),
      ...d,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Organization;
    this.data.set(org.id, org);
    return Promise.resolve(org);
  }
  public update(id: string, c: Partial<Omit<Organization, "id">>): Promise<Organization> {
    const existing = this.findOrgById(id);
    if (existing === null) return Promise.reject(new Error("Not found"));
    const updated = { ...existing, ...c, updatedAt: new Date() } as Organization;
    this.data.set(existing.id, updated);
    return Promise.resolve(updated);
  }
  public delete(id: string): Promise<void> {
    for (const [key, o] of this.data.entries()) {
      if (o.id === id) {
        this.data.delete(key);
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  }
  private findOrgById(id: string): Organization | null {
    for (const o of this.data.values()) {
      if (o.id === id) return o;
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

describe("Membership Lifecycle Integration", () => {
  let orgService: OrganizationService;
  let membershipService: MembershipService;
  let orgRepo: InMemoryOrgRepo;
  let mRepo: InMemoryMembershipRepo;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    orgRepo = new InMemoryOrgRepo();
    mRepo = new InMemoryMembershipRepo();

    moduleRef = await Test.createTestingModule({
      providers: [
        OrganizationService,
        MembershipService,
        { provide: ORGANIZATION_REPOSITORY, useValue: orgRepo },
        { provide: MEMBERSHIP_REPOSITORY, useValue: mRepo },
      ],
    }).compile();

    orgService = moduleRef.get<OrganizationService>(OrganizationService);
    membershipService = moduleRef.get<MembershipService>(MembershipService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    orgRepo.data.clear();
    mRepo.data.clear();
  });

  it("should complete full membership lifecycle", async () => {
    const org = await orgService.create(
      { name: "Membership Test", slug: "membership-test" },
      OWNER_ID,
    );

    const adminMembership = await membershipService.create(
      org.id,
      { userId: ADMIN_ID, role: MembershipRole.Admin },
      OWNER_ID,
    );
    expect(adminMembership.userId).toBe(ADMIN_ID);
    expect(adminMembership.role).toBe(MembershipRole.Admin);

    const memberMembership = await membershipService.create(
      org.id,
      { userId: MEMBER_ID, role: MembershipRole.Member },
      OWNER_ID,
    );
    expect(memberMembership.userId).toBe(MEMBER_ID);

    const allMemberships = await membershipService.findByOrganizationId(org.id, OWNER_ID);
    expect(allMemberships).toHaveLength(3);

    const promoted = await membershipService.update(
      memberMembership.id,
      { role: MembershipRole.Admin },
      OWNER_ID,
    );
    expect(promoted.role).toBe(MembershipRole.Admin);

    const demoted = await membershipService.update(
      promoted.id,
      { role: MembershipRole.Member },
      OWNER_ID,
    );
    expect(demoted.role).toBe(MembershipRole.Member);

    await membershipService.delete(demoted.id, OWNER_ID);
    const afterDelete = await membershipService.findByOrganizationId(org.id, OWNER_ID);
    expect(afterDelete).toHaveLength(2);

    const removedUserMemberships = await mRepo.findByUserId(MEMBER_ID);
    expect(removedUserMemberships).toHaveLength(0);
  });

  it("should prevent duplicate membership", async () => {
    const org = await orgService.create({ name: "Dup Test", slug: "dup-test" }, OWNER_ID);

    await membershipService.create(
      org.id,
      { userId: NEW_USER_ID, role: MembershipRole.Member },
      OWNER_ID,
    );

    await expect(
      membershipService.create(
        org.id,
        { userId: NEW_USER_ID, role: MembershipRole.Admin },
        OWNER_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it("should prevent changing the owner role", async () => {
    const org = await orgService.create({ name: "Owner Test", slug: "owner-test" }, OWNER_ID);

    const ownerMembership = await mRepo.findByOrganizationAndUser(org.id, OWNER_ID);
    if (ownerMembership === null) throw new Error("Expected owner membership");
    const ownerId = ownerMembership.id;

    await expect(
      membershipService.update(ownerId, { role: MembershipRole.Member }, OWNER_ID),
    ).rejects.toThrow(ForbiddenException);
  });

  it("should prevent removing the owner", async () => {
    const org = await orgService.create(
      { name: "Owner Remove Test", slug: "owner-remove" },
      OWNER_ID,
    );

    const ownerMembership = await mRepo.findByOrganizationAndUser(org.id, OWNER_ID);
    if (ownerMembership === null) throw new Error("Expected owner membership");
    const ownerId = ownerMembership.id;

    await expect(membershipService.delete(ownerId, OWNER_ID)).rejects.toThrow(ForbiddenException);
  });

  it("should allow admin to manage memberships", async () => {
    const org = await orgService.create({ name: "Admin Test", slug: "admin-test" }, OWNER_ID);
    await membershipService.create(
      org.id,
      { userId: ADMIN_ID, role: MembershipRole.Admin },
      OWNER_ID,
    );

    const newMember = await membershipService.create(
      org.id,
      { userId: NEW_USER_ID, role: MembershipRole.Member },
      ADMIN_ID,
    );
    expect(newMember.role).toBe(MembershipRole.Member);

    const promoted = await membershipService.update(
      newMember.id,
      { role: MembershipRole.Admin },
      ADMIN_ID,
    );
    expect(promoted.role).toBe(MembershipRole.Admin);

    await membershipService.delete(promoted.id, ADMIN_ID);
    const memberships = await membershipService.findByOrganizationId(org.id, OWNER_ID);
    expect(memberships).toHaveLength(2);
  });

  it("should throw ForbiddenException when non-member queries memberships", async () => {
    const org = await orgService.create(
      { name: "Forbidden Test", slug: "forbidden-test" },
      OWNER_ID,
    );

    await expect(membershipService.findByOrganizationId(org.id, "outsider")).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("should throw NotFoundException for non-existent membership", async () => {
    await expect(
      membershipService.update("nonexistent", { role: MembershipRole.Admin }, OWNER_ID),
    ).rejects.toThrow(NotFoundException);
    await expect(membershipService.delete("nonexistent", OWNER_ID)).rejects.toThrow(
      NotFoundException,
    );
  });
});
