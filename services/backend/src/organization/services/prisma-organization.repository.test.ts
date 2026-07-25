import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaOrganizationRepository } from "./prisma-organization.repository.js";
import type { PrismaService } from "../../prisma/prisma.service.js";

function createDbRow(overrides?: Partial<Record<string, unknown>>): Record<string, unknown> {
  return {
    id: "org-1",
    name: "Test Org",
    slug: "test-org",
    ownerId: "user-1",
    branding: { logoUrl: "https://example.com/logo.png" },
    settings: {},
    metadata: {},
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("PrismaOrganizationRepository", () => {
  let repo: PrismaOrganizationRepository;
  const mockFindUnique = vi.fn();
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    const mockPrisma = {
      organization: {
        findUnique: mockFindUnique,
        findMany: vi.fn(),
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
      },
    } as unknown as PrismaService;
    repo = new PrismaOrganizationRepository(mockPrisma);
  });

  describe("findById", () => {
    it("should return organization when found", async () => {
      mockFindUnique.mockResolvedValue(createDbRow());
      const result = await repo.findById("org-1");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("org-1");
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "org-1" } });
    });

    it("should return null when not found", async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await repo.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findBySlug", () => {
    it("should return organization when found", async () => {
      mockFindUnique.mockResolvedValue(createDbRow());
      const result = await repo.findBySlug("test-org");
      expect(result).not.toBeNull();
      expect(result?.slug).toBe("test-org");
    });

    it("should return null when not found", async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await repo.findBySlug("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and return organization", async () => {
      mockCreate.mockResolvedValue(createDbRow());
      const result = await repo.create({
        name: "Test Org",
        slug: "test-org",
        ownerId: "user-1",
        branding: { logoUrl: "https://example.com/logo.png" },
        settings: {
          security: { sessionTimeoutMinutes: 60, requireMfa: false, allowedIpRanges: [], allowedEmailDomains: [], maximumLoginAttempts: 5 },
          authentication: { allowedProviders: ["email"], defaultProvider: "email", enableRegistration: true, enablePasswordReset: true, enableSessionManagement: true },
          ai: { enabledProviders: [], blockedProviders: [], defaultProvider: null, allowedModels: [], blockedModels: [], maxInputTokens: null, maxOutputTokens: null, allowImageGeneration: false, allowAudioGeneration: false, allowEmbeddings: false, allowModeration: false, allowTools: false, allowMcp: false, allowRag: false, allowPromptTemplates: false, allowConversationMemory: false, allowStreaming: false },
          storage: { maxStorageBytes: null, maxUploadSizeBytes: null, allowedFileTypes: [], blockedFileTypes: [], retentionDays: null, enableVersioning: false },
          regional: { defaultLocale: "en-US", defaultTimezone: "UTC", allowedLocales: ["en-US"], dateFormat: "YYYY-MM-DD", timeFormat: "24h", firstDayOfWeek: 1, country: "US", region: "us-east", currency: "USD", language: "en", legalRegion: "US", billingRegion: "US", paymentRegion: "US", privacyRegion: "US", dataResidencyRegion: "US" },
          featureFlags: {},
          billing: { enabledProviders: [], defaultCurrency: "USD", billingEmail: null, invoicePrefix: null, taxId: null, paymentTermsDays: 30, autoInvoicing: false, currency: {} },
        },
        metadata: {},
      });
      expect(result.id).toBe("org-1");
    });
  });

  describe("update", () => {
    it("should update and return organization", async () => {
      const updatedRow = createDbRow({ name: "Updated Org" });
      mockUpdate.mockResolvedValue(updatedRow);
      const result = await repo.update("org-1", { name: "Updated Org" });
      expect(result.name).toBe("Updated Org");
    });
  });

  describe("delete", () => {
    it("should delete organization", async () => {
      mockDelete.mockResolvedValue(undefined);
      await expect(repo.delete("org-1")).resolves.toBeUndefined();
    });
  });
});
