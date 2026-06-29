import type { Logger, LogEntry } from "@atlas/logger";

export interface MockLogger extends Logger {
  readonly messages: {
    level: string;
    message: string;
    details?: Record<string, unknown>;
    error?: Error;
  }[];
  reset(): void;
}

function add(
  messages: MockLogger["messages"],
  level: string,
  message: string,
  details?: Record<string, unknown>,
  error?: Error,
): void {
  const entry: {
    level: string;
    message: string;
    details?: Record<string, unknown>;
    error?: Error;
  } = { level, message };
  if (details !== undefined) {
    entry.details = details;
  }
  if (error !== undefined) {
    entry.error = error;
  }
  messages.push(entry);
}

export function createMockLogger(): MockLogger {
  const messages: MockLogger["messages"] = [];

  return {
    messages,
    debug(message: string, details?: Record<string, unknown>): void {
      add(messages, "debug", message, details);
    },
    info(message: string, details?: Record<string, unknown>): void {
      add(messages, "info", message, details);
    },
    warn(message: string, details?: Record<string, unknown>): void {
      add(messages, "warn", message, details);
    },
    error(message: string, error?: Error, details?: Record<string, unknown>): void {
      add(messages, "error", message, details, error);
    },
    child(_context: Partial<LogEntry>): MockLogger {
      return createMockLogger();
    },
    reset(): void {
      messages.length = 0;
    },
  };
}

function noop(): void {
  /* noop */
}

export function noopLogger(): Logger {
  return {
    debug(_message: string, _details?: Record<string, unknown>): void {
      noop();
    },
    info(_message: string, _details?: Record<string, unknown>): void {
      noop();
    },
    warn(_message: string, _details?: Record<string, unknown>): void {
      noop();
    },
    error(_message: string, _error?: Error, _details?: Record<string, unknown>): void {
      noop();
    },
    child(_context: Partial<LogEntry>): Logger {
      return noopLogger();
    },
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function expectRejection(
  fn: () => Promise<unknown>,
  errorType?: new (...args: unknown[]) => Error,
): Promise<Error> {
  try {
    await fn();
    throw new Error("Expected function to throw");
  } catch (error) {
    if (errorType && !(error instanceof errorType)) {
      throw new Error(
        `Expected error of type ${errorType.name}, got ${(error as Error).constructor.name}`,
      );
    }
    return error as Error;
  }
}

export function generateId(): string {
  const ts = Date.now().toString();
  const rand = Math.random().toString(36).slice(2, 9);
  return `test_${ts}_${rand}`;
}
