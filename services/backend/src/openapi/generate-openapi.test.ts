import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "../app.module.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { RedisService } from "../redis/redis.service.js";

const PROJECT_ROOT = resolve(import.meta.dirname, "../..");

describe("OpenAPI Generation", () => {
  it("should generate OpenAPI spec without circular dependency errors", async () => {
    const mockPrisma = { $queryRaw: async () => [{}] } as unknown as PrismaService;
    const mockRedis = { ping: async () => "PONG" } as unknown as RedisService;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(RedisService)
      .useValue(mockRedis)
      .compile();

    const app = moduleRef.createNestApplication(new FastifyAdapter({ logger: false }));
    await app.init();

    const config = new DocumentBuilder()
      .setTitle("Atlas AI API")
      .setDescription("Enterprise AI Platform API")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    const openapiJson = resolve(PROJECT_ROOT, "openapi.json");
    writeFileSync(openapiJson, JSON.stringify(document, null, 2), "utf-8");

    const pathCount = Object.keys(document.paths).length;
    const schemaCount = Object.keys(document.components?.schemas ?? {}).length;
    expect(pathCount).toBeGreaterThan(0);
    expect(schemaCount).toBeGreaterThan(0);

    // Validate no spec-level errors
    expect(document.openapi).toBeDefined();
    expect(document.info.title).toBe("Atlas AI API");

    await app.close();
  });
});
