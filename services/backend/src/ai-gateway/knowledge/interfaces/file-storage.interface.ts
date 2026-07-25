export const FILE_STORAGE = Symbol("FILE_STORAGE");

export interface FileUpload {
  readonly originalName: string;
  readonly mimeType: string;
  readonly size: number;
  readonly buffer: Buffer;
}

export interface FileUploadResult {
  readonly storagePath: string;
  readonly checksum: string;
}

export interface FileStorage {
  store(file: FileUpload, documentId: string): Promise<FileUploadResult>;
  retrieve(storagePath: string): Promise<Buffer>;
  delete(storagePath: string): Promise<void>;
  getPath(documentId: string, originalName: string): string;
  exists(storagePath: string): Promise<boolean>;
  getSignedUrl(storagePath: string, expiresInSeconds?: number): Promise<string | null>;
}
