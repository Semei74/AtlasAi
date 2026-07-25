import type { Membership } from "./membership.interface.js";

export const MEMBERSHIP_REPOSITORY = "MEMBERSHIP_REPOSITORY";

export interface MembershipRepository {
  findById(id: string): Promise<Membership | null>;
  findByOrganizationId(organizationId: string): Promise<Membership[]>;
  findByUserId(userId: string): Promise<Membership[]>;
  findByOrganizationAndUser(organizationId: string, userId: string): Promise<Membership | null>;
  create(data: Omit<Membership, "id" | "joinedAt">): Promise<Membership>;
  update(id: string, changes: Partial<Omit<Membership, "id">>): Promise<Membership>;
  delete(id: string): Promise<void>;
}
