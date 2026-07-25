import type { InvitationStatus } from "./invitation-status.enum.js";
import type { MembershipRole } from "./membership-role.enum.js";

export interface Invitation {
  readonly id: string;
  readonly organizationId: string;
  readonly workspaceId?: string;
  readonly email?: string;
  readonly userId?: string;
  readonly inviterId: string;
  readonly role: MembershipRole;
  readonly status: InvitationStatus;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
