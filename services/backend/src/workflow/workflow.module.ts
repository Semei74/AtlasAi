import { Module } from "@nestjs/common";
import { WORKFLOW_REPOSITORY } from "./interfaces/workflow-repository.interface.js";
import { WorkflowService } from "./services/workflow.service.js";
import { WorkflowRepositoryService } from "./services/prisma-workflow.repository.js";
import { WorkflowRuntime } from "./services/workflow.runtime.service.js";
import { SchedulerModule } from "../ai-platform/scheduler/scheduler.module.js";
import { NodeModule } from "./node/node.module.js";

@Module({
  imports: [SchedulerModule, NodeModule],
  providers: [
    {
      provide: WORKFLOW_REPOSITORY,
      useClass: WorkflowRepositoryService,
    },
    WorkflowService,
    WorkflowRuntime,
  ],
  exports: [WorkflowService, WorkflowRuntime],
})
export class WorkflowModule {}