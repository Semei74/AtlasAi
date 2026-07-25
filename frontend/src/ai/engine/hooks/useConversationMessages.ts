import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationEngine } from './useConversation';
import type { ChatMessage } from '../../types';

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['engine', 'conversations', conversationId, 'messages'],
    queryFn: () => {
      const conv = conversationEngine.get(conversationId);
      return conv?.messages ?? [];
    },
    enabled: !!conversationId,
    staleTime: 0,
    gcTime: 1000 * 60,
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: ChatMessage;
    }) => {
      conversationEngine.addMessage(conversationId, message);
      return Promise.resolve();
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['engine', 'conversations', conversationId, 'messages'],
      });
      queryClient.invalidateQueries({
        queryKey: ['engine', 'conversations', 'detail', conversationId],
      });
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      updates,
    }: {
      conversationId: string;
      messageId: string;
      updates: Partial<ChatMessage>;
    }) => {
      conversationEngine.updateMessage(conversationId, messageId, updates);
      return Promise.resolve();
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['engine', 'conversations', conversationId, 'messages'],
      });
    },
  });
}

export function useRemoveLastAssistantMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => {
      conversationEngine.removeLastAssistantMessage(conversationId);
      return Promise.resolve();
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ['engine', 'conversations', conversationId, 'messages'],
      });
    },
  });
}
