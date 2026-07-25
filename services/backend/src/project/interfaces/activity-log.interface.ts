export interface ActivityLog {
  readonly id: string;
  readonly projectId: string;
  readonly workspaceId: string;
  readonly organizationId: string;
  readonly actorId: string;
  readonly type: string;
  readonly description: string;
  readonly metadata: unknown;
  readonly createdAt: Date;
}
