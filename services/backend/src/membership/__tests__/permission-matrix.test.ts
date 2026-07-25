import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { OrganizationService } from "../../organization/services/organization.service.js";
import { ORGANIZATION_REPOSITORY } from "../../organization/interfaces/organization-repository.interface.js";
import type { OrganizationRepository } from "../../organization/interfaces/organization-repository.interface.js";
import { WorkspaceService } from "../../workspace/services/workspace.service.js";
import { WORKSPACE_REPOSITORY } from "../../workspace/interfaces/workspace-repository.interface.js";
import type { WorkspaceRepository } from "../../workspace/interfaces/workspace-repository.interface.js";
import { MembershipService } from "../services/membership.service.js";
import { InvitationService } from "../services/invitation.service.js";
import { MEMBERSHIP_REPOSITORY } from "../interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../interfaces/membership-repository.interface.js";
import { INVITATION_REPOSITORY } from "../interfaces/invitation-repository.interface.js";
import type { InvitationRepository } from "../interfaces/invitation-repository.interface.js";
import type { Organization } from "../../organization/interfaces/organization.interface.js";
import type { Workspace } from "../../workspace/interfaces/workspace.interface.js";
import type { Membership } from "../interfaces/membership.interface.js";
import type { Invitation } from "../interfaces/invitation.interface.js";
import { MembershipRole } from "../interfaces/membership-role.enum.js";
import { MembershipStatus } from "../interfaces/membership-status.enum.js";
import { InvitationStatus } from "../interfaces/invitation-status.enum.js";

const ORG_OWNER = "owner-user";
const ORG_ADMIN = "admin-user";
const ORG_MEMBER = "member-user";
const ORG_VIEWER = "viewer-user";
const NON_MEMBER = "non-member-user";
const TARGET_USER = "target-user";
const TEST_ORG_ID = "org-456";
const TEST_WS_ID = "ws-789";
const TEST_MEMBERSHIP_ID = "membership-target";
const TEST_INVITATION_ID = "invitation-target";

