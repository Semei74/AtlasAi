import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@atlas/errors";

interface ErrorResponse {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
  readonly timestamp: string;
  readonly path: string;
  readonly details?: Record<string, unknown>;
}

function getStatusCode(exception: unknown): number {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }
  if (exception instanceof AppError) {
    return exception.httpStatus;
  }
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

function getErrorMessage(exception: unknown): string {
  if (exception instanceof HttpException) {
    return exception.message;
  }
  if (exception instanceof AppError) {
    return exception.message;
  }
  return "Internal Server Error";
}

function getErrorCode(exception: unknown): string {
  if (exception instanceof AppError) {
    return exception.code;
  }
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const statusMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: "BAD_REQUEST",
      [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
      [HttpStatus.FORBIDDEN]: "FORBIDDEN",
      [HttpStatus.NOT_FOUND]: "NOT_FOUND",
      [HttpStatus.CONFLICT]: "CONFLICT",
      [HttpStatus.TOO_MANY_REQUESTS]: "RATE_LIMITED",
    };
    return statusMap[status] ?? "HTTP_ERROR";
  }
  return "INTERNAL_ERROR";
}

function getDetails(exception: unknown): Record<string, unknown> | undefined {
  if (exception instanceof AppError) {
    return exception.details;
  }
  return undefined;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  public catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof Error) {
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const statusCode = getStatusCode(exception);
    const statusMessage = getErrorMessage(exception);
    const code = getErrorCode(exception);
    const details = getDetails(exception);
    const timestamp = new Date().toISOString();

    const body: ErrorResponse & { details?: Record<string, unknown> } = {
      statusCode,
      code,
      message: statusMessage,
      timestamp,
      path: request.url,
    };

    if (details !== undefined) {
      body.details = details;
    }

    void response.status(statusCode).send(body);
  }
}
