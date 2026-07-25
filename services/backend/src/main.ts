import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import compression from "@fastify/compress";
import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyCookie from "@fastify/cookie";
import { AppModule } from "./app.module.js";
import { setupOpenapi } from "./openapi/setup.js";
import { registerResponseTiming } from "./common/middleware/response-timing.middleware.js";
import { CONFIG_LOADER } from "./config/config.module.js";
import type { ConfigLoader } from "@atlas/config";
import type { ConfigSchema } from "@atlas/config";
import { rootLogger } from "@atlas/logger";
import { ConfigurationError } from "@atlas/errors";
import { validateSecrets } from "./config/validate-secrets.js";

async function bootstrap(): Promise<void> {
  const isProduction = process.env["APP_ENV"] === "production";
  if (isProduction) {
    validateSecrets();
  }
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      trustProxy: true,
    }),
    { forceCloseConnections: true },
  );

  app.enableShutdownHooks();

  process.on("SIGTERM", () => {
    rootLogger.info("Received SIGTERM signal, shutting down gracefully");
    void app.close().finally(() => process.exit(0));
  });

  process.on("SIGINT", () => {
    rootLogger.info("Received SIGINT signal, shutting down gracefully");
    void app.close().finally(() => process.exit(0));
  });

  const configLoader = app.get<ConfigLoader>(CONFIG_LOADER);
  const config = configLoader.load({
    PORT: { type: "number", default: 3000 },
    HOST: { type: "string", default: "0.0.0.0" },
  } satisfies ConfigSchema);

  const port = config["PORT"] as number;
  const host = config["HOST"] as string;

  await app.register(compression);
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024,
      files: 1,
      fields: 20,
    },
    throwFileSizeLimit: true,
  });
  const corsOrigin = process.env["CORS_ORIGIN"] ?? "http://localhost:3000";

  if (corsOrigin === "*") {
    throw new ConfigurationError("Wildcard CORS origin is not allowed in production");
  }

  await app.register(cors, {
    origin: corsOrigin.split(",").map((o) => o.trim()),
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-Id"],
    credentials: true,
  });

  const cookieSecret = process.env["COOKIE_SECRET"] ?? process.env["JWT_SECRET"] ?? "";

  await app.register(fastifyCookie, {
    secret: cookieSecret,
  });

  setupOpenapi(app);
  registerResponseTiming(app);

  await app.listen(port, host);

  rootLogger.info("Application started", {
    port: String(port),
    host,
  });
}

void bootstrap().catch((error: unknown) => {
  rootLogger.error(
    "Failed to start application",
    error instanceof Error ? error : new Error(String(error)),
  );
  process.exit(1);
});
