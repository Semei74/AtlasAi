import { Module } from "@nestjs/common";
import { MembershipModule } from "../membership/membership.module.js";
import { WORKSPACE_REPOSITORY } from "./interfaces/workspace-repository.interface.js";
import { WorkspaceService } from "./services/workspace.service.js";
import { WorkspaceController } from "./controllers/workspace.controller.js";
import { PrismaWorkspaceRepository } from "./services/prisma-workspace.repository.js";

@Module({
  imports: [MembershipModule],
  controllers: [WorkspaceController],
  providers: [
    WorkspaceService,
    { provide: WORKSPACE_REPOSITORY, useClass: PrismaWorkspaceRepository },
  ],
  exports: [WORKSPACE_REPOSITORY, WorkspaceService],
})
export class WorkspaceModule {}
