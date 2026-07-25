import type { MembershipRole } from "./membership-role.enum.js";
import type { MembershipStatus } from "./membership-status.enum.js";

export interface Membership {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly role: MembershipRole;
  readonly status: MembershipStatus;
  readonly joinedAt: Date;
}
