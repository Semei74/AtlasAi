export type WorkflowNodeType =
  | "trigger"
  | "action"
  | "condition"
  | "switch"
  | "delay"
  | "loop"
  | "ai_prompt"
  | "ai_agent"
  | "http_request"
  | "notification"
  | "email"
  | "document_search"
  | "knowledge_retrieval"
  | "human_approval"
  | "custom";

export interface WorkflowNode {
  readonly id: string;
  readonly type: WorkflowNodeType;
  readonly label: string;
  readonly config: Readonly<Record<string, unknown>>;
  readonly position: Readonly<{ x: number; y: number }> | null;
  readonly metadata: Readonly<Record<string, unknown>>;
}
