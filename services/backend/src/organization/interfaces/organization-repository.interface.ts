import type { Organization } from "./organization.interface.js";

export const ORGANIZATION_REPOSITORY = "ORGANIZATION_REPOSITORY";

export interface OrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findByIds(ids: string[]): Promise<Organization[]>;
  create(data: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization>;
  update(id: string, changes: Partial<Omit<Organization, "id">>): Promise<Organization>;
  delete(id: string): Promise<void>;
}
