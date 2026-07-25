export interface IdempotencyConfig {
  readonly ttlMs: number;
  readonly keyPrefix: string;
}

export interface IdempotencyRecord {
  readonly key: string;
  readonly result: unknown;
  readonly createdAt: Date;
  readonly expiresAt: Date;
}

export interface IdempotencyService {
  readonly config: IdempotencyConfig;

  get(key: string): Promise<IdempotencyRecord | null>;
  set(key: string, result: unknown): Promise<void>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  clearExpired(): Promise<number>;
}

export const IDEMPOTENCY_SERVICE = "IDEMPOTENCY_SERVICE";
