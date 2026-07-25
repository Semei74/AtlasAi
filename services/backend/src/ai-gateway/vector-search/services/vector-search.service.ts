import { Injectable } from "@nestjs/common";
import type { VectorStore } from "../interfaces/vector-store.interface.js";
import type { VectorSearchQuery, VectorSearchResult } from "../interfaces/vector-search.interface.js";

@Injectable()
export class VectorSearchServiceImpl {
  private readonly embeddingDimension = 384;

  public constructor(private readonly store: VectorStore) {}

  public async search(query: VectorSearchQuery): Promise<readonly VectorSearchResult[]> {
    const queryVector = this.computeQueryVector(query.queryText);
    const storeFilter = query.filter !== undefined && Object.keys(query.filter).length > 0
      ? query.filter
      : undefined;

    const results = await this.store.search(queryVector, query.topK, storeFilter);

    return results
      .filter((r) => {
        if (query.minScore !== undefined && r.score < query.minScore) return false;
        if (query.sourceTypes !== undefined && query.sourceTypes.length > 0) {
          if (!query.sourceTypes.includes(r.record.sourceType)) return false;
        }
        return true;
      })
      .map((r) => ({
        id: r.record.id,
        content: r.record.content,
        score: r.score,
        sourceType: r.record.sourceType,
        sourceId: r.record.sourceId,
        metadata: r.record.metadata,
      }));
  }

  public async indexText(
    id: string,
    text: string,
    sourceType: string,
    sourceId: string,
    metadata?: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    const vector = this.computeQueryVector(text);
    await this.store.upsert({
      id,
      vector,
      content: text,
      metadata: metadata ?? {},
      sourceType,
      sourceId,
    });
  }

  public async remove(id: string): Promise<boolean> {
    return this.store.remove(id);
  }

  public async clear(): Promise<void> {
    await this.store.clear();
  }

  private computeQueryVector(text: string): readonly number[] {
    const dimension = this.embeddingDimension;
    const vector = new Array<number>(dimension).fill(0);

    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const total = words.length || 1;
    const frequencies = new Map<string, number>();
    for (const word of words) {
      frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
    }
    for (const [word, count] of frequencies) {
      const hash = this.simpleHash(word);
      const idx = Math.abs(hash) % dimension;
      const freq = count / total;
      vector[idx] = (vector[idx] ?? 0) + (1 + Math.log1p(freq));
    }

    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      for (let i = 0; i < dimension; i++) {
        vector[i] = (vector[i] ?? 0) / magnitude;
      }
    }

    return vector;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  }
}
