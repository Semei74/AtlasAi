import type { Chunk, RetrievalQuery, RetrievalResult, ScoredChunk, RetrieverPipelineStep } from './types';

export class Retriever {
  private chunks: Map<string, Chunk> = new Map();
  private pipeline: RetrieverPipelineStep[] = [];

  addChunks(chunks: Chunk[]): void {
    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
    }
  }

  removeChunk(id: string): void {
    this.chunks.delete(id);
  }

  clear(): void {
    this.chunks.clear();
  }

  addPipelineStep(step: RetrieverPipelineStep): void {
    this.pipeline.push(step);
  }

  getChunkCount(): number {
    return this.chunks.size;
  }

  getAllChunks(): Chunk[] {
    return Array.from(this.chunks.values());
  }

  async retrieve(query: RetrievalQuery): Promise<RetrievalResult> {
    const start = Date.now();
    const allChunks = Array.from(this.chunks.values());

    let filtered = allChunks;

    if (query.documentIds?.length) {
      filtered = filtered.filter((c) => query.documentIds!.includes(c.documentId));
    }

    if (query.filters) {
      filtered = filtered.filter((chunk) => {
        for (const [key, value] of Object.entries(query.filters!)) {
          if ((chunk.metadata as any)[key] !== value) return false;
        }
        return true;
      });
    }

    let scored: ScoredChunk[] = filtered.map((chunk) => ({
      chunk,
      score: this.calculateKeywordScore(chunk.content, query.text),
    }));

    scored.sort((a, b) => b.score - a.score);
    scored = scored.filter((s) => s.score >= query.minScore);

    for (const step of this.pipeline) {
      scored = await step.process(query, scored);
    }

    const topK = scored.slice(0, query.topK);

    return {
      chunks: topK,
      query: query.text,
      latency: Date.now() - start,
      totalResults: topK.length,
    };
  }

  private calculateKeywordScore(content: string, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const contentLower = content.toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    if (contentLower.includes(query.toLowerCase())) {
      score += queryTerms.length * 2;
    }

    return score / Math.max(content.split(/\s+/).length, 1);
  }

  findSimilar(query: string, topK: number = 5): ScoredChunk[] {
    const allChunks = Array.from(this.chunks.values());
    const scored: ScoredChunk[] = allChunks.map((chunk) => ({
      chunk,
      score: this.calculateKeywordScore(chunk.content, query),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}
