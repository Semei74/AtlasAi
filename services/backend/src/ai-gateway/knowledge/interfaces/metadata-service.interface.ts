import type { DocumentMetadata, MetadataHistoryEntry, MetadataValidationResult } from "./document-metadata.interface.js";
import type { DocumentFilter, PaginatedDocuments } from "./document-service.interface.js";

export const METADATA_SERVICE = Symbol("METADATA_SERVICE");

export interface MetadataFilter extends DocumentFilter {
  readonly version?: number;
  readonly metadataKey?: string;
  readonly metadataValue?: string;
  readonly uploadedAfter?: string;
  readonly uploadedBefore?: string;
}

export interface MetadataService {
  getMetadata(documentId: string, organizationId: string): Promise<DocumentMetadata>;
  updateMetadata(documentId: string, organizationId: string, metadata: Record<string, unknown>): Promise<DocumentMetadata>;
  mergeMetadata(documentId: string, organizationId: string, metadata: Record<string, unknown>): Promise<DocumentMetadata>;
  deleteMetadata(documentId: string, organizationId: string, keys: readonly string[]): Promise<DocumentMetadata>;
  rebuildMetadata(documentId: string, organizationId: string): Promise<DocumentMetadata>;
  validateMetadata(metadata: Record<string, unknown>): MetadataValidationResult;
  getMetadataHistory(documentId: string, organizationId: string): Promise<readonly MetadataHistoryEntry[]>;
  rollbackMetadata(documentId: string, organizationId: string, version: number): Promise<DocumentMetadata>;
  searchByMetadata(filter: MetadataFilter): Promise<PaginatedDocuments>;
}
