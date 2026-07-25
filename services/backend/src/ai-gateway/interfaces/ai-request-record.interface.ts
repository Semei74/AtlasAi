export interface AiRequestRecord {
  readonly id: string;
  readonly userId: string;
  readonly workspaceId: string;
  readonly organizationId: string;
  readonly provider: string;
  readonly model: string;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly estimatedCost: number;
  readonly duration: number;
  readonly success: boolean;
  readonly errorCode?: string;
  readonly timestamp: Date;
}
