import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

const OPENAPI_PATH = "api-docs";
const OPENAPI_TITLE = "Atlas AI API";
const OPENAPI_DESCRIPTION = "Enterprise AI Platform API";
const OPENAPI_VERSION = "1.0.0";

export function setupOpenapi(app: NestFastifyApplication): void {
  const isProduction = process.env["APP_ENV"] === "production";

  const config = new DocumentBuilder()
    .setTitle(OPENAPI_TITLE)
    .setDescription(OPENAPI_DESCRIPTION)
    .setVersion(OPENAPI_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (!isProduction) {
    SwaggerModule.setup(OPENAPI_PATH, app, document);
  }
}
