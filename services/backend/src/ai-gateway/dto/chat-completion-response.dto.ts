import { ApiProperty } from "@nestjs/swagger";
import { TokenUsageDto } from "./token-usage.dto.js";

export class ChatCompletionResponseDto {
  @ApiProperty({ description: "Response ID", type: String })
  public readonly id!: string;

  @ApiProperty({ description: "Model used", type: String })
  public readonly model!: string;

  @ApiProperty({ description: "Provider name", type: String })
  public readonly provider!: string;

  @ApiProperty({ description: "Generated content", type: String })
  public readonly content!: string;

  @ApiProperty({ enum: ["stop", "length", "error"], description: "Finish reason", type: String })
  public readonly finishReason!: "stop" | "length" | "error";

  @ApiProperty({ description: "Token usage", type: () => TokenUsageDto })
  public readonly usage!: TokenUsageDto;

  @ApiProperty({ description: "Latency in ms", type: Number })
  public readonly latency!: number;

  public static from(
    data: { id: string; model: string; provider: string; content: string; finishReason: "stop" | "length" | "error"; usage: TokenUsageDto; latency: number },
  ): ChatCompletionResponseDto {
    const dto = new ChatCompletionResponseDto();
    return Object.assign(dto, data);
  }
}
