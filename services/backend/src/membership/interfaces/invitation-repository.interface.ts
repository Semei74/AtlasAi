import type { Invitation } from "./invitation.interface.js";

export const INVITATION_REPOSITORY = "INVITATION_REPOSITORY";

export interface InvitationRepository {
  findById(id: string): Promise<Invitation | null>;
  findByOrganizationId(organizationId: string): Promise<Invitation[]>;
  findByEmail(email: string): Promise<Invitation[]>;
  create(data: Omit<Invitation, "id" | "createdAt" | "updatedAt">): Promise<Invitation>;
  update(id: string, changes: Partial<Omit<Invitation, "id">>): Promise<Invitation>;
  delete(id: string): Promise<void>;
}
