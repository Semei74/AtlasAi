import type {
  StreamState,
  StreamEvent,
  StreamBuffer,
  StreamMetrics,
  StreamConfig,
} from './types';
import { DEFAULT_STREAM_CONFIG, STREAM_STATE_MACHINE } from './types';

export class StreamingEngine {
  private abortController: AbortController | null = null;
  private state: StreamState = 'idle';
  private buffer: StreamBuffer = {
    chunks: [],
    fullContent: '',
    lastFlushed: Date.now(),
    size: 0,
  };
  private metrics: StreamMetrics = {
    startTime: 0,
    totalChunks: 0,
    totalTokens: 0,
    tokensPerSecond: 0,
    latency: 0,
    retries: 0,
  };
  private config: StreamConfig;
  private retryCount: number = 0;
  private listeners: Map<StreamEvent['type'], Set<(event: StreamEvent) => void>>;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config?: Partial<StreamConfig>) {
    this.config = { ...DEFAULT_STREAM_CONFIG, ...config };
    this.listeners = new Map();
  }

  on(eventType: StreamEvent['type'], handler: (event: StreamEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);
    return () => this.listeners.get(eventType)?.delete(handler);
  }

  private emit(event: StreamEvent): void {
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      handlers.forEach((fn) => fn(event));
    }
  }

  private transition(eventType: StreamEvent['type']): boolean {
    const valid = STREAM_STATE_MACHINE.find(
      (t) => t.from === this.state && t.event === eventType,
    );
    if (!valid) {
      return false;
    }
    this.state = valid.to;
    return true;
  }

  getState(): StreamState {
    return this.state;
  }

  getMetrics(): StreamMetrics {
    return { ...this.metrics };
  }

  getBuffer(): Readonly<StreamBuffer> {
    return { ...this.buffer };
  }

  async connect(streamFn: () => AsyncGenerator<string, void, unknown>): Promise<void> {
    if (!this.transition('connect')) {
      throw new Error(`Cannot connect from state ${this.state}`);
    }

    this.abortController = new AbortController();
    this.metrics.startTime = Date.now();
    this.startIdleTimer();

    this.emit({ type: 'connect', timestamp: Date.now() });

    try {
      const generator = streamFn();
      let streamActive = true;

      while (streamActive && !this.abortController.signal.aborted) {
        const { value, done } = await Promise.race([
          generator.next(),
          this.abortController.signal.aborted
            ? Promise.resolve({ value: undefined as string, done: true })
            : new Promise<never>((_, reject) => {
                this.abortController!.signal.addEventListener(
                  'abort',
                  () => reject(new Error('Stream aborted')),
                  { once: true },
                );
              }),
        ]);

        if (done) {
          streamActive = false;
          this.handleDone();
          break;
        }

        this.handleChunk(value);
      }
    } catch (err) {
      if (this.abortController?.signal.aborted) {
        this.handleAbort();
        return;
      }
      this.handleError(err instanceof Error ? err.message : 'Stream error');
    }
  }

  private handleChunk(chunk: string): void {
    this.resetIdleTimer();

    const tokens = chunk.split(/\s+/).filter(Boolean);
    const token = chunk;

    this.buffer.chunks.push(chunk);
    this.buffer.fullContent += chunk;
    this.buffer.size += chunk.length;
    this.buffer.lastFlushed = Date.now();

    this.metrics.totalChunks++;
    this.metrics.totalTokens += tokens.length;

    if (this.buffer.size >= this.config.bufferSize) {
      this.flushBuffer();
    }

    this.transition('delta');
    this.emit({
      type: 'delta',
      timestamp: Date.now(),
      data: chunk,
      token,
      partialTokens: tokens,
    });
  }

  private handleDone(): void {
    this.flushBuffer();
    this.metrics.endTime = Date.now();
    const elapsed = (this.metrics.endTime - this.metrics.startTime) / 1000;
    this.metrics.tokensPerSecond = elapsed > 0 ? this.metrics.totalTokens / elapsed : 0;
    this.metrics.latency = this.metrics.endTime - this.metrics.startTime;

    this.transition('done');
    this.emit({
      type: 'done',
      timestamp: Date.now(),
      finishReason: 'stop',
    });

    this.cleanup();
  }

  private handleError(errorMessage: string): void {
    this.metrics.endTime = Date.now();
    this.transition('error');

    this.emit({
      type: 'error',
      timestamp: Date.now(),
      error: errorMessage,
      retryCount: this.retryCount,
    });

    if (this.retryCount < this.config.maxRetries) {
      this.retryCount++;
      this.metrics.retries++;
      this.transition('retry');
      this.emit({ type: 'retry', timestamp: Date.now(), retryCount: this.retryCount });

      this.reconnectTimer = setTimeout(() => {
        this.transition('reconnect');
        this.emit({ type: 'reconnect', timestamp: Date.now() });
      }, this.config.retryDelay * this.retryCount);
    } else {
      this.cleanup();
    }
  }

  private handleAbort(): void {
    this.transition('abort');
    this.emit({ type: 'abort', timestamp: Date.now() });
    this.cleanup();
  }

  abort(): void {
    this.abortController?.abort();
    this.handleAbort();
  }

  private flushBuffer(): void {
    this.buffer.lastFlushed = Date.now();
    this.buffer.size = 0;
  }

  private startIdleTimer(): void {
    this.idleTimer = setTimeout(() => {
      if (this.state === 'streaming') {
        this.handleError('Stream idle timeout');
      }
    }, this.config.idleTimeout);
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    if (this.state === 'streaming') {
      this.startIdleTimer();
    }
  }

  private cleanup(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.abortController = null;
  }

  reset(): void {
    this.cleanup();
    this.state = 'idle';
    this.buffer = {
      chunks: [],
      fullContent: '',
      lastFlushed: Date.now(),
      size: 0,
    };
    this.retryCount = 0;
  }

  destroy(): void {
    this.cleanup();
    this.listeners.clear();
    this.state = 'idle';
    this.buffer = {
      chunks: [],
      fullContent: '',
      lastFlushed: Date.now(),
      size: 0,
    };
    this.retryCount = 0;
  }
}

export class StreamParser {
  private partial: string = '';

  parse(chunk: string): string[] {
    this.partial += chunk;
    const lines = this.partial.split('\n');
    this.partial = lines.pop() ?? '';

    const events: string[] = [];
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        events.push(line.slice(6));
      }
    }
    return events;
  }

  reset(): void {
    this.partial = '';
  }
}

export class TypingIndicator {
  private timer: ReturnType<typeof setInterval> | null = null;
  private dotCount: number = 0;
  private callback: ((dots: string) => void) | null = null;

  start(cb: (dots: string) => void): void {
    this.callback = cb;
    this.dotCount = 0;
    cb('');
    this.timer = setInterval(() => {
      this.dotCount = (this.dotCount + 1) % 4;
      cb('.'.repeat(this.dotCount));
    }, 400);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.callback?.('');
    this.callback = null;
  }

  destroy(): void {
    this.stop();
  }
}
