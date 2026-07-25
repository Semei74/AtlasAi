import type { OrganizationBranding } from "./organization-branding.interface.js";
import type { OrganizationSettings } from "./organization-settings.interface.js";
import type { OrganizationMetadata } from "./organization-metadata.interface.js";

export interface Organization {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly ownerId: string;
  readonly branding: OrganizationBranding;
  readonly settings: OrganizationSettings;
  readonly metadata: OrganizationMetadata;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
