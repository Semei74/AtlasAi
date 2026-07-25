import type { WorkspaceSettings } from "./workspace-settings.interface.js";

export interface Workspace {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly description: string | null;
  readonly color: string | null;
  readonly icon: string | null;
  readonly settings: WorkspaceSettings;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
