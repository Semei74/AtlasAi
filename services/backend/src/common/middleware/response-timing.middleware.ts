import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import type { FastifyReply } from "fastify";

export function registerResponseTiming(app: NestFastifyApplication): void {
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  instance.addHook("onRequest", (_request: unknown, reply: FastifyReply, done: () => void) => {
    const start = Date.now();

    reply.then(
      () => {
        const duration = Date.now() - start;
        reply.header("X-Response-Time", `${String(duration)}ms`);
      },
      /* eslint-disable-next-line @typescript-eslint/no-empty-function */
      () => {},
    );

    done();
  });
}
