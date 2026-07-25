import { ExceptionFilter, Catch, ArgumentsHost, Logger } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ConflictError, NotFoundError, AppError } from "@atlas/errors";
import { Prisma } from "../../generated/prisma/client.js";

const PRISMA_ERROR_MAP: Record<string, (meta?: unknown) => AppError | Error> = {
  P2002(meta?: unknown): AppError {
    const fields = (meta as { target?: string[] } | undefined)?.target?.join(", ") ?? "unknown";
    return new ConflictError(`Resource with the same value already exists (${fields})`);
  },
  P2025(meta?: unknown): AppError {
    const cause = (meta as { cause?: string } | undefined)?.cause ?? "Record not found";
    return new NotFoundError("Resource", cause);
  },
  P1001(): Error {
    return new Error("Database connection unavailable");
  },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  public catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const mapper = PRISMA_ERROR_MAP[exception.code];
    if (mapper !== undefined) {
      const domainError = mapper(exception.meta);

      this.logger.warn(`Prisma ${exception.code}: ${domainError.message}`, {
        path: request.url,
        prismaCode: exception.code,
        modelName: (exception.meta as { modelName?: string } | undefined)?.modelName,
      });

      const body = {
        statusCode: domainError instanceof AppError ? domainError.httpStatus : 503,
        code: domainError instanceof AppError ? domainError.code : "SERVICE_UNAVAILABLE",
        message: domainError instanceof AppError ? domainError.message : "Service temporarily unavailable",
        timestamp: new Date().toISOString(),
        path: request.url,
      };
      void response.status(body.statusCode).send(body);
      return;
    }

    this.logger.warn(`Unmapped Prisma error code: ${exception.code}`, {
      path: request.url,
      prismaCode: exception.code,
    });

    throw exception;
  }
}
