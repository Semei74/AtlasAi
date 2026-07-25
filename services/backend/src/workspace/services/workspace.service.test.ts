import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service.js";
import { WORKSPACE_REPOSITORY } from "../interfaces/workspace-repository.interface.js";
import type { WorkspaceRepository } from "../interfaces/workspace-repository.interface.js";
import { MEMBERSHIP_REPOSITORY } from "../../membership/interfaces/membership-repository.interface.js";
import type { MembershipRepository } from "../../membership/interfaces/membership-repository.interface.js";
import type { Workspace } from "../interfaces/workspace.interface.js";
import type { Membership } from "../../membership/interfaces/membership.interface.js";
import { MembershipRole } from "../../membership/interfaces/membership-role.enum.js";
import { MembershipStatus } from "../../membership/interfaces/membership-status.enum.js";
import type { CreateWorkspaceDto } from "../dto/create-workspace.dto.js";
import type { UpdateWorkspaceDto } from "../dto/update-workspace.dto.js";

const TEST_USER_ID = "user-123";
const TEST_ORG_ID = "org-456";
const TEST_WS_ID = "ws-789";

function createMockWorkspace(overrides?: Partial<Workspace>): Workspace {
  return {
    id: TEST_WS_ID,
    organizationId: TEST_ORG_ID,
    name: "Test Workspace",
    description: null,
    color: null,
    icon: null,
    settings: {
      config: {},
      ai: {},
      storage: {},
      promptLibraryIds: [],
    },
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
    role: MembershipRole.Admin,
    status: MembershipStatus.Active,
    joinedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

class MockWorkspaceRepository implements WorkspaceRepository {
  public workspaces = new Map<string, Workspace>();

  public findById(id: string): Promise<Workspace | null> {
    return Promise.resolve(this.workspaces.get(id) ?? null);
  }

  public findByOrganizationId(organizationId: string): Promise<Workspace[]> {
    return Promise.resolve(
      Array.from(this.workspaces.values()).filter((w) => w.organizationId === organizationId),
    );
  }

  public create(data: Omit<Workspace, "id" | "createdAt" | "updatedAt">): Promise<Workspace> {
    const ws: Workspace = {
      id: "ws-" + String(this.workspaces.size + 1),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workspaces.set(ws.id, ws);
    return Promise.resolve(ws);
  }

  public update(id: string, changes: Partial<Omit<Workspace, "id">>): Promise<Workspace> {
    const existing = this.workspaces.get(id);
    if (existing === undefined) return Promise.reject(new Error("Not found"));
    const updated = { ...existing, ...changes, updatedAt: new Date() };
    const result: Workspace = updated;
    this.workspaces.set(id, result);
    return Promise.resolve(result);
  }

  public delete(id: string): Promise<void> {
    this.workspaces.delete(id);
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

describe("WorkspaceService", () => {
  let workspaceService: WorkspaceService;
  let mockWsRepo: MockWorkspaceRepository;
  let mockMembershipRepo: MockMembershipRepository;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    mockWsRepo = new MockWorkspaceRepository();
    mockMembershipRepo = new MockMembershipRepository();

    moduleRef = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: WORKSPACE_REPOSITORY, useValue: mockWsRepo },
        { provide: MEMBERSHIP_REPOSITORY, useValue: mockMembershipRepo },
      ],
    }).compile();

    workspaceService = moduleRef.get<WorkspaceService>(WorkspaceService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    mockWsRepo.workspaces.clear();
    mockMembershipRepo.memberships.clear();
  });

  describe("create", () => {
    const createDto: CreateWorkspaceDto = {
      name: "New Workspace",
      description: "A test workspace",
      color: "#FF0000",
      icon: "star",
    };

    it("should create a workspace", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());

      const ws = await workspaceService.create(createDto, TEST_ORG_ID, TEST_USER_ID);

      expect(ws.name).toBe("New Workspace");
      expect(ws.description).toBe("A test workspace");
      expect(ws.organizationId).toBe(TEST_ORG_ID);
    });

    it("should throw ForbiddenException when user is not a member", async () => {
      await expect(workspaceService.create(createDto, TEST_ORG_ID, TEST_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("findByOrganizationId", () => {
    it("should return workspaces for an organization", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());
      mockWsRepo.workspaces.set(TEST_WS_ID, createMockWorkspace());
      mockWsRepo.workspaces.set(
        "ws-other",
        createMockWorkspace({ id: "ws-other", name: "Other WS" }),
      );

      const workspaces = await workspaceService.findByOrganizationId(TEST_ORG_ID, TEST_USER_ID);

      expect(workspaces).toHaveLength(2);
    });

    it("should throw ForbiddenException when user is not a member", async () => {
      await expect(
        workspaceService.findByOrganizationId(TEST_ORG_ID, TEST_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should return empty array when no workspaces exist", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());

      const workspaces = await workspaceService.findByOrganizationId(TEST_ORG_ID, TEST_USER_ID);

      expect(workspaces).toHaveLength(0);
    });
  });

  describe("findById", () => {
    it("should return a workspace by id", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());
      mockWsRepo.workspaces.set(TEST_WS_ID, createMockWorkspace());

      const ws = await workspaceService.findById(TEST_WS_ID, TEST_USER_ID);

      expect(ws.id).toBe(TEST_WS_ID);
      expect(ws.name).toBe("Test Workspace");
    });

    it("should throw NotFoundException when workspace does not exist", async () => {
      await expect(workspaceService.findById("nonexistent", TEST_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user is not a member of the org", async () => {
      mockWsRepo.workspaces.set(TEST_WS_ID, createMockWorkspace());

      await expect(workspaceService.findById(TEST_WS_ID, TEST_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("update", () => {
    const updateDto: UpdateWorkspaceDto = { name: "Updated WS" };

    it("should update a workspace", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());
      mockWsRepo.workspaces.set(TEST_WS_ID, createMockWorkspace());

      const updated = await workspaceService.update(TEST_WS_ID, updateDto, TEST_USER_ID);

      expect(updated.name).toBe("Updated WS");
    });

    it("should throw NotFoundException when workspace does not exist", async () => {
      await expect(workspaceService.update("nonexistent", updateDto, TEST_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user is not a member", async () => {
      mockWsRepo.workspaces.set(TEST_WS_ID, createMockWorkspace());

      await expect(workspaceService.update(TEST_WS_ID, updateDto, TEST_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("delete", () => {
    it("should delete a workspace", async () => {
      mockMembershipRepo.memberships.set("m1", createMockMembership());
      mockWsRepo.workspaces.set(TEST_WS_ID, createMockWorkspace());

      await workspaceService.delete(TEST_WS_ID, TEST_USER_ID);

      expect(mockWsRepo.workspaces.has(TEST_WS_ID)).toBe(false);
    });

    it("should throw NotFoundException when workspace does not exist", async () => {
      await expect(workspaceService.delete("nonexistent", TEST_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user is not a member", async () => {
      mockWsRepo.workspaces.set(TEST_WS_ID, createMockWorkspace());

      await expect(workspaceService.delete(TEST_WS_ID, TEST_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
