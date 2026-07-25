import type { ProviderError } from "./provider-error.interface.js";

export type ProviderResult<T> =
  | {
      readonly success: true;
      readonly data: T;
      readonly latency: number;
    }
  | {
      readonly success: false;
      readonly error: ProviderError;
      readonly latency: number;
    };
