export type StreamState =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'paused'
  | 'done'
  | 'error'
  | 'aborted';

export type StreamEventType =
  | 'connect'
  | 'delta'
  | 'done'
  | 'error'
  | 'abort'
  | 'retry'
  | 'reconnect';

export interface StreamEvent {
  type: StreamEventType;
  timestamp: number;
  data?: string;
  token?: string;
  partialTokens?: string[];
  finishReason?: string;
  error?: string;
  retryCount?: number;
}

export interface StreamBuffer {
  chunks: string[];
  fullContent: string;
  lastFlushed: number;
  size: number;
}

export interface StreamParser {
  parse(chunk: string): StreamEvent[];
  reset(): void;
}

export interface StreamMetrics {
  startTime: number;
  endTime?: number;
  totalChunks: number;
  totalTokens: number;
  tokensPerSecond: number;
  latency: number;
  retries: number;
}

export interface StreamConfig {
  maxRetries: number;
  retryDelay: number;
  bufferSize: number;
  reconnectTimeout: number;
  idleTimeout: number;
}

export const DEFAULT_STREAM_CONFIG: StreamConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  bufferSize: 4096,
  reconnectTimeout: 5000,
  idleTimeout: 30000,
};

export interface StateMachineTransition {
  from: StreamState;
  to: StreamState;
  event: StreamEventType;
}

export const STREAM_STATE_MACHINE: StateMachineTransition[] = [
  { from: 'idle', to: 'connecting', event: 'connect' },
  { from: 'connecting', to: 'streaming', event: 'delta' },
  { from: 'connecting', to: 'error', event: 'error' },
  { from: 'streaming', to: 'streaming', event: 'delta' },
  { from: 'streaming', to: 'done', event: 'done' },
  { from: 'streaming', to: 'error', event: 'error' },
  { from: 'streaming', to: 'aborted', event: 'abort' },
  { from: 'streaming', to: 'connecting', event: 'reconnect' },
  { from: 'error', to: 'connecting', event: 'retry' },
  { from: 'error', to: 'aborted', event: 'abort' },
  { from: 'aborted', to: 'idle', event: 'abort' },
  { from: 'done', to: 'idle', event: 'done' },
];
