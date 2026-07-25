import { describe, it, expect } from "vitest";
import { Test } from "@nestjs/testing";
import { PrismaModule } from "../prisma/prisma.module.js";
import { WorkspaceModule } from "./workspace.module.js";
import { WORKSPACE_REPOSITORY } from "./interfaces/workspace-repository.interface.js";
import type { WorkspaceRepository } from "./interfaces/workspace-repository.interface.js";

describe("WorkspaceModule", () => {
  it("should provide WORKSPACE_REPOSITORY", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WorkspaceModule, PrismaModule],
    }).compile();

    const repo = moduleRef.get<WorkspaceRepository>(WORKSPACE_REPOSITORY);
    expect(repo).toBeDefined();
  });
});
