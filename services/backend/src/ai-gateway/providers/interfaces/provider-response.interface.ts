export interface ProviderTokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface ProviderChatResponse {
  readonly id: string;
  readonly model: string;
  readonly content: string;
  // Optional parsed tool result attached by provider runtimes when available
  readonly toolResult?: unknown;
  readonly finishReason: "stop" | "length" | "error";
  readonly usage: ProviderTokenUsage;
}
