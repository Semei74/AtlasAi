export interface AgentVersionInfo {
  readonly agentId: string;
  readonly version: string;
  readonly createdAt: Date;
  readonly changelog: string;
  readonly deprecated: boolean;
  readonly deprecationMessage: string | null;
  readonly compatibility: {
    readonly minRuntimeVersion: string;
    readonly maxRuntimeVersion: string;
    readonly breakingChanges: readonly string[];
  };
}
