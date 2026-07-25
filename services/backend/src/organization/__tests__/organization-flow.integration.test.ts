import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { OrganizationService } from "../services/organization.service.js";
import { ORGANIZATION_REPOSITORY } from "../interfaces/organization-repository.interface.js";
import type { OrganizationRepository } from "../interfaces/organization-repository.interface.js";
import { MEMBERSHIP_REPOSITORY } from "../../membership/interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../../membership/interfaces/membership-repository.interface.js";
import { WorkspaceService } from "../../workspace/services/workspace.service.js";
import { WORKSPACE_REPOSITORY } from "../../workspace/interfaces/workspace-repository.interface.js";
import type { WorkspaceRepository } from "../../workspace/interfaces/workspace-repository.interface.js";
import type { Organization } from "../interfaces/organization.interface.js";
import type { Membership } from "../../membership/interfaces/membership.interface.js";
import type { Workspace } from "../../workspace/interfaces/workspace.interface.js";
import { MembershipRole } from "../../membership/interfaces/membership-role.enum.js";
import { MembershipService } from "../../membership/services/membership.service.js";

const USER_ID = "user-lifecycle";

class InMemoryOrgRepo implements OrganizationRepository {
  public data = new Map<string, Organization>();
  public findById(id: string): Promise<Organization | null> {
    for (const o of this.data.values()) {
      if (o.id === id) return Promise.resolve(o);
    }
    return Promise.resolve(null);
  }
  public findByIds(ids: string[]): Promise<Organization[]> {
    return Promise.resolve([...this.data.values()].filter((o) => ids.includes(o.id)));
  }
  public findBySlug(slug: string): Promise<Organization | null> {
    for (const o of this.data.values()) {
      if (o.slug === slug) return Promise.resolve(o);
    }
    return Promise.resolve(null);
  }
  public create(d: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization> {
    const org: Organization = {
      id: "org-" + String(this.data.size + 1),
      ...d,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.set(org.id, org);
    return Promise.resolve(org);
  }
  public update(id: string, c: Partial<Omit<Organization, "id">>): Promise<Organization> {
    const existing = this.findOrgById(id);
    if (existing === null) return Promise.reject(new Error("Not found"));
    const updated: Organization = { ...existing, ...c, updatedAt: new Date() };
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

class InMemoryWsRepo implements WorkspaceRepository {
  public data = new Map<string, Workspace>();
  public findById(id: string): Promise<Workspace | null> {
    for (const w of this.data.values()) {
      if (w.id === id) return Promise.resolve(w);
    }
    return Promise.resolve(null);
  }
  public findByOrganizationId(oid: string): Promise<Workspace[]> {
    return Promise.resolve(Array.from(this.data.values()).filter((w) => w.organizationId === oid));
  }
  public create(d: Omit<Workspace, "id" | "createdAt" | "updatedAt">): Promise<Workspace> {
    const ws: Workspace = {
      id: "ws-" + String(this.data.size + 1),
      ...d,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.set(ws.id, ws);
    return Promise.resolve(ws);
  }
  public update(id: string, c: Partial<Omit<Workspace, "id">>): Promise<Workspace> {
    const existing = this.findWsById(id);
    if (existing === null) return Promise.reject(new Error("Not found"));
    const updated: Workspace = { ...existing, ...c, updatedAt: new Date() };
    this.data.set(existing.id, updated);
    return Promise.resolve(updated);
  }
  public delete(id: string): Promise<void> {
    for (const [key, w] of this.data.entries()) {
      if (w.id === id) {
        this.data.delete(key);
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  }
  private findWsById(id: string): Workspace | null {
    for (const w of this.data.values()) {
      if (w.id === id) return w;
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
    const m: Membership = {
      id: "membership-" + String(this.data.size + 1),
      ...d,
      joinedAt: new Date(),
    };
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

describe("Organization Lifecycle Integration", () => {
  let orgService: OrganizationService;
  let wsService: WorkspaceService;
  let membershipService: MembershipService;
  let orgRepo: InMemoryOrgRepo;
  let wsRepo: InMemoryWsRepo;
  let mRepo: InMemoryMembershipRepo;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    orgRepo = new InMemoryOrgRepo();
    wsRepo = new InMemoryWsRepo();
    mRepo = new InMemoryMembershipRepo();

    moduleRef = await Test.createTestingModule({
      providers: [
        OrganizationService,
        WorkspaceService,
        MembershipService,
        { provide: ORGANIZATION_REPOSITORY, useValue: orgRepo },
        { provide: WORKSPACE_REPOSITORY, useValue: wsRepo },
        { provide: MEMBERSHIP_REPOSITORY, useValue: mRepo },
      ],
    }).compile();

    orgService = moduleRef.get<OrganizationService>(OrganizationService);
    wsService = moduleRef.get<WorkspaceService>(WorkspaceService);
    membershipService = moduleRef.get<MembershipService>(MembershipService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    orgRepo.data.clear();
    wsRepo.data.clear();
    mRepo.data.clear();
  });

  it("should complete full organization lifecycle", async () => {
    const org = await orgService.create({ name: "Lifecycle Org", slug: "lifecycle-org" }, USER_ID);
    expect(org.name).toBe("Lifecycle Org");
    expect(org.slug).toBe("lifecycle-org");
    expect(org.ownerId).toBe(USER_ID);

    const memberships = await mRepo.findByUserId(USER_ID);
    expect(memberships).toHaveLength(1);
    expect(memberships[0]?.role).toBe(MembershipRole.Owner);

    const found = await orgService.findById(org.id);
    expect(found.id).toBe(org.id);

    const userOrgs = await orgService.findAllByUserId(USER_ID);
    expect(userOrgs).toHaveLength(1);

    const updated = await orgService.update(org.id, { name: "Updated Lifecycle Org" }, USER_ID);
    expect(updated.name).toBe("Updated Lifecycle Org");

    const ws = await wsService.create({ name: "Lifecycle WS" }, org.id, USER_ID);
    expect(ws.organizationId).toBe(org.id);

    const workspaces = await wsService.findByOrganizationId(org.id, USER_ID);
    expect(workspaces).toHaveLength(1);

    const updatedWs = await wsService.update(ws.id, { name: "Updated WS" }, USER_ID);
    expect(updatedWs.name).toBe("Updated WS");

    await wsService.delete(ws.id, USER_ID);
    const afterWsDelete = await wsService.findByOrganizationId(org.id, USER_ID);
    expect(afterWsDelete).toHaveLength(0);

    await orgService.delete(org.id, USER_ID);
    await expect(orgService.findById(org.id)).rejects.toThrow(NotFoundException);
  });

  it("should enforce slug uniqueness across lifecycle", async () => {
    await orgService.create({ name: "First", slug: "same-slug" }, USER_ID);
    await expect(orgService.create({ name: "Second", slug: "same-slug" }, USER_ID)).rejects.toThrow(
      ConflictException,
    );
  });

  it("should prevent non-owner from deleting organization", async () => {
    const org = await orgService.create({ name: "Org", slug: "protect-org" }, USER_ID);

    const adminMembership = await membershipService.create(
      org.id,
      { userId: "admin-user", role: MembershipRole.Admin },
      USER_ID,
    );
    expect(adminMembership.role).toBe(MembershipRole.Admin);

    await expect(orgService.delete(org.id, "admin-user")).rejects.toThrow(ForbiddenException);

    await expect(orgService.delete(org.id, USER_ID)).resolves.toBeUndefined();
  });

  it("should handle missing organization gracefully", async () => {
    await expect(orgService.findById("nonexistent")).rejects.toThrow(NotFoundException);
    await expect(orgService.update("nonexistent", { name: "x" }, USER_ID)).rejects.toThrow(
      NotFoundException,
    );
    await expect(orgService.delete("nonexistent", USER_ID)).rejects.toThrow(NotFoundException);
  });
});
