import type { TokenAccountingProvider } from "../../providers/interfaces/token-accounting.interface.js";
import type { ProviderTokenUsage } from "../../providers/interfaces/provider-response.interface.js";
import type { TokenUsage } from "../../interfaces/token-usage.interface.js";

export const TOKEN_ACCOUNTING_PROVIDER = "TOKEN_ACCOUNTING_PROVIDER";

export interface TokenAccountingResult {
  readonly usage: TokenUsage;
  readonly cachedTokens: number;
  readonly estimated: boolean;
  readonly currency: string;
}

export interface AccountRequest {
  readonly provider: string;
  readonly model: string;
  readonly providerUsage?: ProviderTokenUsage;
  readonly promptText?: string;
  readonly completionText?: string;
}

export interface TokenAccountingService extends TokenAccountingProvider {
  account(request: AccountRequest): TokenAccountingResult;
}
