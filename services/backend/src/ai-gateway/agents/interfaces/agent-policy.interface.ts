export interface AgentPolicyPermissions {
  readonly allowedTools: readonly string[];
  readonly allowedContextSources: readonly string[];
  readonly allowedMemoryTypes: readonly string[];
  readonly maxTokensPerExecution: number;
  readonly maxStepsPerExecution: number;
  readonly requireHumanApproval: boolean;
  readonly requireApprovalForTools: readonly string[];
}

export interface AgentPolicy {
  readonly agentId: string;
  readonly organizationId: string;
  readonly workspaceId: string | null;
  readonly permissions: AgentPolicyPermissions;
  readonly rateLimit: {
    readonly executionsPerMinute: number;
    readonly executionsPerHour: number;
    readonly executionsPerDay: number;
  };
  readonly resourceLimits: {
    readonly maxMemoryMb: number;
    readonly maxStorageMb: number;
    readonly maxInputTokens: number;
    readonly maxOutputTokens: number;
  };
  readonly enabled: boolean;
}
