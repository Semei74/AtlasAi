export class GatewayErrorDto {
  public readonly error: string;
  public readonly message: string;
  public readonly statusCode: number;

  private constructor(data: GatewayErrorDto) {
    this.error = data.error;
    this.message = data.message;
    this.statusCode = data.statusCode;
  }

  public static create(error: string, message: string, statusCode: number): GatewayErrorDto {
    return new GatewayErrorDto({ error, message, statusCode });
  }
}
