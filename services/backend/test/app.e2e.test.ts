import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import compression from "@fastify/compress";
import fastifyMultipart from "@fastify/multipart";
import { AppModule } from "../src/app.module.js";
import { setupOpenapi } from "../src/openapi/setup.js";

interface HealthResponse {
  readonly status: string;
  readonly uptime: number;
}

interface ReadinessResponse extends HealthResponse {
  readonly dependencies: Record<string, unknown>;
}

interface LivenessResponse extends HealthResponse {
  readonly memory: Record<string, unknown>;
}

describe("App (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({ logger: false }),
    );
    await app.register(compression);
    await app.register(fastifyMultipart, {
      limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 20 },
      throwFileSizeLimit: true,
    });
    setupOpenapi(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /health", () => {
    it("should return 200 with ok status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body) as HealthResponse;
      expect(body.status).toBe("ok");
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("GET /ready", () => {
    it("should return 200 with readiness info", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/ready",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body) as ReadinessResponse;
      expect(body.status).toBe("ok");
      expect(body.dependencies).toBeDefined();
    });
  });

  describe("GET /live", () => {
    it("should return 200 with liveness info", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/live",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body) as LivenessResponse;
      expect(body.status).toBe("ok");
      expect(body.memory).toBeDefined();
    });
  });

  describe("GET /docs", () => {
    it("should return Swagger UI page", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/docs",
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("OpenAPI spec", () => {
    it("should return valid JSON spec with required fields", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/docs-json",
      });

      expect(response.statusCode).toBe(200);
      const spec = JSON.parse(response.body) as Record<string, unknown>;

      expect(spec).toHaveProperty("openapi");
      expect(spec).toHaveProperty("info");
      expect(spec).toHaveProperty("paths");
      expect(spec).toHaveProperty("components");
      expect((spec["info"] as Record<string, unknown>).title).toBe("Atlas AI API");
      expect((spec["info"] as Record<string, unknown>).version).toBe("1.0.0");
    });
  });

  describe("GET /metrics", () => {
    it("should return Prometheus metrics", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      expect(response.statusCode).toBe(200);
      const body = response.body;
      expect(body).toContain("atlas_");
    });
  });
});
