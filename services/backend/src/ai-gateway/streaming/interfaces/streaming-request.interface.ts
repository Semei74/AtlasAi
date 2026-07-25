export interface StreamingMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
  readonly name?: string;
}

export interface StreamingRequest {
  readonly provider: string;
  readonly model: string;
  readonly messages: readonly StreamingMessage[];
  readonly temperature?: number;
  readonly maxTokens?: number;
}
