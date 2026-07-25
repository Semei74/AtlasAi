import { Injectable, NestMiddleware, Inject } from "@nestjs/common";
import type { FastifyRequest, FastifyReply } from "fastify";
import { CORRELATION_ID_SERVICE } from "../interfaces/correlation-id.interface.js";
import type { CorrelationIdService } from "../interfaces/correlation-id.interface.js";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  public constructor(
    @Inject(CORRELATION_ID_SERVICE) private readonly correlationIdService: CorrelationIdService,
  ) {}

  public use(req: FastifyRequest, res: FastifyReply, next: () => void): void {
    const headerValue = req.headers[this.correlationIdService.config.headerName] as string | undefined;
    const correlationId = headerValue ?? this.correlationIdService.generate();

    this.correlationIdService.set(correlationId);

    if (this.correlationIdService.config.injectInResponse) {
      void res.header(this.correlationIdService.config.responseHeaderName, correlationId);
    }

    next();
  }
}
