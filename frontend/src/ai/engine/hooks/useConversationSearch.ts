import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchEngine } from '../search';
import type { SearchQuery, SearchResponse, SearchType } from '../search';

const searchEngine = new SearchEngine();

export const SEARCH_QUERY_KEYS = {
  search: ['engine', 'search'] as const,
};

export function useConversationSearch(query: SearchQuery) {
  return useQuery({
    queryKey: [...SEARCH_QUERY_KEYS.search, query],
    queryFn: () => searchEngine.search(query),
    enabled: !!query.text,
    staleTime: 0,
    gcTime: 1000 * 60,
  });
}

export function useGlobalSearch() {
  return useMutation({
    mutationFn: (query: SearchQuery) => searchEngine.search(query),
  });
}

export function useIndexItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: {
      id: string;
      type: SearchType;
      title: string;
      content: string;
      tags: string[];
      updatedAt: string;
    }) => {
      searchEngine.indexItem(item);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEARCH_QUERY_KEYS.search });
    },
  });
}

export { searchEngine };
