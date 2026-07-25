export type ProviderMessageRole = "system" | "user" | "assistant";

export interface ProviderChatMessage {
  readonly role: ProviderMessageRole;
  readonly content: string;
  readonly name?: string;
}

export interface ProviderChatRequest {
  readonly model: string;
  readonly messages: readonly ProviderChatMessage[];
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly stream: boolean;
}
