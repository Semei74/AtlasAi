export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly status: string;
  readonly workspaceId: string;
  readonly organizationId: string;
  readonly ownerId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}
