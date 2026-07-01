import type { TokenUsage } from "./token-usage.interface.js";

export interface ChatMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
  readonly name?: string;
}

export interface GatewayRequest {
  readonly model: string;
  readonly messages: readonly ChatMessage[];
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly stream: boolean;
  readonly workspaceId: string;
  readonly organizationId: string;
}

export interface GatewayResponse {
  readonly id: string;
  readonly model: string;
  readonly provider: string;
  readonly content: string;
  readonly finishReason: "stop" | "length" | "error";
  readonly usage: TokenUsage;
  readonly latency: number;
}
