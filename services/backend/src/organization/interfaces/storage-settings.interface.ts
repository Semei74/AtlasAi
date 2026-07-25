export interface StorageSettings {
  readonly maxStorageBytes: number | null;
  readonly maxUploadSizeBytes: number | null;
  readonly allowedFileTypes: readonly string[];
  readonly blockedFileTypes: readonly string[];
  readonly retentionDays: number | null;
  readonly enableVersioning: boolean;
}
