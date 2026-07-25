import { Module, type Provider } from "@nestjs/common";
import { FILE_STORAGE } from "./interfaces/file-storage.interface.js";
import { DOCUMENT_SERVICE } from "./interfaces/document-service.interface.js";
import { METADATA_SERVICE } from "./interfaces/metadata-service.interface.js";
import { OCR_PROVIDER } from "./interfaces/ocr-provider.interface.js";
import { OCR_SERVICE } from "./interfaces/ocr-service.interface.js";
import { PARSER_PROVIDER } from "./interfaces/parser-provider.interface.js";
import { PARSER_SERVICE } from "./interfaces/parser-service.interface.js";
import { LocalFileStorageService } from "./services/local-file-storage.service.js";
import { S3FileStorageService, S3_STORAGE_CONFIG } from "./services/s3-file-storage.service.js";
import type { S3StorageConfig } from "./services/s3-file-storage.service.js";
import { DocumentService } from "./services/document.service.js";
import { MetadataService } from "./services/metadata.service.js";
import { OcrService } from "./services/ocr.service.js";
import { TesseractOcrProvider } from "./services/tesseract-ocr-provider.service.js";
import { DefaultParserProvider } from "./services/parser-provider.service.js";
import { ParserService } from "./services/parser.service.js";
import { DocumentController } from "./controllers/document.controller.js";
import { MetadataController } from "./controllers/metadata.controller.js";
import { OcrController } from "./controllers/ocr.controller.js";
import { ParserController } from "./controllers/parser.controller.js";

interface StorageProviderResult {
  providers: Provider[];
}

function storageProviderFactory(): StorageProviderResult {
  const storageType = process.env["KNOWLEDGE_STORAGE_TYPE"] ?? "local";

  switch (storageType) {
    case "s3":
    case "minio": {
      const cfg = {
        region: process.env["KNOWLEDGE_S3_REGION"] ?? "us-east-1",
        bucket: process.env["KNOWLEDGE_S3_BUCKET"] ?? "knowledge",
        ...(process.env["KNOWLEDGE_S3_ACCESS_KEY_ID"] !== undefined ? { accessKeyId: process.env["KNOWLEDGE_S3_ACCESS_KEY_ID"] } : {}),
        ...(process.env["KNOWLEDGE_S3_SECRET_ACCESS_KEY"] !== undefined ? { secretAccessKey: process.env["KNOWLEDGE_S3_SECRET_ACCESS_KEY"] } : {}),
        ...(process.env["KNOWLEDGE_S3_ENDPOINT"] !== undefined ? { endpoint: process.env["KNOWLEDGE_S3_ENDPOINT"] } : {}),
        ...(process.env["KNOWLEDGE_S3_FORCE_PATH_STYLE"] !== undefined ? { forcePathStyle: process.env["KNOWLEDGE_S3_FORCE_PATH_STYLE"] === "true" } : {}),
        ...(process.env["KNOWLEDGE_S3_SSE_ALGORITHM"] !== undefined ? { sseAlgorithm: process.env["KNOWLEDGE_S3_SSE_ALGORITHM"] } : {}),
        ...(process.env["KNOWLEDGE_S3_SSE_KMS_KEY_ID"] !== undefined ? { sseKmsKeyId: process.env["KNOWLEDGE_S3_SSE_KMS_KEY_ID"] } : {}),
      };

      return {
        providers: [
          { provide: S3_STORAGE_CONFIG, useValue: cfg as S3StorageConfig },
          { provide: FILE_STORAGE, useClass: S3FileStorageService },
        ],
      };
    }
    default:
      return {
        providers: [
          { provide: FILE_STORAGE, useClass: LocalFileStorageService },
        ],
      };
  }
}

@Module({
  controllers: [DocumentController, MetadataController, OcrController, ParserController],
  providers: [
    ...storageProviderFactory().providers,
    { provide: DOCUMENT_SERVICE, useClass: DocumentService },
    { provide: METADATA_SERVICE, useClass: MetadataService },
    { provide: OCR_PROVIDER, useClass: TesseractOcrProvider },
    { provide: OCR_SERVICE, useClass: OcrService },
    { provide: PARSER_PROVIDER, useClass: DefaultParserProvider },
    { provide: PARSER_SERVICE, useClass: ParserService },
  ],
  exports: [FILE_STORAGE, DOCUMENT_SERVICE, METADATA_SERVICE, OCR_SERVICE, OCR_PROVIDER, PARSER_SERVICE, PARSER_PROVIDER],
})
export class KnowledgeModule {}
