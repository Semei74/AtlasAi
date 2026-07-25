export interface VectorRecord {
  readonly id: string;
  readonly vector: readonly number[];
  readonly content: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly sourceType: string;
  readonly sourceId: string;
}

export interface SearchResult {
  readonly record: VectorRecord;
  readonly score: number;
}

export interface VectorStore {
  upsert(record: VectorRecord): Promise<void>;
  batchUpsert(records: readonly VectorRecord[]): Promise<void>;
  search(
    queryVector: readonly number[],
    topK: number,
    filter?: Readonly<Record<string, unknown>>,
  ): Promise<readonly SearchResult[]>;
  remove(id: string): Promise<boolean>;
  clear(): Promise<void>;
  size(): Promise<number>;
}
