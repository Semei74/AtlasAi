import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import compression from "@fastify/compress";
import cors from "@fastify/cors";
import { AppModule } from "./app.module.js";
import { setupOpenapi } from "./openapi/setup.js";
import { registerResponseTiming } from "./common/middleware/response-timing.middleware.js";
import { CONFIG_LOADER } from "./config/config.module.js";
import type { ConfigLoader } from "@atlas/config";
import type { ConfigSchema } from "@atlas/config";
import { rootLogger } from "@atlas/logger";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
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
  await app.register(cors, {
    origin: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-Id"],
    credentials: true,
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
