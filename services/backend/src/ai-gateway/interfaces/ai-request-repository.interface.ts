import type { AiRequestRecord } from "./ai-request-record.interface.js";

export const AI_REQUEST_REPOSITORY = "AI_REQUEST_REPOSITORY";

export interface AiRequestRepository {
  create(record: Omit<AiRequestRecord, "id">): Promise<AiRequestRecord>;
  findByWorkspaceId(
    workspaceId: string,
    limit?: number,
    offset?: number,
  ): Promise<AiRequestRecord[]>;
  findByOrganizationId(
    organizationId: string,
    limit?: number,
    offset?: number,
  ): Promise<AiRequestRecord[]>;
}
