import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { OrganizationController } from "./organization.controller.js";
import type { OrganizationService } from "../services/organization.service.js";
import type { Organization } from "../interfaces/organization.interface.js";
import type { CreateOrganizationDto } from "../dto/create-organization.dto.js";
import type { UpdateOrganizationDto } from "../dto/update-organization.dto.js";

const TEST_USER_ID = "user-123";

function createMockOrganization(overrides?: Partial<Organization>): Organization {
  return {
    id: "org-456",
    name: "Test Organization",
    slug: "test-org",
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
    ...overrides,
  };
}

function createRequestWithUser(userId: string): FastifyRequest {
  return { user: { sub: userId } } as unknown as FastifyRequest;
}

function createRequestWithoutUser(): FastifyRequest {
  return {} as FastifyRequest;
}

describe("OrganizationController", () => {
  const mockOrg = createMockOrganization();
  const mockCreate = vi.fn();
  const mockFindById = vi.fn();
  const mockFindAllByUserId = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();

  const mockService = {
    create: mockCreate,
    findById: mockFindById,
    findAllByUserId: mockFindAllByUserId,
    update: mockUpdate,
    delete: mockDelete,
  } as unknown as OrganizationService;

  const controller = new OrganizationController(mockService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    const createDto: CreateOrganizationDto = { name: "New Org", slug: "new-org" };

    it("should create an organization and return response DTO", async () => {
      mockCreate.mockResolvedValue(mockOrg);

      const result = await controller.create(createDto, createRequestWithUser(TEST_USER_ID));

      expect(result.id).toBe(mockOrg.id);
      expect(result.name).toBe(mockOrg.name);
      expect(result.slug).toBe(mockOrg.slug);
      expect(mockCreate).toHaveBeenCalledWith(createDto, TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.create(createDto, createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("findAll", () => {
    it("should return list of organizations", async () => {
      mockFindAllByUserId.mockResolvedValue([mockOrg]);

      const result = await controller.findAll(createRequestWithUser(TEST_USER_ID));

      expect(result).toHaveLength(1);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.findAll(createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("findById", () => {
    it("should return organization by id", async () => {
      mockFindById.mockResolvedValue(mockOrg);

      const result = await controller.findById("org-456", createRequestWithUser(TEST_USER_ID));

      expect(result.id).toBe("org-456");
      expect(mockFindById).toHaveBeenCalledWith("org-456", TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.findById("org-456", createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should propagate service errors", async () => {
      mockFindById.mockRejectedValue(new Error("Not found"));

      await expect(
        controller.findById("nonexistent", createRequestWithUser(TEST_USER_ID)),
      ).rejects.toThrow("Not found");
    });
  });

  describe("update", () => {
    const updateDto: UpdateOrganizationDto = { name: "Updated" };

    it("should update organization", async () => {
      const updatedOrg = { ...mockOrg, name: "Updated" };
      mockUpdate.mockResolvedValue(updatedOrg);

      const result = await controller.update(
        "org-456",
        updateDto,
        createRequestWithUser(TEST_USER_ID),
      );

      expect(result.name).toBe("Updated");
      expect(mockUpdate).toHaveBeenCalledWith("org-456", updateDto, TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(
        controller.update("org-456", updateDto, createRequestWithoutUser()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("delete", () => {
    it("should delete organization", async () => {
      mockDelete.mockResolvedValue(undefined);

      await expect(
        controller.delete("org-456", createRequestWithUser(TEST_USER_ID)),
      ).resolves.toBeUndefined();

      expect(mockDelete).toHaveBeenCalledWith("org-456", TEST_USER_ID);
    });

    it("should throw UnauthorizedException when user is not available", async () => {
      await expect(controller.delete("org-456", createRequestWithoutUser())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
