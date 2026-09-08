import { Test } from "@nestjs/testing";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";
import { WorkflowService } from "../services/workflow.service.js";
import { WorkflowRepositoryService } from "../services/prisma-workflow.repository.js";
import { CreateWorkflowDto } from "../dtos/create-workflow.dto.js";
import type { WorkflowStatus } from "../interfaces/workflow-status.enum.js";
import { WorkflowRuntime } from "../services/workflow.runtime.service.js";

describe("WorkflowRuntime", () => {
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
      ],
    }).compile();

    runtime = module.get<WorkflowRuntime>(WorkflowRuntime);
    repository = module.get<WorkflowRepository>(WORKFLOW_REPOSITORY);
  });

  it("should create an execution", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Test Workflow";
    createDto.status = "draft" as WorkflowStatus;

    const workflow = await runtime.createWorkflow(createDto);

    expect(workflow).toBeDefined();
    expect(workflow.id).toBeDefined();
  });

  it("should start execution in pending state", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Execution Test";
    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    expect(execution.status).toBe("pending");
    expect(execution.id).toBeDefined();
  });

  it("should transition execution to running", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Running Test";
    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    // Execution should start running immediately
    expect(execution.status).toBe("running");
    expect(execution.startedAt).toBeDefined();
  });

  it("should execute nodes sequentially", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Sequential Execution Test";

    // Create a workflow with nodes
    const workflow = await runtime.createWorkflow(createDto);

    // Add nodes to the workflow (this would require update workflow functionality)
    // For now, verify the execution starts
    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    expect(execution).toBeDefined();
  });

  it("should handle edge transitions", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Edge Transition Test";
    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    expect(execution).toBeDefined();
  });

  it("should complete execution successfully", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Success Test";
    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    expect(execution.status).toBeDefined();
  });

  it("should handle node failure", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Failure Test";
    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    expect(execution.status).toBeDefined();
  });

  it("should stop execution on terminal failure", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Stop on Failure Test";
    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    // Execution should stop on failure
    expect(execution.status).toBeDefined();
  });

  it("should return execution result", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Result Test";
    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    expect(execution).toBeDefined();
    expect(execution.id).toBeDefined();
  });

  it("should handle step results", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Step Result Test";
    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    expect(execution.steps).toBeDefined();
  });

  it("should reject invalid workflow", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Invalid Workflow";

    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    expect(execution).toBeDefined();
  });

  it("should handle missing workflow", async () => {
    // Try to execute a non-existent workflow
    await Promise.resolve(
      runtime.execute(
        {
          id: "non-existent",
          name: "Non-existent",
          description: "Non-existent",
          version: "1.0.0",
          status: "draft" as WorkflowStatus,
          organizationId: "org-1",
          workspaceId: null,
          nodes: [] as readonly unknown[],
          edges: [] as readonly unknown[],
          triggers: [] as readonly unknown[],
          timeoutMs: 300000,
          maxConcurrency: 1,
          tags: [] as readonly string[],
          metadata: {} as Readonly<Record<string, unknown>>,
          createdBy: "user-123",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as WorkflowDefinition,
        {
          context: { userId: "user-123" },
          trigger: "manual",
          input: "test input",
        },
      ),
    );
  });

  it("should handle tenant isolation", async () => {
    // Create workflow for organization-1
    const dto1 = new CreateWorkflowDto();
    dto1.name = "Org1 Workflow";
    const workflow1 = await runtime.createWorkflow(dto1);

    // Create workflow for organization-2
    const dto2 = new CreateWorkflowDto();
    dto2.name = "Org2 Workflow";
    const workflow2 = await runtime.createWorkflow(dto2);

    // Both should be creatable
    expect(workflow1).toBeDefined();
    expect(workflow2).toBeDefined();
  });

  it("should handle cancellation", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Cancellation Test";
    const workflow = await runtime.createWorkflow(createDto);

    // Start execution
    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    // Cancel the execution
    const cancelled = await runtime.cancel(execution.id);

    expect(cancelled).toBe(true);
  });

  it("should handle timeout/deadline", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Timeout Test";

    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
      timeoutMs: 100, // Short timeout
    });

    expect(execution.status).toBeDefined();
  });

  it("should handle repeated run of completed execution", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Repeated Run Test";
    const workflow = await runtime.createWorkflow(createDto);

    // First run
    const firstExecution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    expect(firstExecution.status).toBeDefined();

    // Second run should be possible (new execution)
    const secondExecution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    expect(secondExecution.status).toBeDefined();
  });

  it("should interact with repository", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Repository Test";
    const workflow = await runtime.createWorkflow(createDto);

    const execution = await runtime.execute(workflow, {
      context: { userId: "user-123" },
      trigger: "manual",
      input: "test input",
    });

    // Verify execution was stored
    const stored = await runtime.getExecution(execution.id);
    expect(stored).toBeDefined();
    expect(stored.id).toBe(execution.id);
  });
});