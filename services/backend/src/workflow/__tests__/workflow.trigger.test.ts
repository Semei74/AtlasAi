import { Test } from "@nestjs/testing";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";
import { WorkflowService } from "../services/workflow.service.js";
import { WorkflowRepositoryService } from "../services/prisma-workflow.repository.js";
import { CreateWorkflowDto } from "../dtos/create-workflow.dto.js";
import { WorkflowStatus } from "../interfaces/workflow-status.enum.js";
import { WorkflowRuntime } from "../services/workflow.runtime.service.js";
import { ScheduleTrigger } from "../trigger/schedule.trigger.js";
import { WebhookTrigger } from "../trigger/webhook.trigger.js";
import { ManualTrigger } from "../trigger/manual.trigger.js";
import { ApiTrigger } from "../trigger/api.trigger.js";
import { EventTrigger } from "../trigger/event.trigger.js";
import { FileUploadTrigger } from "../trigger/file-upload.trigger.js";
import { AiCompletionTrigger } from "../trigger/ai-completion.trigger.js";

describe("Workflow Triggers", () => {
  let runtime: WorkflowRuntime;
  let repository: WorkflowRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorkflowRuntime,
        {
          provide: WORKFLOW_REPOSITORY,
          useClass: WorkflowRepositoryService,
        },
        ScheduleTrigger,
        WebhookTrigger,
        ManualTrigger,
        ApiTrigger,
        EventTrigger,
        FileUploadTrigger,
        AiCompletionTrigger,
      ],
    }).compile();

    runtime = module.get<WorkflowRuntime>(WorkflowRuntime);
    repository = module.get<WorkflowRepository>(WORKFLOW_REPOSITORY);
  });

  describe("Schedule Trigger", () => {
    it("should handle schedule trigger", async () => {
      const createDto = new CreateWorkflowDto();
      createDto.name = "Schedule Test";
      const workflow = await runtime.createWorkflow(createDto);

      const trigger = new ScheduleTrigger();
      const result = await trigger.handler(
        { id: "1", type: "schedule" as const, config: {} },
        workflow,
        { userId: "user-123", organizationId: "org-1", workspaceId: null },
      );

      expect(result).toBeDefined();
      expect(result.triggered).toBe(true);
    });
  });

  describe("Webhook Trigger", () => {
    it("should handle webhook trigger", async () => {
      const createDto = new CreateWorkflowDto();
      createDto.name = "Webhook Test";
      const workflow = await runtime.createWorkflow(createDto);

      const trigger = new WebhookTrigger();
      const result = await trigger.handler(
        { id: "1", type: "webhook" as const, config: {} },
        workflow,
        { userId: "user-123", organizationId: "org-1", workspaceId: null },
      );

      expect(result).toBeDefined();
      expect(result.triggered).toBe(true);
    });
  });

  describe("Manual Trigger", () => {
    it("should handle manual trigger", async () => {
      const createDto = new CreateWorkflowDto();
      createDto.name = "Manual Test";
      const workflow = await runtime.createWorkflow(createDto);

      const trigger = new ManualTrigger();
      const result = await trigger.handler(
        { id: "1", type: "manual" as const, config: {} },
        workflow,
        { userId: "user-123", organizationId: "org-1", workspaceId: null },
      );

      expect(result).toBeDefined();
      expect(result.triggered).toBe(true);
    });
  });

  describe("API Trigger", () => {
    it("should handle API trigger", async () => {
      const createDto = new CreateWorkflowDto();
      createDto.name = "API Test";
      const workflow = await runtime.createWorkflow(createDto);

      const trigger = new ApiTrigger();
      const result = await trigger.handler(
        { id: "1", type: "api" as const, config: {} },
        workflow,
        { userId: "user-123", organizationId: "org-1", workspaceId: null },
      );

      expect(result).toBeDefined();
      expect(result.triggered).toBe(true);
    });
  });

  describe("Event Trigger", () => {
    it("should handle event trigger", async () => {
      const createDto = new CreateWorkflowDto();
      createDto.name = "Event Test";
      const workflow = await runtime.createWorkflow(createDto);

      const trigger = new EventTrigger();
      const result = await trigger.handler(
        { id: "1", type: "event" as const, config: {} },
        workflow,
        { userId: "user-123", organizationId: "org-1", workspaceId: null },
      );

      expect(result).toBeDefined();
      expect(result.triggered).toBe(true);
    });
  });

  describe("File Upload Trigger", () => {
    it("should handle file upload trigger", async () => {
      const createDto = new CreateWorkflowDto();
      createDto.name = "File Upload Test";
      const workflow = await runtime.createWorkflow(createDto);

      const trigger = new FileUploadTrigger();
      const result = await trigger.handler(
        { id: "1", type: "file-upload" as const, config: {} },
        workflow,
        { userId: "user-123", organizationId: "org-1", workspaceId: null },
      );

      expect(result).toBeDefined();
      expect(result.triggered).toBe(true);
    });
  });

  describe("AI Completion Trigger", () => {
    it("should handle AI completion trigger", async () => {
      const createDto = new CreateWorkflowDto();
      createDto.name = "AI Completion Test";
      const workflow = await runtime.createWorkflow(createDto);

      const trigger = new AiCompletionTrigger();
      const result = await trigger.handler(
        { id: "1", type: "ai-completion" as const, config: {} },
        workflow,
        { userId: "user-123", organizationId: "org-1", workspaceId: null },
      );

      expect(result).toBeDefined();
      expect(result.triggered).toBe(true);
    });
  });

  describe("Trigger Contracts", () => {
    it("should have all trigger types registered", () => {
      const types = TRIGGER_CONTRACTS.map((c) => c.type);
      expect(types).toContain("manual");
      expect(types).toContain("api");
      expect(types).toContain("schedule");
      expect(types).toContain("webhook");
      expect(types).toContain("event");
      expect(types).toContain("file-upload");
      expect(types).toContain("ai-completion");
    });

    it("should have descriptions for all trigger types", () => {
      const types = TRIGGER_CONTRACTS.map((c) => c.type);
      types.forEach((type) => {
        const contract = TRIGGER_CONTRACTS.find((c) => c.type === type);
        expect(contract).toBeDefined();
        expect(contract?.description).toBeDefined();
      });
    });
  });
});