export interface AutoMetadata {
  readonly title: string;
  readonly filename: string;
  readonly extension: string;
  readonly mimeType: string;
  readonly size: number;
  readonly checksum: string | null;
  readonly language: string | null;
  readonly encoding: string | null;
  readonly pageCount: number | null;
  readonly wordCount: number | null;
  readonly characterCount: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly uploadedBy: string;
  readonly documentVersion: number;
}

export interface DocumentMetadata {
  readonly auto: AutoMetadata;
  readonly custom: Record<string, unknown>;
  readonly classification: string | null;
  readonly tags: readonly string[];
  readonly status: string;
}

export interface MetadataHistoryEntry {
  readonly version: number;
  readonly custom: Record<string, unknown>;
  readonly timestamp: string;
}

export interface MetadataValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export const RESERVED_METADATA_KEYS: readonly string[] = [
  "title",
  "filename",
  "extension",
  "mimeType",
  "size",
  "checksum",
  "language",
  "encoding",
  "pageCount",
  "wordCount",
  "characterCount",
  "createdAt",
  "updatedAt",
  "uploadedBy",
  "documentVersion",
  "classification",
  "tags",
  "status",
  "custom",
  "auto",
];

export const METADATA_KEY_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_. -]{0,127}$/;

export const MAX_METADATA_BYTES = 65_536;
