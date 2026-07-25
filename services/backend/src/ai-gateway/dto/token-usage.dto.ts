import { ApiProperty } from "@nestjs/swagger";

export class TokenUsageDto {
  @ApiProperty({ description: "Number of prompt tokens", example: 50, type: Number })
  public readonly promptTokens!: number;

  @ApiProperty({ description: "Number of completion tokens", example: 100, type: Number })
  public readonly completionTokens!: number;

  @ApiProperty({ description: "Total tokens used", example: 150, type: Number })
  public readonly totalTokens!: number;

  @ApiProperty({ description: "Estimated cost in USD", example: 0.002, type: Number })
  public readonly estimatedCost!: number;
}
