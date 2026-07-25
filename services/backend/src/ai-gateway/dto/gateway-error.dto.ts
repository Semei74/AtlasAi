import { ApiProperty } from "@nestjs/swagger";

export class GatewayErrorDto {
  @ApiProperty({ description: "Error type", example: "provider_error" })
  public readonly error!: string;

  @ApiProperty({ description: "Error message", example: "Provider returned 500 Internal Server Error" })
  public readonly message!: string;

  @ApiProperty({ description: "HTTP status code", example: 502 })
  public readonly statusCode!: number;

  private constructor(data: GatewayErrorDto) {
    this.error = data.error;
    this.message = data.message;
    this.statusCode = data.statusCode;
  }

  public static create(error: string, message: string, statusCode: number): GatewayErrorDto {
    return new GatewayErrorDto({ error, message, statusCode });
  }
}
