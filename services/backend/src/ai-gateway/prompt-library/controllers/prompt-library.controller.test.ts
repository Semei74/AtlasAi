import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnauthorizedException, NotFoundException } from "@nestjs/common";
import type { RequestWithUser } from "../../../auth/authorization/guards/auth.guard.js";
import { PromptLibraryController } from "./prompt-library.controller.js";
import type { PromptService } from "../services/prompt.service.js";
import type { CreatePromptDto } from "../dto/create-prompt.dto.js";
import type { UpdatePromptDto } from "../dto/update-prompt.dto.js";
import type { CreateVersionDto } from "../dto/create-version.dto.js";
import type { RenderPromptDto } from "../dto/render-prompt.dto.js";
import type { PreviewPromptDto } from "../dto/preview-prompt.dto.js";
import type { PromptFilterDto } from "../dto/prompt-filter.dto.js";

const TEST_USER_ID = "user-123";
const TEST_ORG_ID = "org-456";
const TEST_PROMPT_ID = "prompt-789";
const TEST_WORKSPACE_ID = "workspace-abc";
const TEST_VERSION = "1.0.0";

function createRequestWithUser(overrides?: Partial<RequestWithUser>): RequestWithUser {
  return {
    user: { sub: TEST_USER_ID, organizationId: TEST_ORG_ID },
    headers: { "x-workspace-id": TEST_WORKSPACE_ID },
    ...overrides,
  } as unknown as RequestWithUser;
}

function createRequestWithUserNoOrg(): RequestWithUser {
  return {
    user: { sub: TEST_USER_ID, organizationId: null },
    headers: {},
  } as unknown as RequestWithUser;
}

function createRequestWithoutUser(): RequestWithUser {
  return {} as RequestWithUser;
}

