import { Injectable } from "@nestjs/common";
import type { WorkflowLimitsConfig } from "../interfaces/workflow-limits.interface.js";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";

@Injectable()
export class WorkflowLimitsService {
  private readonly customLimits = new Map<string, Partial<WorkflowLimitsConfig>>();

  private readonly defaults: WorkflowLimitsConfig = {
    maxNodes: 100,
    maxDepth: 10,
    maxBranches: 20,
    maxExecutionDurationMs: 300_000,
    maxSteps: 500,
    maxRetriesPerStep: 3,
    maxVariables: 100,
    maxInputSize: 100_000,
    maxOutputSize: 100_000,
  };

  public getDefaults(): WorkflowLimitsConfig {
    return { ...this.defaults };
  }

  public getLimits(definition: WorkflowDefinition): WorkflowLimitsConfig {
    const custom = this.customLimits.get(definition.id);
    const orgLimits = this.getOrganizationLimits(definition.organizationId);
    return { ...this.defaults, ...orgLimits, ...custom };
  }

  public setCustomLimits(workflowId: string, limits: Partial<WorkflowLimitsConfig>): void {
    this.customLimits.set(workflowId, limits);
  }

  public removeCustomLimits(workflowId: string): void {
    this.customLimits.delete(workflowId);
  }

  public validateLimits(
    definition: WorkflowDefinition,
  ): { valid: boolean; message: string | null } {
    const limits = this.getLimits(definition);

    if (definition.nodes.length > limits.maxNodes) {
      return { valid: false, message: `Workflow nodes (${String(definition.nodes.length)}) exceed limit (${String(limits.maxNodes)})` };
    }

    const depth = this.calculateDepth(definition);
    if (depth > limits.maxDepth) {
      return { valid: false, message: `Workflow depth (${String(depth)}) exceeds limit (${String(limits.maxDepth)})` };
    }

    if (definition.timeoutMs > limits.maxExecutionDurationMs) {
      return { valid: false, message: `Workflow timeout (${String(definition.timeoutMs)}ms) exceeds limit (${String(limits.maxExecutionDurationMs)}ms)` };
    }

    return { valid: true, message: null };
  }

  private readonly orgLimits = new Map<string, Partial<WorkflowLimitsConfig>>();

  public setOrganizationLimits(organizationId: string, limits: Partial<WorkflowLimitsConfig>): void {
    this.orgLimits.set(organizationId, limits);
  }

  private getOrganizationLimits(organizationId: string): Partial<WorkflowLimitsConfig> {
    return this.orgLimits.get(organizationId) ?? {};
  }

  private calculateDepth(definition: WorkflowDefinition): number {
    const edges = definition.edges;
    const adjacency = new Map<string, string[]>();
    for (const edge of edges) {
      const targets = adjacency.get(edge.sourceNodeId) ?? [];
      targets.push(edge.targetNodeId);
      adjacency.set(edge.sourceNodeId, targets);
    }

    let maxDepth = 0;
    const visited = new Set<string>();

    const dfs = (nodeId: string, depth: number): void => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      maxDepth = Math.max(maxDepth, depth);
      const targets = adjacency.get(nodeId) ?? [];
      for (const target of targets) {
        dfs(target, depth + 1);
      }
    };

    for (const node of definition.nodes) {
      dfs(node.id, 0);
    }

    return maxDepth;
  }
}
