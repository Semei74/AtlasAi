import { Injectable } from "@nestjs/common";
import type { VectorRecord, SearchResult, VectorStore } from "../interfaces/vector-store.interface.js";

@Injectable()
export class InMemoryVectorStore implements VectorStore {
  private readonly records = new Map<string, VectorRecord>();

  public upsert(record: VectorRecord): Promise<void> {
    this.records.set(record.id, record);
    return Promise.resolve();
  }

  public batchUpsert(records: readonly VectorRecord[]): Promise<void> {
    for (const record of records) {
      this.records.set(record.id, record);
    }
    return Promise.resolve();
  }

  public search(
    queryVector: readonly number[],
    topK: number,
    filter?: Readonly<Record<string, unknown>>,
  ): Promise<readonly SearchResult[]> {
    const scored: SearchResult[] = [];

    for (const record of this.records.values()) {
      if (filter !== undefined && !this.matchesFilter(record, filter)) continue;

      const score = this.cosineSimilarity(queryVector, record.vector);
      scored.push({ record, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return Promise.resolve(scored.slice(0, topK));
  }

  public remove(id: string): Promise<boolean> {
    const result = this.records.delete(id);
    return Promise.resolve(result);
  }

  public clear(): Promise<void> {
    this.records.clear();
    return Promise.resolve();
  }

  public size(): Promise<number> {
    return Promise.resolve(this.records.size);
  }

  private cosineSimilarity(a: readonly number[], b: readonly number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      const aVal = a[i] ?? 0;
      const bVal = b[i] ?? 0;
      dotProduct += aVal * bVal;
      normA += aVal * aVal;
      normB += bVal * bVal;
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  private matchesFilter(
    record: VectorRecord,
    filter: Readonly<Record<string, unknown>>,
  ): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (key === "sourceType") {
        if (record.sourceType !== value) return false;
        continue;
      }
      if (key === "sourceId") {
        if (record.sourceId !== value) return false;
        continue;
      }
      if (record.metadata[key] !== value) return false;
    }
    return true;
  }
}
