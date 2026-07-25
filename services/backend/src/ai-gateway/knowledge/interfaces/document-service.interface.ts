import type { DocumentStatus } from "../../../generated/prisma/enums.js";
import type { KnowledgeDocument } from "../../../generated/prisma/client.js";

export const DOCUMENT_SERVICE = Symbol("DOCUMENT_SERVICE");

export type DocumentSortField = "createdAt" | "updatedAt" | "originalName" | "size" | "status";
export type SortOrder = "asc" | "desc";

export interface DocumentFilter {
  readonly organizationId: string;
  readonly workspaceId?: string;
  readonly ownerId?: string;
  readonly status?: DocumentStatus;
  readonly search?: string;
  readonly mimeType?: string;
  readonly tags?: readonly string[];
  readonly sortBy?: DocumentSortField;
  readonly sortOrder?: SortOrder;
  readonly offset?: number;
  readonly limit?: number;
}

export interface PaginatedDocuments {
  readonly items: readonly KnowledgeDocument[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
}

export interface CreateDocumentInput {
  readonly organizationId: string;
  readonly workspaceId?: string;
  readonly ownerId: string;
  readonly classification?: string;
  readonly tags?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

export interface UpdateDocumentInput {
  readonly classification?: string;
  readonly tags?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

export interface DocumentService {
  create(
    file: { originalName: string; mimeType: string; size: number; buffer: Buffer },
    input: CreateDocumentInput,
  ): Promise<KnowledgeDocument>;

  findById(id: string, organizationId: string): Promise<KnowledgeDocument | null>;

  findMany(filter: DocumentFilter): Promise<PaginatedDocuments>;

  update(id: string, organizationId: string, input: UpdateDocumentInput): Promise<KnowledgeDocument>;

  delete(id: string, organizationId: string): Promise<void>;

  restore(id: string, organizationId: string): Promise<KnowledgeDocument>;

  archive(id: string, organizationId: string): Promise<KnowledgeDocument>;

  download(id: string, organizationId: string): Promise<{ stream: Buffer; mimeType: string; originalName: string }>;
}
