import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConversationMemory } from '../memory';
import type { MemoryMessage, ContextWindow, TokenBudget } from '../memory';

const memory = new ConversationMemory();

export const MEMORY_QUERY_KEYS = {
  context: (id: string) => ['engine', 'memory', 'context', id] as const,
  budget: (id: string) => ['engine', 'memory', 'budget', id] as const,
  summary: (id: string) => ['engine', 'memory', 'summary', id] as const,
};

export function useConversationContext(conversationId: string) {
  return useQuery({
    queryKey: MEMORY_QUERY_KEYS.context(conversationId),
    queryFn: (): ContextWindow => memory.getContextWindow(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60,
  });
}

export function useTokenBudget(conversationId: string) {
  return useQuery({
    queryKey: MEMORY_QUERY_KEYS.budget(conversationId),
    queryFn: (): TokenBudget => memory.getTokenBudget(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 15,
  });
}

export function useConversationSummary(conversationId: string) {
  return useQuery({
    queryKey: MEMORY_QUERY_KEYS.summary(conversationId),
    queryFn: () => memory.getSummary(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 60,
  });
}

export function useAddMemoryMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: MemoryMessage;
    }) => {
      memory.addMessage(conversationId, message);
      return Promise.resolve();
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: MEMORY_QUERY_KEYS.context(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: MEMORY_QUERY_KEYS.budget(conversationId),
      });
    },
  });
}

export function useCompressMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => {
      memory.compress(conversationId);
      return Promise.resolve();
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: MEMORY_QUERY_KEYS.context(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: MEMORY_QUERY_KEYS.budget(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: MEMORY_QUERY_KEYS.summary(conversationId),
      });
    },
  });
}

export { memory as conversationMemory };
