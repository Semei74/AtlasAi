export interface StreamingUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly estimatedCost: number;
}

export type StreamingChunk =
  | { readonly type: "delta"; readonly content: string }
  | {
      readonly type: "done";
      readonly finishReason: "stop" | "length" | "error";
      readonly usage?: StreamingUsage;
      readonly latency: number;
    }
  | { readonly type: "error"; readonly error: string };
