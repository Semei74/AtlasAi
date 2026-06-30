export const SESSION_CONFIG = "SESSION_CONFIG";

export interface SessionConfig {
  readonly idleTimeoutMs: number;
  readonly absoluteTimeoutMs: number;
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  idleTimeoutMs: 30 * 60 * 1000,
  absoluteTimeoutMs: 24 * 60 * 60 * 1000,
};
