import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { OrganizationService } from "./organization.service.js";
import { ORGANIZATION_REPOSITORY } from "../interfaces/organization-repository.interface.js";
import type { OrganizationRepository } from "../interfaces/organization-repository.interface.js";
import { MEMBERSHIP_REPOSITORY } from "../../membership/interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../../membership/interfaces/membership-repository.interface.js";
import type { Organization } from "../interfaces/organization.interface.js";
import type { Membership } from "../../membership/interfaces/membership.interface.js";
import { MembershipRole } from "../../membership/interfaces/membership-role.enum.js";
import { MembershipStatus } from "../../membership/interfaces/membership-status.enum.js";
import type { CreateOrganizationDto } from "../dto/create-organization.dto.js";
import type { UpdateOrganizationDto } from "../dto/update-organization.dto.js";

const TEST_USER_ID = "user-123";
const TEST_ORG_ID = "org-456";
const TEST_SLUG = "test-org";

function createMockOrganization(overrides?: Partial<Organization>): Organization {
  return {
    id: TEST_ORG_ID,
    name: "Test Organization",
    slug: TEST_SLUG,
    ownerId: TEST_USER_ID,
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
      },
      featureFlags: {},
      billing: {},
    },
    metadata: {},
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

class MockOrganizationRepository implements OrganizationRepository {
  public organizations = new Map<string, Organization>();

  public findById(id: string): Promise<Organization | null> {
    return Promise.resolve(this.organizations.get(id) ?? null);
  }

  public findBySlug(slug: string): Promise<Organization | null> {
    for (const org of this.organizations.values()) {
      if (org.slug === slug) return Promise.resolve(org);
    }
    return Promise.resolve(null);
  }

  public create(data: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization> {
    const org: Organization = {
      id: "org-" + String(this.organizations.size + 1),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizations.set(org.id, org);
    return Promise.resolve(org);
  }

  public update(id: string, changes: Partial<Omit<Organization, "id">>): Promise<Organization> {
    const existing = this.organizations.get(id);
    if (existing === undefined) return Promise.reject(new Error("Not found"));
    const updated = { ...existing, ...changes, updatedAt: new Date() };
    const result: Organization = updated;
    this.organizations.set(id, result);
    return Promise.resolve(result);
  }

  public delete(id: string): Promise<void> {
    this.organizations.delete(id);
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

describe("OrganizationService", () => {
  let organizationService: OrganizationService;
  let mockOrgRepo: MockOrganizationRepository;
  let mockMembershipRepo: MockMembershipRepository;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    mockOrgRepo = new MockOrganizationRepository();
    mockMembershipRepo = new MockMembershipRepository();

    moduleRef = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: ORGANIZATION_REPOSITORY, useValue: mockOrgRepo },
        { provide: MEMBERSHIP_REPOSITORY, useValue: mockMembershipRepo },
      ],
    }).compile();

    organizationService = moduleRef.get<OrganizationService>(OrganizationService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    mockOrgRepo.organizations.clear();
    mockMembershipRepo.memberships.clear();
  });

