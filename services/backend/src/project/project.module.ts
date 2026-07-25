import { Module } from "@nestjs/common";
import { MembershipModule } from "../membership/membership.module.js";
import { PROJECT_REPOSITORY } from "./interfaces/project-repository.interface.js";
import { ACTIVITY_LOG_REPOSITORY } from "./interfaces/activity-log-repository.interface.js";
import { ProjectService } from "./project.service.js";
import { ProjectController } from "./project.controller.js";
import { ActivityController } from "./activity.controller.js";
import { PrismaProjectRepository } from "./services/prisma-project.repository.js";
import { PrismaActivityLogRepository } from "./services/prisma-activity-log.repository.js";

@Module({
  imports: [MembershipModule],
  controllers: [ProjectController, ActivityController],
  providers: [
    ProjectService,
    { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository },
    { provide: ACTIVITY_LOG_REPOSITORY, useClass: PrismaActivityLogRepository },
  ],
  exports: [PROJECT_REPOSITORY, ACTIVITY_LOG_REPOSITORY, ProjectService],
})
export class ProjectModule {}
