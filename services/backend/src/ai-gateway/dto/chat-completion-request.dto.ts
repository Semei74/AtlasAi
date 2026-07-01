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
  @IsString()
  @IsNotEmpty()
  public readonly role!: "system" | "user" | "assistant";

  @IsString()
  @IsNotEmpty()
  public readonly content!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public readonly name?: string;
}

export class ChatCompletionRequestDto {
  @IsString()
  @IsNotEmpty()
  public readonly model!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  @ArrayMinSize(1)
  public readonly messages!: ChatMessageDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  public readonly temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  public readonly maxTokens?: number;

  @IsOptional()
  @IsBoolean()
  public readonly stream?: boolean;
}
