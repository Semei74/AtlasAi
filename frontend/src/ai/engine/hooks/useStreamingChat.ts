import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { StreamingEngine, StreamParser, TypingIndicator } from '../streaming';
import { conversationEngine } from './useConversation';
import { PromptRuntime } from '../prompt';
import type { ChatMessage } from '../../types';
import type { StreamState } from '../streaming';

interface UseStreamingChatOptions {
  conversationId: string;
  onDelta?: (content: string) => void;
  onDone?: (fullContent: string) => void;
  onError?: (error: string) => void;
}

export function useStreamingChat(options: UseStreamingChatOptions) {
  const [streamState, setStreamState] = useState<StreamState>('idle');
  const [streamContent, setStreamContent] = useState('');
  const [typingDots, setTypingDots] = useState('');
  const streamingEngineRef = useRef<StreamingEngine | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const engine = new StreamingEngine({ maxRetries: 3 });
    streamingEngineRef.current = engine;

    engine.on('delta', (event) => {
      if (event.data) {
        setStreamContent((prev) => prev + event.data!);
        options.onDelta?.(event.data);
      }
    });

    engine.on('done', () => {
      setStreamState('done');
      const fullContent = engine.getBuffer().fullContent;
      options.onDone?.(fullContent);
      queryClient.invalidateQueries({
        queryKey: ['engine', 'conversations', options.conversationId, 'messages'],
      });
    });

    engine.on('error', (event) => {
      setStreamState('error');
      options.onError?.(event.error ?? 'Stream error');
    });

    engine.on('abort', () => {
      setStreamState('aborted');
    });

    return () => {
      engine.destroy();
    };
  }, [options.conversationId]);

  const startStream = useCallback(
    async (streamFn: () => AsyncGenerator<string, void, unknown>) => {
      const engine = streamingEngineRef.current;
      if (!engine) return;

      setStreamState('connecting');
      setStreamContent('');

      try {
        await engine.connect(streamFn);
        setStreamState('done');
      } catch (err) {
        setStreamState('error');
        options.onError?.(err instanceof Error ? err.message : 'Stream failed');
      }
    },
    [options],
  );

  const stopStream = useCallback(() => {
    streamingEngineRef.current?.abort();
    setStreamState('aborted');
  }, []);

  const regenerate = useCallback(
    async (lastUserMessage: string) => {
      const conv = conversationEngine.get(options.conversationId);
      if (!conv) return;

      conversationEngine.removeLastAssistantMessage(options.conversationId);
      setStreamContent('');

      const streamFn = async function* () {
        const response = await fetch('/api/v1/ai/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: conv.model,
            messages: [
              ...conv.messages.map((m) => ({ role: m.role, content: m.content })),
              { role: 'user', content: lastUserMessage },
            ],
            stream: true,
          }),
        });

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield decoder.decode(value, { stream: true });
        }
      };

      await startStream(streamFn);
    },
    [options.conversationId, startStream],
  );

  return {
    streamState,
    streamContent,
    typingDots,
    startStream,
    stopStream,
    regenerate,
    isStreaming: streamState === 'connecting' || streamState === 'streaming',
  };
}

export { PromptRuntime };
