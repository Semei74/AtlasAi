import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { OrganizationService } from "../../organization/services/organization.service.js";
import { ORGANIZATION_REPOSITORY } from "../../organization/interfaces/organization-repository.interface.js";
import type { OrganizationRepository } from "../../organization/interfaces/organization-repository.interface.js";
import { WorkspaceService } from "../../workspace/services/workspace.service.js";
import { WORKSPACE_REPOSITORY } from "../../workspace/interfaces/workspace-repository.interface.js";
import type { WorkspaceRepository } from "../../workspace/interfaces/workspace-repository.interface.js";
import { MembershipService } from "../../membership/services/membership.service.js";
import { InvitationService } from "../../membership/services/invitation.service.js";
import { MEMBERSHIP_REPOSITORY } from "../../membership/interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../../membership/interfaces/membership-repository.interface.js";
import { INVITATION_REPOSITORY } from "../../membership/interfaces/invitation-repository.interface.js";
import type { InvitationRepository } from "../../membership/interfaces/invitation-repository.interface.js";
import type { Organization } from "../../organization/interfaces/organization.interface.js";
import type { Workspace } from "../../workspace/interfaces/workspace.interface.js";
import type { Membership } from "../../membership/interfaces/membership.interface.js";
import type { Invitation } from "../../membership/interfaces/invitation.interface.js";
import { MembershipRole } from "../../membership/interfaces/membership-role.enum.js";
import { MembershipStatus } from "../../membership/interfaces/membership-status.enum.js";
import { InvitationStatus } from "../../membership/interfaces/invitation-status.enum.js";

const USER_A = "user-a";
const USER_B = "user-b";
const ORG_A = "org-a";
const ORG_B = "org-b";
const WS_A = "ws-a";
const WS_B = "ws-b";

