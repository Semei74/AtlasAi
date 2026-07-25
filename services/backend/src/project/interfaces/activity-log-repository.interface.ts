import type { ActivityLog } from "./activity-log.interface.js";
import type { Prisma } from "../../generated/prisma/client.js";

export const ACTIVITY_LOG_REPOSITORY = "ACTIVITY_LOG_REPOSITORY";

export interface ActivityLogRepository {
  create(data: Omit<ActivityLog, "id" | "createdAt">, tx?: Prisma.TransactionClient): Promise<ActivityLog>;
  findRecentByOrganizationId(organizationId: string, limit: number): Promise<ActivityLog[]>;
}
