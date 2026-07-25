import type { Chunk, Citation } from './types';

export class CitationBuilder {
  build(chunks: Chunk[], query?: string): Citation[] {
    return chunks.map((chunk, index) => ({
      id: `cit_${index + 1}`,
      source: chunk.metadata.source || `Document ${chunk.documentId}`,
      text: chunk.content.slice(0, 200) + (chunk.content.length > 200 ? '...' : ''),
      page: chunk.metadata.page,
      section: chunk.metadata.section,
      relevanceScore: query
        ? this.calculateRelevance(chunk.content, query)
        : 1,
    }));
  }

  private calculateRelevance(content: string, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const contentLower = content.toLowerCase();
    let matches = 0;

    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        matches++;
      }
    }

    return matches / Math.max(queryTerms.length, 1);
  }
}
