export interface AgentSession {
  readonly id: string;
  readonly agentId: string;
  readonly userId: string;
  readonly organizationId: string;
  readonly workspaceId: string | null;
  readonly conversationId: string | null;
  readonly startedAt: Date;
  readonly lastActivityAt: Date;
  readonly executionCount: number;
  readonly totalTokensUsed: number;
  readonly totalCost: number;
  readonly status: "active" | "paused" | "completed" | "expired";
  readonly metadata: Readonly<Record<string, unknown>>;
}
