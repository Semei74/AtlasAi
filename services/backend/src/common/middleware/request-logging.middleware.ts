import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import type { FastifyRequest, FastifyReply } from "fastify";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  public use(req: FastifyRequest["raw"], res: FastifyReply["raw"], next: () => void): void {
    const method = req.method ?? "UNKNOWN";
    const url = req.url ?? "/";
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const statusCode = String(res.statusCode);
      this.logger.log(`${method} ${url} ${statusCode} ${String(duration)}ms`);
    });

    next();
  }
}
