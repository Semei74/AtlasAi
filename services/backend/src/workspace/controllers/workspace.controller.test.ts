import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { WorkspaceController } from "./workspace.controller.js";
import type { WorkspaceService } from "../services/workspace.service.js";
import type { Workspace } from "../interfaces/workspace.interface.js";
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

function createRequestWithUser(userId: string, orgId?: string): FastifyRequest {
  return { user: { sub: userId, organizationId: orgId ?? null } } as unknown as FastifyRequest;
}

function createRequestWithoutUser(): FastifyRequest {
  return {} as FastifyRequest;
}

describe("WorkspaceController", () => {
  const mockWs = createMockWorkspace();
  const mockCreate = vi.fn();
  const mockFindById = vi.fn();
  const mockFindByOrgId = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();

  const mockService = {
    create: mockCreate,
    findById: mockFindById,
    findByOrganizationId: mockFindByOrgId,
    update: mockUpdate,
    delete: mockDelete,
  } as unknown as WorkspaceService;

  const controller = new WorkspaceController(mockService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    const createDto: CreateWorkspaceDto = { name: "New WS" };

    it("should create a workspace", async () => {
      mockCreate.mockResolvedValue(mockWs);

      const result = await controller.create(
        createDto,
        createRequestWithUser(TEST_USER_ID, TEST_ORG_ID),
      );

      expect(result.id).toBe(TEST_WS_ID);
      expect(result.name).toBe("Test Workspace");
      expect(mockCreate).toHaveBeenCalledWith(createDto, TEST_ORG_ID, TEST_USER_ID);
    });

    it("should use organizationId from JWT when tenant is not available", async () => {
      mockCreate.mockResolvedValue(mockWs);

      await controller.create(createDto, createRequestWithUser(TEST_USER_ID, TEST_ORG_ID));

      expect(mockCreate).toHaveBeenCalledWith(expect.anything(), TEST_ORG_ID, TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.create(createDto, createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("findAll", () => {
    it("should return list of workspaces", async () => {
      mockFindByOrgId.mockResolvedValue([mockWs]);

      const result = await controller.findAll(createRequestWithUser(TEST_USER_ID, TEST_ORG_ID));

      expect(result).toHaveLength(1);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.findAll(createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("findById", () => {
    it("should return workspace by id", async () => {
      mockFindById.mockResolvedValue(mockWs);

      const result = await controller.findById(TEST_WS_ID, createRequestWithUser(TEST_USER_ID));

      expect(result.id).toBe(TEST_WS_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.findById(TEST_WS_ID, createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("update", () => {
    const updateDto: UpdateWorkspaceDto = { name: "Updated" };

    it("should update a workspace", async () => {
      const updatedWs = { ...mockWs, name: "Updated" };
      mockUpdate.mockResolvedValue(updatedWs);

      const result = await controller.update(
        TEST_WS_ID,
        updateDto,
        createRequestWithUser(TEST_USER_ID),
      );

      expect(result.name).toBe("Updated");
      expect(mockUpdate).toHaveBeenCalledWith(TEST_WS_ID, updateDto, TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.update(TEST_WS_ID, updateDto, createRequestWithoutUser()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("delete", () => {
    it("should delete a workspace", async () => {
      mockDelete.mockResolvedValue(undefined);

      await expect(
        controller.delete(TEST_WS_ID, createRequestWithUser(TEST_USER_ID)),
      ).resolves.toBeUndefined();

      expect(mockDelete).toHaveBeenCalledWith(TEST_WS_ID, TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.delete(TEST_WS_ID, createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