describe("PromptLibraryController", () => {
  const mockResult = { id: TEST_PROMPT_ID, version: "0.0.0" };
  const mockPaginatedResult = {
    data: [mockResult],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
  const mockCategories = [{ id: "cat-1", name: "General", slug: "general" }];
  const mockVersions = [{ id: "ver-1", version: TEST_VERSION }];
  const mockValidation = { valid: true, errors: [], warnings: [] };
  const mockComparison = { versionA: {}, versionB: {} };

  const mockCreateFn = vi.fn();
  const mockListFn = vi.fn();
  const mockGetCategoriesFn = vi.fn();
  const mockGetByIdFn = vi.fn();
  const mockGetVersionsFn = vi.fn();
  const mockValidateFn = vi.fn();
  const mockUpdateFn = vi.fn();
  const mockDeleteFn = vi.fn();
  const mockCreateVersionFn = vi.fn();
  const mockRenderFn = vi.fn();
  const mockPreviewFn = vi.fn();
  const mockPublishFn = vi.fn();
  const mockArchiveFn = vi.fn();
  const mockRestoreFn = vi.fn();
  const mockRollbackFn = vi.fn();
  const mockCompareVersionsFn = vi.fn();

  const mockService = {
    create: mockCreateFn,
    list: mockListFn,
    getCategories: mockGetCategoriesFn,
    getById: mockGetByIdFn,
    getVersions: mockGetVersionsFn,
    validate: mockValidateFn,
    update: mockUpdateFn,
    delete: mockDeleteFn,
    createVersion: mockCreateVersionFn,
    render: mockRenderFn,
    preview: mockPreviewFn,
    publish: mockPublishFn,
    archive: mockArchiveFn,
    restore: mockRestoreFn,
    rollback: mockRollbackFn,
    compareVersions: mockCompareVersionsFn,
  } as unknown as PromptService;

  const controller = new PromptLibraryController(mockService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    const createDto: CreatePromptDto = {
      slug: "test-prompt",
      name: "Test Prompt",
      categoryId: "cat-1",
      description: "A test prompt",
      systemTemplate: "System: {{input}}",
      userTemplate: "User: {{input}}",
    };

    it("should create a prompt", async () => {
      mockCreateFn.mockResolvedValue(mockResult);

      const result = await controller.create(
        createDto,
        createRequestWithUser(),
      );

      expect(result).toBe(mockResult);
      expect(mockCreateFn).toHaveBeenCalledWith(
        createDto,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_WORKSPACE_ID,
      );
    });

    it("should pass undefined organizationId when user has no organization", async () => {
      mockCreateFn.mockResolvedValue(mockResult);

      const result = await controller.create(
        createDto,
        createRequestWithUserNoOrg(),
      );

      expect(result).toBe(mockResult);
      expect(mockCreateFn).toHaveBeenCalledWith(
        createDto,
        TEST_USER_ID,
        undefined,
        undefined,
      );
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.create(createDto, createRequestWithoutUser()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("list", () => {
    const filterDto: PromptFilterDto = {
      status: "Published",
      categoryId: "cat-1",
      search: "test",
      page: 1,
      limit: 20,
    };

    it("should return paginated prompts", async () => {
      mockListFn.mockResolvedValue(mockPaginatedResult);

      const result = await controller.list(
        filterDto,
        createRequestWithUser(),
      );

      expect(result).toBe(mockPaginatedResult);
      expect(mockListFn).toHaveBeenCalledWith({
        status: "Published",
        categoryId: "cat-1",
        search: "test",
        page: 1,
        limit: 20,
        organizationId: TEST_ORG_ID,
      });
    });

    it("should handle empty filter fields", async () => {
      mockListFn.mockResolvedValue(mockPaginatedResult);
      const emptyFilter: PromptFilterDto = {};

      const result = await controller.list(
        emptyFilter,
        createRequestWithUser(),
      );

      expect(result).toBe(mockPaginatedResult);
      expect(mockListFn).toHaveBeenCalledWith({
        organizationId: TEST_ORG_ID,
      });
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.list(filterDto, createRequestWithoutUser()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("getCategories", () => {
    it("should return prompt categories", async () => {
      mockGetCategoriesFn.mockResolvedValue(mockCategories);

      const result = await controller.getCategories();

      expect(result).toBe(mockCategories);
      expect(mockGetCategoriesFn).toHaveBeenCalledOnce();
    });
  });

  describe("getById", () => {
    it("should return a prompt by id", async () => {
      mockGetByIdFn.mockResolvedValue(mockResult);

      const result = await controller.getById(TEST_PROMPT_ID, createRequestWithUser());

      expect(result).toBe(mockResult);
      expect(mockGetByIdFn).toHaveBeenCalledWith(TEST_PROMPT_ID, TEST_ORG_ID);
    });
  });

  describe("getVersions", () => {
    it("should return version history", async () => {
      mockGetVersionsFn.mockResolvedValue(mockVersions);

      const result = await controller.getVersions(TEST_PROMPT_ID, createRequestWithUser());

      expect(result).toBe(mockVersions);
      expect(mockGetVersionsFn).toHaveBeenCalledWith(TEST_PROMPT_ID, TEST_ORG_ID);
    });
  });

  describe("validate", () => {
    it("should return validation result", async () => {
      mockValidateFn.mockResolvedValue(mockValidation);

      const result = await controller.validate(TEST_PROMPT_ID, createRequestWithUser());

      expect(result).toBe(mockValidation);
      expect(mockValidateFn).toHaveBeenCalledWith(TEST_PROMPT_ID, TEST_ORG_ID);
    });
  });

  describe("update", () => {
    const updateDto: UpdatePromptDto = {
      name: "Updated Prompt",
      description: "Updated description",
    };

    it("should update a prompt", async () => {
      mockUpdateFn.mockResolvedValue(mockResult);

      const result = await controller.update(TEST_PROMPT_ID, updateDto, createRequestWithUser());

      expect(result).toBe(mockResult);
      expect(mockUpdateFn).toHaveBeenCalledWith(TEST_PROMPT_ID, updateDto, TEST_ORG_ID);
    });
  });

  describe("delete", () => {
    it("should soft-delete a prompt and return void", async () => {
      mockDeleteFn.mockResolvedValue(undefined);

      await expect(
        controller.delete(TEST_PROMPT_ID, createRequestWithUser()),
      ).resolves.toBeUndefined();

      expect(mockDeleteFn).toHaveBeenCalledWith(TEST_PROMPT_ID, TEST_ORG_ID);
    });
  });

  describe("createVersion", () => {
    const createVersionDto: CreateVersionDto = {
      systemTemplate: "System: {{input}}",
      userTemplate: "User: {{input}}",
      changelog: "Initial version",
    };

    it("should create a new version", async () => {
      mockCreateVersionFn.mockResolvedValue(mockVersions[0]);

      const result = await controller.createVersion(
        TEST_PROMPT_ID,
        createVersionDto,
        createRequestWithUser(),
      );

      expect(result).toBe(mockVersions[0]);
      expect(mockCreateVersionFn).toHaveBeenCalledWith(
        TEST_PROMPT_ID,
        createVersionDto,
        TEST_USER_ID,
        TEST_ORG_ID,
      );
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.createVersion(TEST_PROMPT_ID, createVersionDto, createRequestWithoutUser()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("render", () => {
    const renderDto: RenderPromptDto = {
      variables: { input: "hello" },
      version: TEST_VERSION,
      redactPii: true,
    };

    it("should render a prompt with variables", async () => {
      mockRenderFn.mockResolvedValue(mockResult);

      const result = await controller.render(TEST_PROMPT_ID, renderDto, createRequestWithUser());

      expect(result).toBe(mockResult);
      expect(mockRenderFn).toHaveBeenCalledWith({
        promptId: TEST_PROMPT_ID,
        version: TEST_VERSION,
        variables: { input: "hello" },
        redactPii: true,
      }, TEST_ORG_ID);
    });

    it("should omit optional fields when not provided", async () => {
      const minimalDto: RenderPromptDto = { variables: {} };
      mockRenderFn.mockResolvedValue(mockResult);

      const result = await controller.render(TEST_PROMPT_ID, minimalDto, createRequestWithUser());

      expect(result).toBe(mockResult);
      expect(mockRenderFn).toHaveBeenCalledWith({
        promptId: TEST_PROMPT_ID,
        variables: {},
      }, TEST_ORG_ID);
    });
  });

  describe("preview", () => {
    const previewDto: PreviewPromptDto = {
      systemTemplate: "System: {{name}}",
      variables: { name: "World" },
    };

    it("should preview template rendering (synchronous)", () => {
      mockPreviewFn.mockReturnValue(mockResult);

      const result = controller.preview(previewDto);

      expect(result).toBe(mockResult);
      expect(mockPreviewFn).toHaveBeenCalledWith(previewDto);
    });
  });

  describe("publish", () => {
    it("should publish a prompt", async () => {
      mockPublishFn.mockResolvedValue(mockResult);

      const result = await controller.publish(TEST_PROMPT_ID, createRequestWithUser());

      expect(result).toBe(mockResult);
      expect(mockPublishFn).toHaveBeenCalledWith(TEST_PROMPT_ID, TEST_ORG_ID);
    });
  });

  describe("archive", () => {
    it("should archive a prompt", async () => {
      mockArchiveFn.mockResolvedValue(mockResult);

      const result = await controller.archive(TEST_PROMPT_ID, createRequestWithUser());

      expect(result).toBe(mockResult);
      expect(mockArchiveFn).toHaveBeenCalledWith(TEST_PROMPT_ID, TEST_ORG_ID);
    });
  });

  describe("restore", () => {
    it("should restore an archived prompt", async () => {
      mockRestoreFn.mockResolvedValue(mockResult);

      const result = await controller.restore(TEST_PROMPT_ID, createRequestWithUser());

      expect(result).toBe(mockResult);
      expect(mockRestoreFn).toHaveBeenCalledWith(TEST_PROMPT_ID, TEST_ORG_ID);
    });
  });

  describe("rollback", () => {
    it("should rollback to a previous version", async () => {
      mockRollbackFn.mockResolvedValue(mockResult);

      const result = await controller.rollback(TEST_PROMPT_ID, createRequestWithUser(), TEST_VERSION);

      expect(result).toBe(mockResult);
      expect(mockRollbackFn).toHaveBeenCalledWith(TEST_PROMPT_ID, TEST_VERSION, TEST_ORG_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.rollback(TEST_PROMPT_ID, createRequestWithoutUser(), TEST_VERSION),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw NotFoundException when version is missing", async () => {
      await expect(
        controller.rollback(TEST_PROMPT_ID, createRequestWithUser()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("compare", () => {
    it("should compare two versions", async () => {
      mockCompareVersionsFn.mockResolvedValue(mockComparison);

      const result = await controller.compare(TEST_PROMPT_ID, createRequestWithUser(), "1.0.0", "2.0.0");

      expect(result).toBe(mockComparison);
      expect(mockCompareVersionsFn).toHaveBeenCalledWith(
        TEST_PROMPT_ID,
        "1.0.0",
        "2.0.0",
        TEST_ORG_ID,
      );
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.compare(TEST_PROMPT_ID, createRequestWithoutUser(), "1.0.0", "2.0.0"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw NotFoundException when version params are missing", async () => {
      await expect(
        controller.compare(TEST_PROMPT_ID, createRequestWithUser(), undefined, "2.0.0"),
      ).rejects.toThrow(NotFoundException);

      await expect(
        controller.compare(TEST_PROMPT_ID, createRequestWithUser(), "1.0.0", undefined),
      ).rejects.toThrow(NotFoundException);

      await expect(
        controller.compare(TEST_PROMPT_ID, createRequestWithUser(), undefined, undefined),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
