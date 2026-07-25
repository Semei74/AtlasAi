import { describe, it, expect } from "vitest";
import { Test } from "@nestjs/testing";
import { PrismaModule } from "../prisma/prisma.module.js";
import { MembershipModule } from "./membership.module.js";
import { MEMBERSHIP_REPOSITORY } from "./interfaces/membership-repository.interface.js";
import { INVITATION_REPOSITORY } from "./interfaces/invitation-repository.interface.js";
import type { MembershipRepository } from "./interfaces/membership-repository.interface.js";
import type { InvitationRepository } from "./interfaces/invitation-repository.interface.js";

describe("MembershipModule", () => {
  it("should provide MEMBERSHIP_REPOSITORY", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MembershipModule, PrismaModule],
    }).compile();

    const repo = moduleRef.get<MembershipRepository>(MEMBERSHIP_REPOSITORY);
    expect(repo).toBeDefined();
  });

  it("should provide INVITATION_REPOSITORY", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MembershipModule, PrismaModule],
    }).compile();

    const repo = moduleRef.get<InvitationRepository>(INVITATION_REPOSITORY);
    expect(repo).toBeDefined();
  });
});
