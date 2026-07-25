import type { ModelCapabilities } from "../../model-registry/interfaces/model-capabilities.interface.js";
import type { OrganizationSettings } from "../../../organization/interfaces/organization-settings.interface.js";

export interface AiPolicyContext {
  readonly organizationId: string;
  readonly workspaceId: string | null;
  readonly userId: string;
  readonly provider: string;
  readonly model: string;
  readonly settings?: OrganizationSettings;
  readonly requestedCapabilities: Partial<ModelCapabilities>;
  readonly metadata: Record<string, unknown>;
}
