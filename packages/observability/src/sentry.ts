import * as Sentry from "@sentry/react";
import { rootLogger } from "@atlas/logger";

interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
}

export function initSentry(config: SentryConfig): void {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    tracesSampleRate: config.tracesSampleRate ?? 0.25,
    replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,
    integrations: [Sentry.replayIntegration()],
  });

  rootLogger.info("Sentry initialized", { environment: config.environment });
}

export function setSentryUser(user: { id: string } | null): void {
  Sentry.setUser(user ?? null);
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  Sentry.captureException(error, { extra: context });
}
