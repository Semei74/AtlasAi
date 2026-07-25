import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConversationEngine } from '../conversation';
import type { ConversationFilter, ConversationData } from '../conversation';

const STORAGE_KEY = 'atlas_conversations_v2';

const engine = new ConversationEngine(STORAGE_KEY);

export const CONVERSATION_QUERY_KEYS = {
  all: ['engine', 'conversations'] as const,
  list: (filter?: ConversationFilter) => ['engine', 'conversations', 'list', filter] as const,
  detail: (id: string) => ['engine', 'conversations', 'detail', id] as const,
  pinned: ['engine', 'conversations', 'pinned'] as const,
  archived: ['engine', 'conversations', 'archived'] as const,
  recent: ['engine', 'conversations', 'recent'] as const,
};

export function useConversationList(filter?: ConversationFilter) {
  return useQuery({
    queryKey: CONVERSATION_QUERY_KEYS.list(filter),
    queryFn: () => {
      if (filter) return engine.filter(filter);
      return engine.getAll();
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: CONVERSATION_QUERY_KEYS.detail(id),
    queryFn: () => {
      const conv = engine.get(id);
      if (!conv) throw new Error(`Conversation ${id} not found`);
      return conv;
    },
    enabled: !!id,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60,
  });
}

export function usePinnedConversations() {
  return useQuery({
    queryKey: CONVERSATION_QUERY_KEYS.pinned,
    queryFn: () => engine.getPinned(),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export function useArchivedConversations() {
  return useQuery({
    queryKey: CONVERSATION_QUERY_KEYS.archived,
    queryFn: () => engine.getArchived(),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export function useRecentConversations(limit: number = 10) {
  return useQuery({
    queryKey: [...CONVERSATION_QUERY_KEYS.recent, limit],
    queryFn: () => engine.getRecent(limit),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ model, provider }: { model?: string; provider?: string }) =>
      engine.create(model, provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.all });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => engine.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.all });
    },
  });
}

export function useRenameConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => engine.rename(id, title),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.detail(id) });
    },
  });
}

export function useTogglePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => engine.togglePin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.pinned });
    },
  });
}

export function useToggleArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => engine.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.archived });
    },
  });
}

export function useExportConversation() {
  return useMutation({
    mutationFn: ({
      id,
      format,
    }: {
      id: string;
      format: 'json' | 'markdown' | 'text';
    }) => engine.exportConversation(id, { format, includeMetadata: true, includeMessages: true }),
  });
}

export function useImportConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title?: string; messages?: import('../../types').ChatMessage[] }) =>
      engine.importConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.all });
    },
  });
}

export { engine as conversationEngine };
