export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly service?: string;
  readonly module?: string;
  readonly details?: Record<string, unknown>;
  readonly error?: {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
  };
}

export interface Logger {
  debug(message: string, details?: Record<string, unknown>): void;
  info(message: string, details?: Record<string, unknown>): void;
  warn(message: string, details?: Record<string, unknown>): void;
  error(message: string, error?: Error, details?: Record<string, unknown>): void;
  child(context: Partial<LogEntry>): Logger;
}

export interface LoggerConfig {
  readonly level: LogLevel;
  readonly service: string | undefined;
  readonly prettyPrint: boolean | undefined;
}

export interface BuildEntryExtra {
  error: Error | undefined;
  details: Record<string, unknown> | undefined;
  service: string | undefined;
}

function logLevelIndex(level: LogLevel): number {
  const levels: LogLevel[] = ["debug", "info", "warn", "error"];
  return levels.indexOf(level);
}

function buildEntry(level: LogLevel, message: string, extra: BuildEntryExtra): LogEntry {
  const entry: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (extra.service) {
    entry["service"] = extra.service;
  }

  if (extra.details) {
    entry["details"] = extra.details;
  }

  if (extra.error) {
    entry["error"] = {
      name: extra.error.name,
      message: extra.error.message,
      stack: extra.error.stack,
    };
  }

  return entry as unknown as LogEntry;
}

export function createLogger(config: LoggerConfig): Logger {
  const minLevel = logLevelIndex(config.level);

  function write(entry: LogEntry): void {
    if (logLevelIndex(entry.level) < minLevel) {
      return;
    }

    const output = JSON.stringify(entry);

    switch (entry.level) {
      case "error": {
        console.error(output);
        break;
      }
      case "warn": {
        console.warn(output);
        break;
      }
      default: {
        console.log(output);
      }
    }
  }

  return {
    debug(message, details): void {
      write(
        buildEntry("debug", message, {
          error: undefined,
          details: details ?? undefined,
          service: config.service,
        }),
      );
    },
    info(message, details): void {
      write(
        buildEntry("info", message, {
          error: undefined,
          details: details ?? undefined,
          service: config.service,
        }),
      );
    },
    warn(message, details): void {
      write(
        buildEntry("warn", message, {
          error: undefined,
          details: details ?? undefined,
          service: config.service,
        }),
      );
    },
    error(message, error, details): void {
      write(
        buildEntry("error", message, {
          error,
          details: details ?? undefined,
          service: config.service,
        }),
      );
    },
    child(context): Logger {
      return createLogger({
        level: config.level,
        service: context.service ?? config.service,
        prettyPrint: config.prettyPrint,
      });
    },
  };
}

function getLogLevel(): LogLevel {
  const env = process.env["LOG_LEVEL"];
  if (env === "debug" || env === "info" || env === "warn" || env === "error") {
    return env;
  }
  return "info";
}

export const rootLogger = createLogger({
  level: getLogLevel(),
  service: process.env["SERVICE_NAME"],
  prettyPrint: undefined,
});
