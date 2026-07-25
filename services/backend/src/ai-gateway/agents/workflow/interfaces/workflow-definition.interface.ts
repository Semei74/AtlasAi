import type { WorkflowNode } from "./workflow-node.interface.js";
import type { WorkflowEdge } from "./workflow-edge.interface.js";
import type { WorkflowTrigger } from "./workflow-trigger.interface.js";

export type WorkflowStatus = "draft" | "published" | "archived" | "disabled";

export interface WorkflowDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly status: WorkflowStatus;
  readonly organizationId: string;
  readonly workspaceId: string | null;
  readonly nodes: readonly WorkflowNode[];
  readonly edges: readonly WorkflowEdge[];
  readonly triggers: readonly WorkflowTrigger[];
  readonly timeoutMs: number;
  readonly maxConcurrency: number;
  readonly tags: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
