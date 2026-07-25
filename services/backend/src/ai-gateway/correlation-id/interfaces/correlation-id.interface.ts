export interface CorrelationIdConfig {
  readonly headerName: string;
  readonly injectInResponse: boolean;
  readonly responseHeaderName: string;
}

export interface CorrelationIdService {
  readonly config: CorrelationIdConfig;
  get(): string;
  set(id: string): void;
  generate(): string;
  reset(): void;
}

export const CORRELATION_ID_SERVICE = "CORRELATION_ID_SERVICE";
