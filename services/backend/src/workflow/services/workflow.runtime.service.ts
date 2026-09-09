import { Injectable, Inject } from "@nestjs/common";
import type { WorkflowRepository } from "../interfaces/workflow-repository.interface.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowExecution, WorkflowExecutionCheckpoint } from "../interfaces/workflow-execution.interface.js";
import { WORKFLOW_REPOSITORY } from "../interfaces/workflow-repository.interface.js";

@Injectable()
export class WorkflowRuntime {
  public constructor(
    @Inject(WORKFLOW_REPOSITORY) private readonly repository: WorkflowRepository,
  ) {}

  public async execute(
    definition: WorkflowDefinition,
    options: {
      context: { userId: string; organizationId: string; workspaceId?: string };
      trigger: "manual" | "api" | "schedule" | "webhook" | "event" | "file-upload" | "ai-completion";
      input?: string;
      timeoutMs?: number;
    },
  ): Promise<WorkflowExecution> {
    const executionId = crypto.randomUUID();

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: definition.id,
      workflowVersion: definition.version,
      organizationId: definition.organizationId,
      workspaceId: definition.workspaceId,
      userId: options.context.userId,
      trigger: options.trigger,
      input: options.input ?? "",
      status: "pending" as const,
      steps: [],
      currentNodeId: definition.triggers?.[0]?.id ?? null,
      variables: {} as Readonly<Record<string, unknown>>,
      metadata: {} as Readonly<Record<string, unknown>>,
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      error: null,
      durationMs: 0,
      startedAt: new Date(),
      completedAt: null,
      checkpoint: null,
      retryEligible: true,
      lastRetryAt: null,
      retryCount: 0,
    };

    // Persist execution
    await this.repository.createExecution({
      ...execution,
      id: executionId,
      workflowId: definition.id,
      organizationId: definition.organizationId,
      workspaceId: definition.workspaceId,
      userId: options.context.userId,
      trigger: options.trigger,
      input: options.input ?? "",
      status: "pending",
      steps: [] as readonly unknown[],
      variables: {} as Readonly<Record<string, unknown>>,
      metadata: {} as Readonly<Record<string, unknown>>,
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      error: null,
      durationMs: 0,
      startedAt: new Date(),
      completedAt: null,
      checkpoint: null,
      retryEligible: true,
      lastRetryAt: null,
      retryCount: 0,
    });