function createMockOrganization(): Organization {
  return {
    id: TEST_ORG_ID,
    name: "Test Organization",
    slug: "test-org",
    ownerId: ORG_OWNER,
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
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}

function createMockWorkspace(): Workspace {
  return {
    id: TEST_WS_ID,
    organizationId: TEST_ORG_ID,
    name: "Test Workspace",
    description: null,
    color: null,
    icon: null,
    settings: { config: {}, ai: {}, storage: {}, promptLibraryIds: [] },
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}

function createMockMembership(overrides?: Partial<Membership>): Membership {
  return {
    id: `membership-${overrides?.userId ?? "unknown"}`,
    organizationId: TEST_ORG_ID,
    userId: ORG_OWNER,
    role: MembershipRole.Owner,
    status: MembershipStatus.Active,
    joinedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createMockInvitation(): Invitation {
  return {
    id: TEST_INVITATION_ID,
    organizationId: TEST_ORG_ID,
    inviterId: ORG_ADMIN,
    email: "target@example.com",
    role: MembershipRole.Member,
    status: InvitationStatus.Pending,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}

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
    for (const org of this.data.values()) {
      if (org.slug === slug) return Promise.resolve(org);
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
    const ws = {
      id: "ws-" + String(this.data.size + 1),
      ...d,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Workspace;
    this.data.set(ws.id, ws);
    return Promise.resolve(ws);
  }
  public update(id: string, c: Partial<Omit<Workspace, "id">>): Promise<Workspace> {
    const existing = this.findWsById(id);
    if (existing === null) return Promise.reject(new Error("Not found"));
    const updated = { ...existing, ...c, updatedAt: new Date() } as Workspace;
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

class InMemoryInvitationRepo implements InvitationRepository {
  public data = new Map<string, Invitation>();
  public findById(id: string): Promise<Invitation | null> {
    for (const i of this.data.values()) {
      if (i.id === id) return Promise.resolve(i);
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
    const i = {
      id: "invitation-" + String(this.data.size + 1),
      ...d,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Invitation;
    this.data.set(i.id, i);
    return Promise.resolve(i);
  }
  public update(id: string, c: Partial<Omit<Invitation, "id">>): Promise<Invitation> {
    const existing = this.findInvById(id);
    if (existing === null) return Promise.reject(new Error("Not found"));
    const updated = { ...existing, ...c, updatedAt: new Date() } as Invitation;
    this.data.set(existing.id, updated);
    return Promise.resolve(updated);
  }
  public delete(id: string): Promise<void> {
    for (const [key, i] of this.data.entries()) {
      if (i.id === id) {
        this.data.delete(key);
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  }
  private findInvById(id: string): Invitation | null {
    for (const i of this.data.values()) {
      if (i.id === id) return i;
    }
    return null;
  }
}

function seedData(
  mRepo: InMemoryMembershipRepo,
  orgRepo: InMemoryOrgRepo,
  wsRepo: InMemoryWsRepo,
  invRepo: InMemoryInvitationRepo,
): void {
  orgRepo.data.set(TEST_ORG_ID, createMockOrganization());
  wsRepo.data.set(TEST_WS_ID, createMockWorkspace());
  mRepo.data.set(
    "m-owner",
    createMockMembership({ id: "m-owner", userId: ORG_OWNER, role: MembershipRole.Owner }),
  );
  mRepo.data.set(
    "m-admin",
    createMockMembership({ id: "m-admin", userId: ORG_ADMIN, role: MembershipRole.Admin }),
  );
  mRepo.data.set(
    "m-member",
    createMockMembership({ id: "m-member", userId: ORG_MEMBER, role: MembershipRole.Member }),
  );
  mRepo.data.set(
    "m-viewer",
    createMockMembership({ id: "m-viewer", userId: ORG_VIEWER, role: MembershipRole.Viewer }),
  );
  mRepo.data.set(
    "m-target",
    createMockMembership({
      id: TEST_MEMBERSHIP_ID,
      userId: TARGET_USER,
      role: MembershipRole.Member,
    }),
  );
  invRepo.data.set(TEST_INVITATION_ID, createMockInvitation());
}

describe("Permission Matrix", () => {
  let orgService: OrganizationService;
  let wsService: WorkspaceService;
  let membershipService: MembershipService;
  let invitationService: InvitationService;
  let mRepo: InMemoryMembershipRepo;
  let orgRepo: InMemoryOrgRepo;
  let wsRepo: InMemoryWsRepo;
  let invRepo: InMemoryInvitationRepo;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    mRepo = new InMemoryMembershipRepo();
    orgRepo = new InMemoryOrgRepo();
    wsRepo = new InMemoryWsRepo();
    invRepo = new InMemoryInvitationRepo();

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

  beforeEach(() => {
    mRepo.data.clear();
    orgRepo.data.clear();
    wsRepo.data.clear();
    invRepo.data.clear();
    seedData(mRepo, orgRepo, wsRepo, invRepo);
  });

  /* ── Organization ────────────────────────────────────────────── */

  describe("OrganizationService.delete", () => {
    it("should allow Owner to delete", async () => {
      await expect(orgService.delete(TEST_ORG_ID, ORG_OWNER)).resolves.toBeUndefined();
    });

    it("should forbid Admin from deleting", async () => {
      await expect(orgService.delete(TEST_ORG_ID, ORG_ADMIN)).rejects.toThrow(ForbiddenException);
    });

    it("should forbid Member from deleting", async () => {
      await expect(orgService.delete(TEST_ORG_ID, ORG_MEMBER)).rejects.toThrow(ForbiddenException);
    });

    it("should forbid Viewer from deleting", async () => {
      await expect(orgService.delete(TEST_ORG_ID, ORG_VIEWER)).rejects.toThrow(ForbiddenException);
    });

    it("should forbid non-member from deleting", async () => {
      await expect(orgService.delete(TEST_ORG_ID, NON_MEMBER)).rejects.toThrow(ForbiddenException);
    });
  });

  /* ── Workspace ───────────────────────────────────────────────── */

  describe("WorkspaceService — all roles are members", () => {
    it("should allow Owner to create workspace", async () => {
      const ws = await wsService.create({ name: "WS" }, TEST_ORG_ID, ORG_OWNER);
      expect(ws.name).toBe("WS");
    });

    it("should allow Admin to create workspace", async () => {
      const ws = await wsService.create({ name: "WS" }, TEST_ORG_ID, ORG_ADMIN);
      expect(ws.name).toBe("WS");
    });

    it("should allow Member to create workspace", async () => {
      const ws = await wsService.create({ name: "WS" }, TEST_ORG_ID, ORG_MEMBER);
      expect(ws.name).toBe("WS");
    });

    it("should allow Viewer to create workspace", async () => {
      const ws = await wsService.create({ name: "WS" }, TEST_ORG_ID, ORG_VIEWER);
      expect(ws.name).toBe("WS");
    });

    it("should forbid non-member from creating workspace", async () => {
      await expect(wsService.create({ name: "WS" }, TEST_ORG_ID, NON_MEMBER)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should allow Viewer to update workspace", async () => {
      const ws = await wsService.update(TEST_WS_ID, { name: "Updated" }, ORG_VIEWER);
      expect(ws.name).toBe("Updated");
    });

    it("should allow Viewer to delete workspace", async () => {
      await expect(wsService.delete(TEST_WS_ID, ORG_VIEWER)).resolves.toBeUndefined();
    });
  });

  /* ── Membership ──────────────────────────────────────────────── */

  describe("MembershipService.create", () => {
    it("should allow Owner to create membership", async () => {
      const m = await membershipService.create(
        TEST_ORG_ID,
        { userId: "new-user", role: MembershipRole.Member },
        ORG_OWNER,
      );
      expect(m.role).toBe(MembershipRole.Member);
    });

    it("should allow Admin to create membership", async () => {
      const m = await membershipService.create(
        TEST_ORG_ID,
        { userId: "new-user", role: MembershipRole.Member },
        ORG_ADMIN,
      );
      expect(m.role).toBe(MembershipRole.Member);
    });

    it("should forbid Member from creating membership", async () => {
      await expect(
        membershipService.create(
          TEST_ORG_ID,
          { userId: "new-user", role: MembershipRole.Member },
          ORG_MEMBER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should forbid Viewer from creating membership", async () => {
      await expect(
        membershipService.create(
          TEST_ORG_ID,
          { userId: "new-user", role: MembershipRole.Member },
          ORG_VIEWER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("MembershipService.update", () => {
    it("should allow Owner to update membership", async () => {
      const m = await membershipService.update(
        TEST_MEMBERSHIP_ID,
        { role: MembershipRole.Admin },
        ORG_OWNER,
      );
      expect(m.role).toBe(MembershipRole.Admin);
    });

    it("should allow Admin to update membership", async () => {
      const m = await membershipService.update(
        TEST_MEMBERSHIP_ID,
        { role: MembershipRole.Admin },
        ORG_ADMIN,
      );
      expect(m.role).toBe(MembershipRole.Admin);
    });

    it("should forbid Member from updating membership", async () => {
      await expect(
        membershipService.update(TEST_MEMBERSHIP_ID, { role: MembershipRole.Admin }, ORG_MEMBER),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should forbid Viewer from updating membership", async () => {
      await expect(
        membershipService.update(TEST_MEMBERSHIP_ID, { role: MembershipRole.Admin }, ORG_VIEWER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("MembershipService.delete", () => {
    it("should allow Owner to delete membership", async () => {
      await expect(
        membershipService.delete(TEST_MEMBERSHIP_ID, ORG_OWNER),
      ).resolves.toBeUndefined();
    });

    it("should allow Admin to delete membership", async () => {
      await expect(
        membershipService.delete(TEST_MEMBERSHIP_ID, ORG_ADMIN),
      ).resolves.toBeUndefined();
    });

    it("should forbid Member from deleting membership", async () => {
      await expect(membershipService.delete(TEST_MEMBERSHIP_ID, ORG_MEMBER)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should forbid Viewer from deleting membership", async () => {
      await expect(membershipService.delete(TEST_MEMBERSHIP_ID, ORG_VIEWER)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  /* ── Invitation ──────────────────────────────────────────────── */

  describe("InvitationService.create", () => {
    it("should allow Owner to create invitation", async () => {
      const inv = await invitationService.create(
        { email: "new@example.com", role: MembershipRole.Member },
        TEST_ORG_ID,
        ORG_OWNER,
      );
      expect(inv.email).toBe("new@example.com");
    });

    it("should allow Admin to create invitation", async () => {
      const inv = await invitationService.create(
        { email: "new@example.com", role: MembershipRole.Member },
        TEST_ORG_ID,
        ORG_ADMIN,
      );
      expect(inv.email).toBe("new@example.com");
    });

    it("should forbid Member from creating invitation", async () => {
      await expect(
        invitationService.create(
          { email: "new@example.com", role: MembershipRole.Member },
          TEST_ORG_ID,
          ORG_MEMBER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should forbid Viewer from creating invitation", async () => {
      await expect(
        invitationService.create(
          { email: "new@example.com", role: MembershipRole.Member },
          TEST_ORG_ID,
          ORG_VIEWER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("InvitationService.revoke", () => {
    it("should allow Owner to revoke invitation", async () => {
      await expect(
        invitationService.revoke(TEST_INVITATION_ID, ORG_OWNER),
      ).resolves.toBeUndefined();
    });

    it("should allow Admin to revoke invitation", async () => {
      await expect(
        invitationService.revoke(TEST_INVITATION_ID, ORG_ADMIN),
      ).resolves.toBeUndefined();
    });

    it("should forbid Member from revoking invitation", async () => {
      await expect(invitationService.revoke(TEST_INVITATION_ID, ORG_MEMBER)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should forbid Viewer from revoking invitation", async () => {
      await expect(invitationService.revoke(TEST_INVITATION_ID, ORG_VIEWER)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
