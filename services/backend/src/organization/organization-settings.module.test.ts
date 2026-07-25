import { describe, it, expect } from "vitest";
import { Test } from "@nestjs/testing";
import { PrismaModule } from "../prisma/prisma.module.js";
import { OrganizationModule } from "./organization.module.js";
import { ORGANIZATION_SETTINGS_REPOSITORY } from "./interfaces/organization-settings-repository.interface.js";
import type { OrganizationSettingsRepository } from "./interfaces/organization-settings-repository.interface.js";

describe("OrganizationModule — ORGANIZATION_SETTINGS_REPOSITORY", () => {
  it("should provide ORGANIZATION_SETTINGS_REPOSITORY", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [OrganizationModule, PrismaModule],
    }).compile();

    const repo = moduleRef.get<OrganizationSettingsRepository>(ORGANIZATION_SETTINGS_REPOSITORY);
    expect(repo).toBeDefined();
  });
});