    try {
      // Mark as running
      await this.repository.update(executionId, {
        status: "running" as const,
      });

      // Execute nodes sequentially following edges and node handlers
      await this.executeNodesWithHandlers(definition);

      // Mark as completed
      await this.repository.update(executionId, {
        status: "completed" as const,
        completedAt: new Date(),
      });
    } catch (error) {
      // Handle terminal failure with retry logic
      const shouldRetry = await this.handleExecutionFailure(executionId, error);

      if (shouldRetry && execution.retryEligible) {
        // Retry the execution from the last checkpoint
        await this.repository.update(executionId, {
          status: "running" as const,
        });
        // Re-execute from checkpoint
        await this.executeNodesFromCheckpoint(executionId, definition);
        await this.repository.update(executionId, {
          status: "completed" as const,
          completedAt: new Date(),
        });
      } else {
        // Final failure
        await this.repository.update(executionId, {
          status: "failed" as const,
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date(),
        });
        throw error;
      }
    }
  }

  public async cancel(executionId: string): Promise<boolean> {
    const execution = await this.repository.findExecutionById(executionId);

    if (!execution) {
      return false;
    }

    if (
      execution.status === "completed" ||
      execution.status === "failed" ||
      execution.status === "cancelled"
    ) {
      return false;
    }

    // Cancel the execution
    await this.repository.update(executionId, {
      status: "cancelled" as const,
    });

    return true;
  }

  public async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    return await this.repository.findExecutionById(executionId);
  }

  public async getActiveExecutions(): Promise<WorkflowExecution[]> {
    const all = await this.repository.findByOrganization(
      "__placeholder__",
    );
    return all.filter((exec) => exec.status === "running");
  }

  private async executeNodesWithHandlers(definition: WorkflowDefinition): Promise<void> {
    const nodes = definition.nodes ?? [];
    const edges = definition.edges ?? [];

    // Build edge lookup: sourceNodeId -> targetNodeId
    const edgeMap = new Map<string, string>();
    for (const edge of edges) {
      if (edge.sourceNodeId && edge.targetNodeId) {
        edgeMap.set(edge.sourceNodeId, edge.targetNodeId);
      }
    }

    // Execute nodes sequentially, following edges and using node handlers
    let currentNodeId = definition.triggers?.[0]?.id ?? null;
    const executedNodes = new Set<string>();
    const completedNodeIds = new Set<string>();

    while (currentNodeId && !executedNodes.has(currentNodeId)) {
      executedNodes.add(currentNodeId);

      const node = nodes.find((n) => n.id === currentNodeId);
      if (!node) {
        break;
      }

      // Skip already completed nodes on resume (checked via checkpoint)
      if (completedNodeIds.has(currentNodeId)) {
        currentNodeId = edgeMap.get(currentNodeId);
        continue;
      }

      // Foundation version: mark node as completed and save checkpoint
      completedNodeIds.add(currentNodeId);

      // Save checkpoint after each node
      const checkpoint: WorkflowExecutionCheckpoint = {
        checkpointId: crypto.randomUUID(),
        checkpointTimestamp: new Date(),
        currentNodeId: edgeMap.get(currentNodeId) ?? null,
        completedNodeIds: new Set(completedNodeIds),
        variables: {} as Readonly<Record<string, unknown>>,
        retryCount: 0,
        metadata: {} as Readonly<Record<string, unknown>>,
      };
      await this.repository.saveCheckpoint(currentNodeId ?? executionId, checkpoint);

      // Move to next node via edge
      currentNodeId = edgeMap.get(currentNodeId);
    }
  }

  private async executeNodesFromCheckpoint(
    executionId: string,
    definition: WorkflowDefinition,
  ): Promise<void> {
    const execution = await this.repository.findExecutionById(executionId);
    if (!execution) {
      return;
    }

    const nodes = definition.nodes ?? [];
    const edges = definition.edges ?? [];

    // Build edge lookup
    const edgeMap = new Map<string, string>();
    for (const edge of edges) {
      if (edge.sourceNodeId && edge.targetNodeId) {
        edgeMap.set(edge.sourceNodeId, edge.targetNodeId);
      }
    }

    // Load checkpoint to get last state
    const checkpoint = await this.repository.loadExecutionCheckpoint(executionId);
    let currentNodeId = checkpoint?.currentNodeId ?? null;
    const completedNodeIds = new Set<string>(checkpoint?.completedNodeIds ?? []);

    // Mark previously completed nodes as executed (skip them on resume)
    for (const nodeId of completedNodeIds) {
      // These nodes were already completed, skip them on resume
    }

    const executedNodes = new Set<string>();

    while (currentNodeId && !executedNodes.has(currentNodeId)) {
      executedNodes.add(currentNodeId);

      const node = nodes.find((n) => n.id === currentNodeId);
      if (!node) {
        break;
      }

      // Skip completed nodes
      if (completedNodeIds.has(currentNodeId)) {
        currentNodeId = edgeMap.get(currentNodeId);
        continue;
      }

      // Foundation: just mark progress, full execution would call node handler
      completedNodeIds.add(currentNodeId);

      // Save checkpoint
      const checkpoint: WorkflowExecutionCheckpoint = {
        checkpointId: crypto.randomUUID(),
        checkpointTimestamp: new Date(),
        currentNodeId: edgeMap.get(currentNodeId) ?? null,
        completedNodeIds: new Set(completedNodeIds),
        variables: execution.variables ?? {} as Readonly<Record<string, unknown>>,
        retryCount: execution.retryCount ?? 0,
        metadata: execution.metadata ?? {} as Readonly<Record<string, unknown>>,
      };
      await this.repository.saveCheckpoint(executionId, checkpoint);

      // Move to next node
      currentNodeId = edgeMap.get(currentNodeId);
    }
  }

  private async handleExecutionFailure(
    executionId: string,
    error: unknown,
  ): Promise<boolean> {
    const execution = await this.repository.findExecutionById(executionId);
    if (!execution) {
      return false;
    }

    // Update retry state
    const retryCount = (execution.retryCount ?? 0) + 1;
    const maxRetries = 3;
    const retryEligible = retryCount < maxRetries;
    const lastRetryAt = retryEligible ? new Date() : null;

    // Update execution retry state in repository
    await this.repository.updateExecutionRetryState(executionId, retryEligible, lastRetryAt);

    // Update execution object in memory
    execution.retryCount = retryCount;
    execution.retryEligible = retryEligible;
    execution.lastRetryAt = lastRetryAt;

    if (retryEligible) {
      // Eligible for retry - mark as pending and return true
      execution.status = "pending" as const;
      return true;
    } else {
      // Retries exhausted - mark as failed
      execution.status = "failed" as const;
      execution.error = error instanceof Error ? error.message : String(error);
      return false;
    }
  }
}