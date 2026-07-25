import type {
  SearchQuery,
  SearchResult,
  SearchResponse,
  SearchProvider,
  RankingFunction,
  SearchType,
} from './types';

interface SearchableItem {
  id: string;
  type: SearchType;
  title: string;
  subtitle?: string;
  description?: string;
  content: string;
  tags: string[];
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export class SearchEngine {
  private providers: Map<string, SearchProvider> = new Map();
  private items: SearchableItem[] = [];
  private rankingFunctions: RankingFunction[] = [];
  private index: Map<string, Set<string>> = new Map();

  registerProvider(provider: SearchProvider): void {
    this.providers.set(provider.getScope(), provider);
  }

  unregisterProvider(scope: string): void {
    this.providers.delete(scope);
  }

  addRankingFunction(fn: RankingFunction): void {
    this.rankingFunctions.push(fn);
  }

  indexItem(item: SearchableItem): void {
    const existing = this.items.findIndex((i) => i.id === item.id && i.type === item.type);
    if (existing >= 0) {
      this.items[existing] = item;
    } else {
      this.items.push(item);
    }
    this.updateIndex(item);
  }

  removeItem(id: string, type: SearchType): void {
    this.items = this.items.filter((i) => !(i.id === id && i.type === type));
    this.index.delete(`${type}:${id}`);
  }

  clearIndex(): void {
    this.items = [];
    this.index.clear();
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const start = Date.now();
    const normalizedQuery = query.text.toLowerCase().trim();

    if (!normalizedQuery) {
      return {
        results: [],
        total: 0,
        query: query.text,
        latency: 0,
        scope: query.scope,
        hasMore: false,
      };
    }

    let results: SearchResult[] = this.searchLocal(normalizedQuery, query);

    for (const fn of this.rankingFunctions) {
      results = fn.rank(results, normalizedQuery);
    }

    results.sort((a, b) => b.score - a.score);
    const total = results.length;
    const paginated = results.slice(query.offset, query.offset + query.limit);

    return {
      results: paginated,
      total,
      query: query.text,
      latency: Date.now() - start,
      scope: query.scope,
      hasMore: query.offset + query.limit < total,
    };
  }

  private searchLocal(query: string, searchQuery: SearchQuery): SearchResult[] {
    let candidates = this.items;

    if (searchQuery.scope !== 'global') {
      candidates = candidates.filter((item) => {
        if (searchQuery.scope === 'conversations') return item.type === 'chat';
        if (searchQuery.scope === 'prompts') return item.type === 'prompt';
        if (searchQuery.scope === 'knowledge') return item.type === 'document';
        if (searchQuery.scope === 'workspace') return item.type === 'project' || item.type === 'agent';
        return true;
      });
    }

    if (searchQuery.types && searchQuery.types.length > 0 && !searchQuery.types.includes('all')) {
      candidates = candidates.filter((item) => searchQuery.types!.includes(item.type));
    }

    if (searchQuery.filters) {
      const f = searchQuery.filters;
      if (f.tags?.length) {
        candidates = candidates.filter((item) => f.tags!.some((t) => item.tags.includes(t)));
      }
      if (f.dateFrom) {
        const from = new Date(f.dateFrom).getTime();
        candidates = candidates.filter((item) => new Date(item.updatedAt).getTime() >= from);
      }
      if (f.dateTo) {
        const to = new Date(f.dateTo).getTime();
        candidates = candidates.filter((item) => new Date(item.updatedAt).getTime() <= to);
      }
    }

    const queryTerms = query.split(/\s+/).filter(Boolean);
    const scored: SearchResult[] = [];

    for (const item of candidates) {
      const score = this.calculateScore(item, query, queryTerms);
      if (score > 0) {
        scored.push({
          id: item.id,
          type: item.type,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          matchField: this.getMatchField(item, queryTerms),
          matchContext: this.getMatchContext(item, queryTerms),
          score,
          updatedAt: item.updatedAt,
          metadata: item.metadata,
        });
      }
    }

    return scored;
  }

  private calculateScore(item: SearchableItem, query: string, queryTerms: string[]): number {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const contentLower = item.content.toLowerCase();
    const subtitleLower = item.subtitle?.toLowerCase() ?? '';

    for (const term of queryTerms) {
      if (titleLower.includes(term)) score += 10;
      if (subtitleLower.includes(term)) score += 5;
      if (contentLower.includes(term)) {
        const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
        score += matches * 2;
      }
      if (item.tags.some((t) => t.toLowerCase().includes(term))) score += 3;
    }

    if (titleLower === query) score += 20;
    if (titleLower.startsWith(query)) score += 15;

    return score;
  }

  private getMatchField(item: SearchableItem, queryTerms: string[]): string | undefined {
    const titleLower = item.title.toLowerCase();
    const subtitleLower = item.subtitle?.toLowerCase() ?? '';

    for (const term of queryTerms) {
      if (titleLower.includes(term)) return 'title';
      if (subtitleLower.includes(term)) return 'subtitle';
    }
    return 'content';
  }

  private getMatchContext(item: SearchableItem, queryTerms: string[]): string | undefined {
    const contentLower = item.content.toLowerCase();
    let firstIndex = -1;
    let matchedTerm = '';

    for (const term of queryTerms) {
      const idx = contentLower.indexOf(term);
      if (idx >= 0 && (firstIndex < 0 || idx < firstIndex)) {
        firstIndex = idx;
        matchedTerm = term;
      }
    }

    if (firstIndex < 0) return undefined;

    const start = Math.max(0, firstIndex - 60);
    const end = Math.min(item.content.length, firstIndex + matchedTerm.length + 60);
    let context = item.content.slice(start, end);

    if (start > 0) context = '...' + context;
    if (end < item.content.length) context += '...';

    return context;
  }

  private updateIndex(item: SearchableItem): void {
    const terms = new Set([
      ...item.title.toLowerCase().split(/\s+/),
      ...item.content.toLowerCase().split(/\s+/),
      ...item.tags.map((t) => t.toLowerCase()),
    ]);

    const key = `${item.type}:${item.id}`;
    this.index.set(key, terms);
  }

  getIndexedCount(): number {
    return this.items.length;
  }

  destroy(): void {
    this.items = [];
    this.index.clear();
    this.providers.clear();
    this.rankingFunctions = [];
  }
}
