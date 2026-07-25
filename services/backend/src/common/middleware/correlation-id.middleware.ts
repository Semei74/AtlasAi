import { Injectable, NestMiddleware } from "@nestjs/common";
import type { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "node:crypto";

const CORRELATION_ID_HEADER = "x-correlation-id";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  public use(req: FastifyRequest["raw"], res: FastifyReply["raw"], next: () => void): void {
    const existingId = req.headers[CORRELATION_ID_HEADER];
    const correlationId = typeof existingId === "string" ? existingId : randomUUID();

    req.headers[CORRELATION_ID_HEADER] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  }
}
