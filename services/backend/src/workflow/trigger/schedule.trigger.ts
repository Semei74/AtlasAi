import { Inject, Injectable } from "@nestjs/common";
import type { WorkflowTrigger } from "../interfaces/workflow-trigger.interface.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowExecution } from "../interfaces/workflow-execution.interface.js";
import { SCHEDULE_REPOSITORY } from "../scheduler.tokens.js";
import { ScheduleRepository } from "../../ai-platform/scheduler/repositories/schedule.repository.js";
import { CreateScheduleDto } from "../../ai-platform/scheduler/dto/schedule.dto.js";
import { TriggerContract, getTriggerContract, TRIGGER_CONTRACTS } from "./trigger.interface.js";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";
import { WorkflowRuntime } from "../services/workflow.runtime.service.js";

@Injectable()
export class ScheduleTrigger {
  public constructor(
    @Inject(SCHEDULE_REPOSITORY) private readonly scheduleRepository: ScheduleRepository,
    @Inject(WORKFLOW_REPOSITORY) private readonly workflowRepository: WorkflowRepository,
    @Inject(WorkflowRuntime) private readonly workflowRuntime: WorkflowRuntime,
  ) {}

  public readonly triggerType = "schedule";

  public readonly handler = async (
    trigger: WorkflowTrigger,
    definition: WorkflowDefinition,
    context: {
      userId: string;
      organizationId: string;
      workspaceId?: string;
    },
  ): Promise<TriggerHandlerResult> => {
    // Find schedules for this workflow (targetId = workflowId, targetType = Workflow)
    const schedules = await this.scheduleRepository.list(
      context.organizationId,
      {
        targetType: "Workflow" as const,
        status: "Active" as const,
      },
    );

    const matchingSchedule = schedules.items.find(
      (s) => s.targetId === definition.id,
    );

    if (!matchingSchedule) {
      // No schedule found for this workflow - create a one-time execution
      const execution = await this.workflowRuntime.execute(definition, {
        context,
        trigger: "manual",
        input: trigger.config?.["input"] ?? "",
      });

      return { execution, triggered: true };
    }

    // Schedule exists - trigger a run
    try {
      await matchingSchedule.trigger(
        context.organizationId,
      );
      // Schedule trigger recorded - execution created separately if needed
      const execution = await this.workflowRuntime.execute(definition, {
        context,
        trigger: "schedule",
        input: trigger.config?.["input"] ?? "",
      });

      return { execution, triggered: true };
    } catch (error) {
      throw new Error(`Schedule trigger failed: ${error}`);
    }
  };
}

/** Register the schedule trigger */
TRIGGER_CONTRACTS.push({
  type: "schedule",
  description: "Schedule-based trigger using existing AiSchedule infrastructure",
  handler: ScheduleTrigger.handler,
});