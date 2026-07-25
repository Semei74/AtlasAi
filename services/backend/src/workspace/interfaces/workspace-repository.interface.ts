import type { Workspace } from "./workspace.interface.js";

export const WORKSPACE_REPOSITORY = "WORKSPACE_REPOSITORY";

export interface WorkspaceRepository {
  findById(id: string): Promise<Workspace | null>;
  findByOrganizationId(organizationId: string): Promise<Workspace[]>;
  create(data: Omit<Workspace, "id" | "createdAt" | "updatedAt">): Promise<Workspace>;
  update(id: string, changes: Partial<Omit<Workspace, "id">>): Promise<Workspace>;
  delete(id: string): Promise<void>;
}
