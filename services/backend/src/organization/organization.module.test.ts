import { describe, it, expect } from "vitest";
import { Test } from "@nestjs/testing";
import { PrismaModule } from "../prisma/prisma.module.js";
import { OrganizationModule } from "./organization.module.js";
import { ORGANIZATION_REPOSITORY } from "./interfaces/organization-repository.interface.js";
import type { OrganizationRepository } from "./interfaces/organization-repository.interface.js";

describe("OrganizationModule", () => {
  it("should provide ORGANIZATION_REPOSITORY", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [OrganizationModule, PrismaModule],
    }).compile();

    const repo = moduleRef.get<OrganizationRepository>(ORGANIZATION_REPOSITORY);
    expect(repo).toBeDefined();
  });
});