function baseOrg(id: string): Organization {
  return {
    id,
    name: `Org ${id}`,
    slug: id,
    ownerId: id === ORG_A ? USER_A : USER_B,
    branding: { logoUrl: null },
    settings: {
      security: {
        sessionTimeoutMinutes: 60,
        requireMfa: false,
        allowedIpRanges: [],
        allowedEmailDomains: [],
        maximumLoginAttempts: 5,
      },
      authentication: {
        allowedProviders: ["email"],
        defaultProvider: "email",
        enableRegistration: true,
        enablePasswordReset: true,
        enableSessionManagement: true,
      },
      ai: {
        enabledProviders: [],
        blockedProviders: [],
        defaultProvider: null,
        allowedModels: [],
        blockedModels: [],
        maxInputTokens: null,
        maxOutputTokens: null,
        allowImageGeneration: false,
        allowAudioGeneration: false,
        allowEmbeddings: false,
        allowModeration: false,
        allowTools: false,
        allowMcp: false,
        allowRag: false,
        allowPromptTemplates: false,
        allowConversationMemory: false,
        allowStreaming: false,
      },
      storage: {
        maxStorageBytes: null,
        maxUploadSizeBytes: null,
        allowedFileTypes: [],
        blockedFileTypes: [],
        retentionDays: null,
        enableVersioning: false,
      },
      regional: {
        defaultLocale: "en-US",
        defaultTimezone: "UTC",
        allowedLocales: ["en-US"],
        dateFormat: "YYYY-MM-DD",
        timeFormat: "24h",
        firstDayOfWeek: 1,
        country: "US",
        region: "us-east",
        currency: "USD",
        language: "en",
        legalRegion: "US",
        billingRegion: "US",
        paymentRegion: "US",
        privacyRegion: "US",
        dataResidencyRegion: "US",
      },
      featureFlags: {},
      billing: {
        enabledProviders: [],
        defaultCurrency: "USD",
        billingEmail: null,
        invoicePrefix: null,
        taxId: null,
        paymentTermsDays: 30,
        autoInvoicing: false,
        currency: {},
      },
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function baseWs(id: string, orgId: string): Workspace {
  return {
    id,
    organizationId: orgId,
    name: `WS ${id}`,
    description: null,
    color: null,
    icon: null,
    settings: { config: {}, ai: {}, storage: {}, promptLibraryIds: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function baseMembership(uid: string, oid: string): Membership {
  return {
    id: `m-${uid}-${oid}`,
    organizationId: oid,
    userId: uid,
    role: MembershipRole.Owner,
    status: MembershipStatus.Active,
    joinedAt: new Date(),
  };
}

function baseInvitation(oid: string): Invitation {
  return {
    id: `inv-${oid}`,
    organizationId: oid,
    inviterId: oid === ORG_A ? USER_A : USER_B,
    email: "guest@other.com",
    role: MembershipRole.Member,
    status: InvitationStatus.Pending,
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

class InMemoryOrgRepo implements OrganizationRepository {
  public data = new Map<string, Organization>();
  public findById(id: string): Promise<Organization | null> {
    return Promise.resolve(this.data.get(id) ?? null);
  }
  public findByIds(ids: string[]): Promise<Organization[]> {
    return Promise.resolve(
      ids.map((id) => this.data.get(id)).filter((o): o is Organization => o !== undefined),
    );
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
      createdAt: new Date(),
      updatedAt: new Date(),
      ...d,
    };
    this.data.set(org.id, org);
    return Promise.resolve(org);
  }
  public update(id: string, c: Partial<Omit<Organization, "id">>): Promise<Organization> {
    const existing = this.data.get(id);
    if (existing === undefined) return Promise.reject(new Error("Not found"));
    const updated: Organization = { ...existing, ...c, updatedAt: new Date() };
    this.data.set(id, updated);
    return Promise.resolve(updated);
  }
  public delete(id: string): Promise<void> {
    this.data.delete(id);
    return Promise.resolve();
  }
}

class InMemoryWsRepo implements WorkspaceRepository {
  public data = new Map<string, Workspace>();
  public findById(id: string): Promise<Workspace | null> {
    return Promise.resolve(this.data.get(id) ?? null);
  }
  public findByOrganizationId(oid: string): Promise<Workspace[]> {
    return Promise.resolve(Array.from(this.data.values()).filter((w) => w.organizationId === oid));
  }
  public create(d: Omit<Workspace, "id" | "createdAt" | "updatedAt">): Promise<Workspace> {
    const ws: Workspace = {
      id: "ws-" + String(this.data.size + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...d,
    };
    this.data.set(ws.id, ws);
    return Promise.resolve(ws);
  }
  public update(id: string, c: Partial<Omit<Workspace, "id">>): Promise<Workspace> {
    const existing = this.data.get(id);
    if (existing === undefined) return Promise.reject(new Error("Not found"));
    const updated: Workspace = { ...existing, ...c, updatedAt: new Date() };
    this.data.set(id, updated);
    return Promise.resolve(updated);
  }
  public delete(id: string): Promise<void> {
    this.data.delete(id);
    return Promise.resolve();
  }
}

class InMemoryMembershipRepo implements MembershipRepository {
  public data = new Map<string, Membership>();
  public findById(id: string): Promise<Membership | null> {
    return Promise.resolve(this.data.get(id) ?? null);
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
    const existing = this.data.get(id);
    if (existing === undefined) return Promise.reject(new Error("Not found"));
    const updated: Membership = { ...existing, ...c };
    this.data.set(id, updated);
    return Promise.resolve(updated);
  }
  public delete(id: string): Promise<void> {
    this.data.delete(id);
    return Promise.resolve();
  }
}

class InMemoryInvitationRepo implements InvitationRepository {
  public data = new Map<string, Invitation>();
  public findById(id: string): Promise<Invitation | null> {
    return Promise.resolve(this.data.get(id) ?? null);
  }
  public findByOrganizationId(oid: string): Promise<Invitation[]> {
    return Promise.resolve(Array.from(this.data.values()).filter((i) => i.organizationId === oid));
  }
  public findByEmail(email: string): Promise<Invitation[]> {
    return Promise.resolve(Array.from(this.data.values()).filter((i) => i.email === email));
  }
  public create(d: Omit<Invitation, "id" | "createdAt" | "updatedAt">): Promise<Invitation> {
    const i: Invitation = {
      id: "invitation-" + String(this.data.size + 1),
      ...d,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.set(i.id, i);
    return Promise.resolve(i);
  }
  public update(id: string, c: Partial<Omit<Invitation, "id">>): Promise<Invitation> {
    const existing = this.data.get(id);
    if (existing === undefined) return Promise.reject(new Error("Not found"));
    const updated: Invitation = { ...existing, ...c, updatedAt: new Date() };
    this.data.set(id, updated);
    return Promise.resolve(updated);
  }
  public delete(id: string): Promise<void> {
    this.data.delete(id);
    return Promise.resolve();
  }
}

describe("Tenant Isolation", () => {
  let orgService: OrganizationService;
  let wsService: WorkspaceService;
  let membershipService: MembershipService;
  let invitationService: InvitationService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const orgRepo = new InMemoryOrgRepo();
    const wsRepo = new InMemoryWsRepo();
    const mRepo = new InMemoryMembershipRepo();
    const invRepo = new InMemoryInvitationRepo();

    orgRepo.data.set(ORG_A, baseOrg(ORG_A));
    orgRepo.data.set(ORG_B, baseOrg(ORG_B));
    wsRepo.data.set(WS_A, baseWs(WS_A, ORG_A));
    wsRepo.data.set(WS_B, baseWs(WS_B, ORG_B));
    mRepo.data.set("m-a", baseMembership(USER_A, ORG_A));
    mRepo.data.set("m-b", baseMembership(USER_B, ORG_B));
    invRepo.data.set("inv-a", baseInvitation(ORG_A));
    invRepo.data.set("inv-b", baseInvitation(ORG_B));

    moduleRef = await Test.createTestingModule({
      providers: [
        OrganizationService,
        WorkspaceService,
        MembershipService,
        InvitationService,
        { provide: ORGANIZATION_REPOSITORY, useValue: orgRepo },
        { provide: WORKSPACE_REPOSITORY, useValue: wsRepo },
        { provide: MEMBERSHIP_REPOSITORY, useValue: mRepo },
        { provide: INVITATION_REPOSITORY, useValue: invRepo },
      ],
    }).compile();

    orgService = moduleRef.get<OrganizationService>(OrganizationService);
    wsService = moduleRef.get<WorkspaceService>(WorkspaceService);
    membershipService = moduleRef.get<MembershipService>(MembershipService);
    invitationService = moduleRef.get<InvitationService>(InvitationService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  /* ── Organization Boundary ──────────────────────────────────── */

  describe("organization boundary", () => {
    it("should prevent user from org A from modifying org B", async () => {
      await expect(orgService.update(ORG_B, { name: "Hacked" }, USER_A)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should prevent user from org A from deleting org B", async () => {
      await expect(orgService.delete(ORG_B, USER_A)).rejects.toThrow(ForbiddenException);
    });

    it("should allow user to read own org", async () => {
      const org = await orgService.findById(ORG_A);
      expect(org.id).toBe(ORG_A);
    });
  });

  /* ── Workspace Boundary ─────────────────────────────────────── */

  describe("workspace boundary", () => {
    it("should prevent user from org A from reading workspace in org B", async () => {
      await expect(wsService.findById(WS_B, USER_A)).rejects.toThrow(ForbiddenException);
    });

    it("should prevent user from org A from listing workspaces in org B", async () => {
      await expect(wsService.findByOrganizationId(ORG_B, USER_A)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should prevent user from org A from updating workspace in org B", async () => {
      await expect(wsService.update(WS_B, { name: "Hacked" }, USER_A)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should prevent user from org A from deleting workspace in org B", async () => {
      await expect(wsService.delete(WS_B, USER_A)).rejects.toThrow(ForbiddenException);
    });

    it("should prevent user from org A from creating workspace in org B", async () => {
      await expect(wsService.create({ name: "Hacked WS" }, ORG_B, USER_A)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should allow user to manage workspaces in own org", async () => {
      const ws = await wsService.create({ name: "My WS" }, ORG_A, USER_A);
      expect(ws.organizationId).toBe(ORG_A);

      const found = await wsService.findById(ws.id, USER_A);
      expect(found.id).toBe(ws.id);

      const listed = await wsService.findByOrganizationId(ORG_A, USER_A);
      expect(listed.length).toBeGreaterThan(0);
    });
  });

  /* ── Membership Boundary ────────────────────────────────────── */

  describe("membership boundary", () => {
    it("should prevent user from org A from listing memberships in org B", async () => {
      await expect(membershipService.findByOrganizationId(ORG_B, USER_A)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should prevent user from org A from creating membership in org B", async () => {
      await expect(
        membershipService.create(ORG_B, { userId: "someone", role: MembershipRole.Member }, USER_A),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  /* ── Invitation Boundary ────────────────────────────────────── */

  describe("invitation boundary", () => {
    it("should prevent user from org A from listing invitations in org B", async () => {
      await expect(invitationService.findByOrganizationId(ORG_B, USER_A)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should prevent user from org A from creating invitation in org B", async () => {
      await expect(
        invitationService.create(
          { email: "hacker@evil.com", role: MembershipRole.Member },
          ORG_B,
          USER_A,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  /* ── Isolation Integrity ────────────────────────────────────── */

  describe("isolation integrity", () => {
    it("should return only own org data", async () => {
      const orgs = await orgService.findAllByUserId(USER_A);
      expect(orgs).toHaveLength(1);
      expect(orgs[0]?.id).toBe(ORG_A);
    });

    it("should allow org B user to operate within org B independently", async () => {
      const ws = await wsService.create({ name: "B's WS" }, ORG_B, USER_B);
      expect(ws.organizationId).toBe(ORG_B);

      const memberships = await membershipService.findByOrganizationId(ORG_B, USER_B);
      expect(memberships).toHaveLength(1);
    });
  });
});
