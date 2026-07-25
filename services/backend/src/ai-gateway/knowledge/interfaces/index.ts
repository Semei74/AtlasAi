export { FILE_STORAGE } from "./file-storage.interface.js";
export type { FileUpload, FileUploadResult, FileStorage } from "./file-storage.interface.js";
export { DOCUMENT_SERVICE } from "./document-service.interface.js";
export type {
  DocumentFilter,
  PaginatedDocuments,
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentService,
  DocumentSortField,
  SortOrder,
} from "./document-service.interface.js";
export { METADATA_SERVICE } from "./metadata-service.interface.js";
export type { MetadataService } from "./metadata-service.interface.js";
export type {
  DocumentMetadata,
  AutoMetadata,
  MetadataHistoryEntry,
  MetadataValidationResult,
} from "./document-metadata.interface.js";
export {
  RESERVED_METADATA_KEYS,
  METADATA_KEY_PATTERN,
  MAX_METADATA_BYTES,
} from "./document-metadata.interface.js";
export { OCR_PROVIDER } from "./ocr-provider.interface.js";
export type { OcrProvider, OcrOptions } from "./ocr-provider.interface.js";
export { OCR_SERVICE } from "./ocr-service.interface.js";
export type { OcrService } from "./ocr-service.interface.js";
export type { OcrResult, OcrPageResult, OcrJobResult } from "./ocr-result.interface.js";
export { SUPPORTED_OCR_MIME_TYPES } from "./ocr-result.interface.js";
export { PARSER_PROVIDER } from "./parser-provider.interface.js";
export type { ParserProvider, ParseOptions } from "./parser-provider.interface.js";
export { PARSER_SERVICE } from "./parser-service.interface.js";
export type { ParserService } from "./parser-service.interface.js";
export type {
  ParsedDocument,
  ParsedSection,
  ParsedHeading,
  ParsedTable,
  ParseStatistics,
} from "./parser-result.interface.js";
export { SUPPORTED_PARSE_MIME_TYPES } from "./parser-result.interface.js";
