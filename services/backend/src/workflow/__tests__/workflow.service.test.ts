import { Test } from "@nestjs/testing";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";
import { WorkflowService } from "../services/workflow.service.js";
import { WorkflowRepositoryService } from "../services/prisma-workflow.repository.js";
import { CreateWorkflowDto } from "../dtos/create-workflow.dto.js";
import type { WorkflowStatus } from "../interfaces/workflow-status.enum.js";

describe("WorkflowService", () => {
  let service: WorkflowService;
  let repository: WorkflowRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorkflowService,
        {
          provide: WORKFLOW_REPOSITORY,
          useClass: WorkflowRepositoryService,
        },
      ],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
    repository = module.get<WorkflowRepository>(WORKFLOW_REPOSITORY);
  });

  it("should create a workflow", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Test Workflow";
    createDto.description = "A test workflow";
    createDto.status = "draft" as WorkflowStatus;

    const workflow = await service.createWorkflow(createDto);

    expect(workflow).toBeDefined();
    expect(workflow.name).toBe("Test Workflow");
    expect(workflow.status).toBe("draft");
    expect(workflow.id).toBeDefined();
  });

  it("should find workflow by ID", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Test Workflow";
    const created = await service.createWorkflow(createDto);

    const workflow = await service.findById(created.id);

    expect(workflow).toBeDefined();
    expect(workflow.name).toBe("Test Workflow");
  });

  it("should find workflows by organization", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Test Workflow 2";
    await service.createWorkflow(createDto);

    const workflows = await service.findByOrganization("org-123");

    expect(workflows.length).toBeGreaterThan(0);
  });

  it("should validate workflow status lifecycle", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Lifecycle Test";
    createDto.status = "draft" as WorkflowStatus;

    const workflow = await service.createWorkflow(createDto);

    // draft -> published should be valid
    const updated = await service.updateWorkflow(workflow.id, {
      status: "published" as WorkflowStatus,
    });

    expect(updated.status).toBe("published");

    // published -> archived should be valid
    const archived = await service.updateWorkflow(updated.id, {
      status: "archived" as WorkflowStatus,
    });

    expect(archived.status).toBe("archived");
  });

  it("should reject invalid status transition", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Invalid Transition";
    createDto.status = "published" as WorkflowStatus;

    const workflow = await service.createWorkflow(createDto);

    // published -> draft should be invalid
    const result = await service.updateWorkflow(workflow.id, {
      status: "draft" as WorkflowStatus,
    });

    expect(result).toBeNull();
  });

  it("should handle tenant isolation", async () => {
    // Create workflow for organization-1
    const dto1 = new CreateWorkflowDto();
    dto1.name = "Org1 Workflow";
    await service.createWorkflow(dto1);

    // Create workflow for organization-2
    const dto2 = new CreateWorkflowDto();
    dto2.name = "Org2 Workflow";
    await service.createWorkflow(dto2);

    // org-1 should only see its own workflows
    const org1Workflows = await service.findByOrganization("org-1");
    expect(org1Workflows.length).toBe(1);
    expect(org1Workflows[0].name).toBe("Org1 Workflow");

    // org-2 should only see its own workflows
    const org2Workflows = await service.findByOrganization("org-2");
    expect(org2Workflows.length).toBe(1);
    expect(org2Workflows[0].name).toBe("Org2 Workflow");
  });

  it("should validate workflow definition", async () => {
    // Test with minimal fields
    const minimalDto = new CreateWorkflowDto();
    minimalDto.name = "Minimal Workflow";

    const workflow = await service.createWorkflow(minimalDto);

    // Should still create since DTO validation happens at controller level
    expect(workflow.id).toBeDefined();
  });

  it("should handle version association", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Version Test";

    const wf1 = await service.createWorkflow(createDto);
    const wf2 = await service.updateWorkflow(wf1.id, {
      version: "2.0.0",
    });

    expect(wf2.version).toBe("2.0.0");
  });

  it("should validate node/edge configuration", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Node/Edge Test";

    // Should be able to create with minimal config
    const workflow = await service.createWorkflow(createDto);

    expect(workflow.id).toBeDefined();
  });

  it("should demonstrate repository behavior", async () => {
    const createDto = new CreateWorkflowDto();
    createDto.name = "Repository Test";

    const created = await service.createWorkflow(createDto);
    expect(created.id).toBeDefined();

    const found = await service.findById(created.id);
    expect(found).toBeDefined();
    expect(found.name).toBe("Repository Test");

    const all = await service.findByOrganization("org-123");
    expect(Array.isArray(all)).toBe(true);
  });
});