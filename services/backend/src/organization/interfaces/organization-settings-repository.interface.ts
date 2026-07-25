import type { OrganizationSettings } from "./organization-settings.interface.js";

export const ORGANIZATION_SETTINGS_REPOSITORY = "ORGANIZATION_SETTINGS_REPOSITORY";

export interface OrganizationSettingsRepository {
  findByOrganizationId(organizationId: string): Promise<OrganizationSettings | null>;
  save(organizationId: string, settings: OrganizationSettings): Promise<OrganizationSettings>;
}
