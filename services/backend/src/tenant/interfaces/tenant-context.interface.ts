export const TENANT_CONTEXT = "TENANT_CONTEXT";

export interface TenantContext {
  readonly organizationId: string;
  readonly workspaceId: string | null;
  readonly userId: string;
  readonly membershipRole: string;
}
