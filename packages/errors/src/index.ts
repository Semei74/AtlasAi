import { ERROR_CODES, HTTP_STATUS } from "@atlas/constants";

export interface ErrorContext {
  readonly code: string;
  readonly message: string;
  readonly httpStatus: number;
  readonly details: Record<string, unknown> | undefined;
  readonly cause: Error | undefined;
  readonly timestamp: Date;
  readonly retryable: boolean;
}

export abstract class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly details: Record<string, unknown> | undefined;
  public readonly timestamp: Date;
  public readonly retryable: boolean;

  public constructor(context: ErrorContext) {
    super(context.message);
    this.name = this.constructor.name;
    this.code = context.code;
    this.httpStatus = context.httpStatus;
    this.details = context.details;
    this.timestamp = context.timestamp;
    this.retryable = context.retryable;

    if (context.cause) {
      this.cause = context.cause;
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      httpStatus: this.httpStatus,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      retryable: this.retryable,
    };
  }
}

export class ValidationError extends AppError {
  public constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: ERROR_CODES.VALIDATION_ERROR,
      message,
      httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      details: details ?? undefined,
      cause: undefined,
      timestamp: new Date(),
      retryable: false,
    });
  }
}

export class NotFoundError extends AppError {
  public constructor(resource: string, id?: string) {
    super({
      code: ERROR_CODES.NOT_FOUND,
      message: `${resource}${id ? ` with id '${id}'` : ""} not found`,
      httpStatus: HTTP_STATUS.NOT_FOUND,
      details: undefined,
      cause: undefined,
      timestamp: new Date(),
      retryable: false,
    });
  }
}

export class UnauthorizedError extends AppError {
  public constructor(message = "Authentication required") {
    super({
      code: ERROR_CODES.UNAUTHORIZED,
      message,
      httpStatus: HTTP_STATUS.UNAUTHORIZED,
      details: undefined,
      cause: undefined,
      timestamp: new Date(),
      retryable: false,
    });
  }
}

export class ForbiddenError extends AppError {
  public constructor(message = "Access denied") {
    super({
      code: ERROR_CODES.FORBIDDEN,
      message,
      httpStatus: HTTP_STATUS.FORBIDDEN,
      details: undefined,
      cause: undefined,
      timestamp: new Date(),
      retryable: false,
    });
  }
}

export class ConflictError extends AppError {
  public constructor(message: string) {
    super({
      code: ERROR_CODES.CONFLICT,
      message,
      httpStatus: HTTP_STATUS.CONFLICT,
      details: undefined,
      cause: undefined,
      timestamp: new Date(),
      retryable: false,
    });
  }
}

export class InternalError extends AppError {
  public constructor(message = "Internal server error", cause?: Error) {
    super({
      code: ERROR_CODES.INTERNAL_ERROR,
      message,
      httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      details: undefined,
      cause: cause ?? undefined,
      timestamp: new Date(),
      retryable: true,
    });
  }
}

export class RateLimitError extends AppError {
  public constructor(message = "Too many requests") {
    super({
      code: ERROR_CODES.RATE_LIMITED,
      message,
      httpStatus: HTTP_STATUS.TOO_MANY_REQUESTS,
      details: undefined,
      cause: undefined,
      timestamp: new Date(),
      retryable: true,
    });
  }
}

export class AiProviderError extends AppError {
  public constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: ERROR_CODES.AI_PROVIDER_ERROR,
      message,
      httpStatus: HTTP_STATUS.SERVICE_UNAVAILABLE,
      details: details ?? undefined,
      cause: undefined,
      timestamp: new Date(),
      retryable: true,
    });
  }
}

export class ConfigurationError extends AppError {
  public constructor(message: string) {
    super({
      code: ERROR_CODES.CONFIGURATION_ERROR,
      message,
      httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      details: undefined,
      cause: undefined,
      timestamp: new Date(),
      retryable: false,
    });
  }
}
