import "reflect-metadata";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "../src/app.module.js";
import { PrismaService } from "../src/prisma/prisma.service.js";
import { RedisService } from "../src/redis/redis.service.js";
import { PrismaModule } from "../src/prisma/prisma.module.js";
import { RedisModule } from "../src/redis/redis.module.js";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");

class MockPrismaService {
  public $queryRaw = async () => [{}];
  public project = { findMany: async () => [], count: async () => 0, findUnique: async () => null, create: async () => ({}), update: async () => ({}) };
  public activityLog = { findMany: async () => [], create: async () => ({}) };
  public workspace = { count: async () => 0 };
  public membership = { count: async () => 0 };
  public user = { findMany: async () => [], findUnique: async () => null, count: async () => 0 };
  public organization = { count: async () => 0 };
}

class MockRedisService {
  public ping = async () => "PONG";
}

const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(PrismaService)
  .useValue(new MockPrismaService() as unknown as PrismaService)
  .overrideProvider(RedisService)
  .useValue(new MockRedisService() as unknown as RedisService)
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

console.log(`OpenAPI spec written to ${openapiJson}`);
console.log(`Paths: ${Object.keys(document.paths).length}, Schemas: ${Object.keys(document.components?.schemas ?? {}).length}`);

await app.close();
