import type { GatewayResponse } from "../interfaces/ai-gateway.interface.js";

export class ChatCompletionResponseDto {
  public readonly id: string;
  public readonly model: string;
  public readonly provider: string;
  public readonly content: string;
  public readonly finishReason: "stop" | "length" | "error";
  public readonly usage: {
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
    readonly estimatedCost: number;
  };
  public readonly latency: number;

  private constructor(data: ChatCompletionResponseDto) {
    this.id = data.id;
    this.model = data.model;
    this.provider = data.provider;
    this.content = data.content;
    this.finishReason = data.finishReason;
    this.usage = data.usage;
    this.latency = data.latency;
  }

  public static from(response: GatewayResponse): ChatCompletionResponseDto {
    return new ChatCompletionResponseDto({
      id: response.id,
      model: response.model,
      provider: response.provider,
      content: response.content,
      finishReason: response.finishReason,
      usage: {
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        estimatedCost: response.usage.estimatedCost,
      },
      latency: response.latency,
    });
  }
}
