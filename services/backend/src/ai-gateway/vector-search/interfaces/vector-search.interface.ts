export interface VectorSearchQuery {
  readonly queryText: string;
  readonly topK: number;
  readonly minScore?: number;
  readonly filter?: Readonly<Record<string, unknown>>;
  readonly sourceTypes?: readonly string[];
  readonly includeVectors?: boolean;
}

export interface VectorSearchResult {
  readonly id: string;
  readonly content: string;
  readonly score: number;
  readonly sourceType: string;
  readonly sourceId: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export const VECTOR_SEARCH_SERVICE = "VECTOR_SEARCH_SERVICE";

export interface VectorSearchService {
  search(query: VectorSearchQuery): Promise<readonly VectorSearchResult[]>;
  indexText(id: string, text: string, sourceType: string, sourceId: string, metadata?: Readonly<Record<string, unknown>>): Promise<void>;
  remove(id: string): Promise<boolean>;
  clear(): Promise<void>;
}
