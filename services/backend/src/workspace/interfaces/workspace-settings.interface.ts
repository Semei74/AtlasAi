import type { WorkspaceAiSettings } from "./workspace-ai-settings.interface.js";
import type { WorkspaceStorageQuota } from "./workspace-storage-quota.interface.js";
import type { WorkspaceConfiguration } from "./workspace-configuration.interface.js";

export interface WorkspaceSettings {
  readonly config: WorkspaceConfiguration;
  readonly ai: WorkspaceAiSettings;
  readonly storage: WorkspaceStorageQuota;
  readonly promptLibraryIds: readonly string[];
}
