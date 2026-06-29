import { describe, it, expect } from "vitest";
import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import compression from "@fastify/compress";
import { AppModule } from "./app.module.js";

describe("Bootstrap", () => {
  it("should create application without throwing", async () => {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({ logger: false }),
    );

    await app.register(compression);
    await app.init();
    await app.close();
  });

  it("should return health endpoint after init", async () => {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({ logger: false }),
    );

    await app.init();

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);

    await app.close();
  });

  it("should enable shutdown hooks without error", async () => {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({ logger: false }),
    );

    app.enableShutdownHooks();
    await app.init();
    await app.close();
  });
});
