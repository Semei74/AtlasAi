import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";

export class ChatMessageDto {
  @ApiProperty({ description: "Message role", enum: ["system", "user", "assistant"] })
  @IsString()
  @IsNotEmpty()
  public readonly role!: "system" | "user" | "assistant";

  @ApiProperty({ description: "Message content" })
  @IsString()
  @IsNotEmpty()
  public readonly content!: string;

  @ApiPropertyOptional({ description: "Sender name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public readonly name?: string;
}

export class ChatCompletionRequestDto {
  @ApiProperty({ description: "Model identifier", example: "gpt-4" })
  @IsString()
  @IsNotEmpty()
  public readonly model!: string;

  @ApiProperty({ description: "Conversation messages", type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  @ArrayMinSize(1)
  public readonly messages!: ChatMessageDto[];

  @ApiPropertyOptional({ description: "Sampling temperature", minimum: 0, maximum: 2, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  public readonly temperature?: number;

  @ApiPropertyOptional({ description: "Maximum tokens to generate", minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  public readonly maxTokens?: number;

  @ApiPropertyOptional({ description: "Enable streaming", default: false })
  @IsOptional()
  @IsBoolean()
  public readonly stream?: boolean;
}
