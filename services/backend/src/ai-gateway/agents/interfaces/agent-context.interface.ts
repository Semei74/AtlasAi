export interface AgentContext {
  readonly agentId: string;
  readonly userId: string;
  readonly organizationId: string;
  readonly workspaceId: string | null;
  readonly conversationId: string | null;
  readonly requestId: string;
  readonly input: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}
