export type SearchScope = 'conversations' | 'prompts' | 'knowledge' | 'workspace' | 'global';

export type SearchType = 'chat' | 'prompt' | 'document' | 'project' | 'agent' | 'all';

export interface SearchQuery {
  text: string;
  scope: SearchScope;
  types?: SearchType[];
  limit: number;
  offset: number;
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  status?: string;
  provider?: string;
  model?: string;
}

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  subtitle?: string;
  description?: string;
  matchField?: string;
  matchContext?: string;
  score: number;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  latency: number;
  scope: SearchScope;
  hasMore: boolean;
}

export interface SearchProvider {
  search(query: SearchQuery): Promise<SearchResponse>;
  getScope(): SearchScope;
}

export interface RankingFunction {
  rank(results: SearchResult[], query: string): SearchResult[];
}
