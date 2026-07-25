import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AI_CONFIG } from '../config';
import { aiApi } from '../api';
import type {
  Conversation,
  ChatMessage,
  ChatCompletionRequest,
  StreamChunk,
} from '../types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
}

interface ChatActions {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isStreaming: boolean;
  createConversation: (model?: string, provider?: string) => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  togglePinConversation: (id: string) => void;
  toggleArchiveConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
  stopGeneration: () => void;
  searchConversations: (query: string) => Conversation[];
  getPinnedConversations: () => Conversation[];
  getArchivedConversations: () => Conversation[];
  getRecentConversations: () => Conversation[];
}

const ChatContext = createContext<ChatActions | null>(null);

const STORAGE_KEY = AI_CONFIG.storageKeys.conversations;

function generateId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): Conversation[] {
  return [];
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [conversations, setConversations] = useState<Conversation[]>(loadFromStorage);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const persist = useCallback(async (convs: Conversation[]) => {
    setConversations(convs);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    } catch {
      // Storage write failed - non-critical
    }
  }, []);

  const createConversation = useCallback(
    (model: string = 'gpt-4o', provider: string = 'openai'): string => {
      const now = new Date().toISOString();
      const id = generateId();
      const conv: Conversation = {
        id,
        title: 'New conversation',
        model,
        provider,
        messages: [],
        createdAt: now,
        updatedAt: now,
        pinned: false,
        archived: false,
      };
      persist([conv, ...conversations]);
      setActiveConversationId(id);
      return id;
    },
    [conversations, persist],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      const filtered = conversations.filter((c) => c.id !== id);
      persist(filtered);
      if (activeConversationId === id) {
        setActiveConversationId(filtered[0]?.id ?? null);
      }
    },
    [conversations, activeConversationId, persist],
  );

  const renameConversation = useCallback(
    (id: string, title: string) => {
      const updated = conversations.map((c) =>
        c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c,
      );
      persist(updated);
    },
    [conversations, persist],
  );

  const togglePinConversation = useCallback(
    (id: string) => {
      const updated = conversations.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned, updatedAt: new Date().toISOString() } : c,
      );
      persist(updated);
    },
    [conversations, persist],
  );

  const toggleArchiveConversation = useCallback(
    (id: string) => {
      const updated = conversations.map((c) =>
        c.id === id ? { ...c, archived: !c.archived, updatedAt: new Date().toISOString() } : c,
      );
      persist(updated);
    },
    [conversations, persist],
  );

  const setActiveConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId) return;

      const now = new Date().toISOString();
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        timestamp: now,
        status: 'sent',
      };

      const updated = conversations.map((c) => {
        if (c.id !== activeConversationId) return c;
        return {
          ...c,
          messages: [...c.messages, userMessage],
          title: c.messages.length === 0 ? content.slice(0, 60) : c.title,
          updatedAt: now,
        };
      });
      setConversations(updated);
      persist(updated);

      const activeConv = updated.find((c) => c.id === activeConversationId);
      if (!activeConv) return;

      setIsStreaming(true);
      const assistantId = `msg_${Date.now()}_1`;

      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        status: 'streaming',
      };

      const withStreaming = updated.map((c) => {
        if (c.id !== activeConversationId) return c;
        return { ...c, messages: [...c.messages, assistantMsg], updatedAt: new Date().toISOString() };
      });
      setConversations(withStreaming);

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const messages = [
          ...activeConv.messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content },
        ];

        const request: ChatCompletionRequest = {
          model: activeConv.model,
          messages,
          stream: true,
        };

        let fullContent = '';

        for await (const chunk of aiApi.chatStream(request)) {
          if (abortController.signal.aborted) break;

          if (chunk.type === 'delta' && chunk.content) {
            fullContent += chunk.content;
            const updatedContent = conversations.map((c) => {
              if (c.id !== activeConversationId) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId ? { ...m, content: fullContent } : m,
                ),
              };
            });
            setConversations(updatedContent);
            persist(updatedContent);
          } else if (chunk.type === 'done') {
            const finalContent = conversations.map((c) => {
              if (c.id !== activeConversationId) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: fullContent,
                        status: 'done' as const,
                        tokens: chunk.usage,
                        finishReason: chunk.finishReason,
                      }
                    : m,
                ),
              };
            });
            setConversations(finalContent);
            persist(finalContent);
          } else if (chunk.type === 'error') {
            throw new Error(chunk.error ?? 'Stream error');
          }
        }
      } catch (err: any) {
        const errorContent = conversations.map((c) => {
          if (c.id !== activeConversationId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: m.content || 'Failed to generate response',
                    status: 'error' as const,
                    error: err.message ?? 'Unknown error',
                  }
                : m,
            ),
          };
        });
        setConversations(errorContent);
        persist(errorContent);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeConversationId, conversations, persist],
  );

  const regenerateLastResponse = useCallback(async () => {
    if (!activeConversationId) return;
    const conv = conversations.find((c) => c.id === activeConversationId);
    if (!conv || conv.messages.length < 2) return;

    const lastAssistantIndex = [...conv.messages].reverse().findIndex((m) => m.role === 'assistant');
    if (lastAssistantIndex === -1) return;

    const lastUserMessage = [...conv.messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    const stripped = conversations.map((c) => {
      if (c.id !== activeConversationId) return c;
      const messages = c.messages.filter(
        (_, i) => i < c.messages.length - lastAssistantIndex - 1,
      );
      return { ...c, messages };
    });
    setConversations(stripped);
    persist(stripped);

    await sendMessage(lastUserMessage.content);
  }, [activeConversationId, conversations, persist, sendMessage]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const searchConversations = useCallback(
    (query: string): Conversation[] => {
      if (!query.trim()) return [];
      const lower = query.toLowerCase();
      return conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(lower) ||
          c.messages.some((m) => m.content.toLowerCase().includes(lower)),
      );
    },
    [conversations],
  );

  const getPinnedConversations = useCallback(
    () => conversations.filter((c) => c.pinned && !c.archived),
    [conversations],
  );

  const getArchivedConversations = useCallback(
    () => conversations.filter((c) => c.archived),
    [conversations],
  );

  const getRecentConversations = useCallback(
    () =>
      [...conversations]
        .filter((c) => !c.archived)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [conversations],
  );

  const value = useMemo(
    () => ({
      conversations,
      activeConversation: conversations.find((c) => c.id === activeConversationId) ?? null,
      isStreaming,
      createConversation,
      deleteConversation,
      renameConversation,
      togglePinConversation,
      toggleArchiveConversation,
      setActiveConversation,
      sendMessage,
      regenerateLastResponse,
      stopGeneration,
      searchConversations,
      getPinnedConversations,
      getArchivedConversations,
      getRecentConversations,
    }),
    [
      conversations,
      activeConversationId,
      isStreaming,
      createConversation,
      deleteConversation,
      renameConversation,
      togglePinConversation,
      toggleArchiveConversation,
      setActiveConversation,
      sendMessage,
      regenerateLastResponse,
      stopGeneration,
      searchConversations,
      getPinnedConversations,
      getArchivedConversations,
      getRecentConversations,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatActions {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return ctx;
}