  describe("create", () => {
    const createDto: CreateOrganizationDto = {
      name: "New Org",
      slug: "new-org",
    };

    it("should create an organization and owner membership", async () => {
      const org = await organizationService.create(createDto, TEST_USER_ID);

      expect(org.name).toBe("New Org");
      expect(org.slug).toBe("new-org");
      expect(org.ownerId).toBe(TEST_USER_ID);

      const memberships = await mockMembershipRepo.findByUserId(TEST_USER_ID);
      expect(memberships).toHaveLength(1);
      expect(memberships[0]?.role).toBe(MembershipRole.Owner);
      expect(memberships[0]?.status).toBe(MembershipStatus.Active);
    });

    it("should throw ConflictException when slug already exists", async () => {
      mockOrgRepo.organizations.set(TEST_ORG_ID, createMockOrganization({ slug: "new-org" }));

      await expect(organizationService.create(createDto, TEST_USER_ID)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw ConflictException with descriptive message", async () => {
      mockOrgRepo.organizations.set(TEST_ORG_ID, createMockOrganization({ slug: "new-org" }));

      await expect(organizationService.create(createDto, TEST_USER_ID)).rejects.toThrow(
        "Organization with this slug already exists",
      );
    });
  });

  describe("findById", () => {
    it("should return an organization when it exists", async () => {
      mockOrgRepo.organizations.set(TEST_ORG_ID, createMockOrganization());

      const org = await organizationService.findById(TEST_ORG_ID);

      expect(org.id).toBe(TEST_ORG_ID);
      expect(org.name).toBe("Test Organization");
    });

    it("should throw NotFoundException when organization does not exist", async () => {
      await expect(organizationService.findById("nonexistent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAllByUserId", () => {
    it("should return all organizations for a user", async () => {
      mockOrgRepo.organizations.set(TEST_ORG_ID, createMockOrganization());
      mockOrgRepo.organizations.set(
        "org-789",
        createMockOrganization({ id: "org-789", slug: "org-789" }),
      );
      mockMembershipRepo.memberships.set(
        "m1",
        createMockMembership({ organizationId: TEST_ORG_ID }),
      );
      mockMembershipRepo.memberships.set(
        "m2",
        createMockMembership({ id: "m2", organizationId: "org-789" }),
      );

      const orgs = await organizationService.findAllByUserId(TEST_USER_ID);

      expect(orgs).toHaveLength(2);
    });

    it("should return empty array when user has no memberships", async () => {
      const orgs = await organizationService.findAllByUserId(TEST_USER_ID);

      expect(orgs).toHaveLength(0);
    });

    it("should skip organizations that no longer exist", async () => {
      mockMembershipRepo.memberships.set(
        "m1",
        createMockMembership({ organizationId: "nonexistent-org" }),
      );

      const orgs = await organizationService.findAllByUserId(TEST_USER_ID);

      expect(orgs).toHaveLength(0);
    });
  });

  describe("update", () => {
    const updateDto: UpdateOrganizationDto = {
      name: "Updated Org",
    };

    it("should update organization name", async () => {
      mockOrgRepo.organizations.set(TEST_ORG_ID, createMockOrganization());
      mockMembershipRepo.memberships.set("m1", createMockMembership());

      const updated = await organizationService.update(TEST_ORG_ID, updateDto, TEST_USER_ID);

      expect(updated.name).toBe("Updated Org");
    });

    it("should throw NotFoundException when organization does not exist", async () => {
      await expect(
        organizationService.update("nonexistent", updateDto, TEST_USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException when user is not a member", async () => {
      mockOrgRepo.organizations.set(TEST_ORG_ID, createMockOrganization());

      await expect(
        organizationService.update(TEST_ORG_ID, updateDto, "other-user"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw ForbiddenException when user is not admin or owner", async () => {
      mockOrgRepo.organizations.set(TEST_ORG_ID, createMockOrganization());
      mockMembershipRepo.memberships.set(
        "m1",
        createMockMembership({ role: MembershipRole.Viewer, userId: TEST_USER_ID }),
      );

      await expect(
        organizationService.update(TEST_ORG_ID, updateDto, TEST_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw ConflictException when slug already exists", async () => {
      mockOrgRepo.organizations.set(TEST_ORG_ID, createMockOrganization());
      mockOrgRepo.organizations.set(
        "org-other",
        createMockOrganization({ id: "org-other", slug: "existing-slug" }),
      );
      mockMembershipRepo.memberships.set("m1", createMockMembership());

      await expect(
        organizationService.update(TEST_ORG_ID, { slug: "existing-slug" }, TEST_USER_ID),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("delete", () => {
    it("should delete an organization", async () => {
      mockOrgRepo.organizations.set(TEST_ORG_ID, createMockOrganization());
      mockMembershipRepo.memberships.set("m1", createMockMembership());

      await organizationService.delete(TEST_ORG_ID, TEST_USER_ID);

      expect(mockOrgRepo.organizations.has(TEST_ORG_ID)).toBe(false);
    });

    it("should throw NotFoundException when organization does not exist", async () => {
      await expect(organizationService.delete("nonexistent", TEST_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user is not the owner", async () => {
      mockOrgRepo.organizations.set(TEST_ORG_ID, createMockOrganization());
      mockMembershipRepo.memberships.set(
        "m1",
        createMockMembership({ role: MembershipRole.Admin, userId: TEST_USER_ID }),
      );

      await expect(organizationService.delete(TEST_ORG_ID, TEST_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
