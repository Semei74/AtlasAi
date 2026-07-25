import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismaOrganizationSettingsRepository } from "./prisma-organization-settings.repository.js";
import type { PrismaService } from "../../prisma/prisma.service.js";

function createMockPrisma(): PrismaService {
  return {
    organization: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  } as unknown as PrismaService;
}

const SETTINGS = {
  security: { sessionTimeoutMinutes: 60, requireMfa: false, allowedIpRanges: [] as string[], allowedEmailDomains: [] as string[], maximumLoginAttempts: 5 },
  authentication: { allowedProviders: ["email"] as string[], defaultProvider: "email" as const, enableRegistration: true, enablePasswordReset: true, enableSessionManagement: true },
  ai: { enabledProviders: [] as string[], blockedProviders: [] as string[], defaultProvider: null, allowedModels: [] as string[], blockedModels: [] as string[], maxInputTokens: null, maxOutputTokens: null, allowImageGeneration: false, allowAudioGeneration: false, allowEmbeddings: false, allowModeration: false, allowTools: false, allowMcp: false, allowRag: false, allowPromptTemplates: false, allowConversationMemory: false, allowStreaming: false },
  storage: { maxStorageBytes: null, maxUploadSizeBytes: null, allowedFileTypes: [] as string[], blockedFileTypes: [] as string[], retentionDays: null, enableVersioning: false },
  regional: { defaultLocale: "en-US", defaultTimezone: "UTC", allowedLocales: ["en-US"] as string[], dateFormat: "YYYY-MM-DD", timeFormat: "24h" as const, firstDayOfWeek: 1, country: "US", region: "us-east", currency: "USD", language: "en", legalRegion: "US", billingRegion: "US", paymentRegion: "US", privacyRegion: "US", dataResidencyRegion: "US" },
  featureFlags: {} as Record<string, never>,
  billing: { enabledProviders: [] as string[], defaultCurrency: "USD", billingEmail: null, invoicePrefix: null, taxId: null, paymentTermsDays: 30, autoInvoicing: false, currency: {} },
};

describe("PrismaOrganizationSettingsRepository", () => {
  let mockPrisma: PrismaService;
  let repo: PrismaOrganizationSettingsRepository;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    repo = new PrismaOrganizationSettingsRepository(mockPrisma);
  });

  describe("findByOrganizationId", () => {
    it("should return settings when organization exists", async () => {
      (mockPrisma.organization.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: SETTINGS,
      });
      const result = await repo.findByOrganizationId("org-1");
      expect(result).not.toBeNull();
      expect(result?.security.sessionTimeoutMinutes).toBe(60);
    });

    it("should return null when organization not found", async () => {
      (mockPrisma.organization.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const result = await repo.findByOrganizationId("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("should update and return settings", async () => {
      (mockPrisma.organization.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: SETTINGS,
      });
      const result = await repo.save("org-1", SETTINGS);
      expect(result.security.sessionTimeoutMinutes).toBe(60);
    });
  });
});
