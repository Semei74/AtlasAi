import { describe, it, afterAll } from "vitest";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import compression from "@fastify/compress";
import fastifyMultipart from "@fastify/multipart";
import { AppModule } from "./app.module.js";
import { PrismaService } from "./prisma/prisma.service.js";
import { RedisService } from "./redis/redis.service.js";

const mockPrisma = { $queryRaw: async () => [{}] } as never;
const mockRedis = { ping: async () => "PONG" } as never;

describe("Bootstrap", () => {
  let app: NestFastifyApplication;

  async function buildApp(): Promise<NestFastifyApplication> {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(RedisService)
      .useValue(mockRedis)
      .compile();

    return moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter({ logger: false }));
  }

  afterAll(async () => {
    await app.close();
  });

  it("should create application without throwing", async () => {
    app = await buildApp();
    await app.register(compression);
    await app.register(fastifyMultipart, {
      limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 20 },
      throwFileSizeLimit: true,
    });
    await app.init();
  });

  it("should enable shutdown hooks without error", async () => {
    app = await buildApp();
    app.enableShutdownHooks();
    await app.init();
  });
});
