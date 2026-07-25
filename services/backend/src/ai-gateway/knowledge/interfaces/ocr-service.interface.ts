import type { OcrJobResult } from "./ocr-result.interface.js";

export const OCR_SERVICE = Symbol("OCR_SERVICE");

export interface OcrService {
  processDocument(documentId: string, organizationId: string): Promise<OcrJobResult>;
  getOcrResult(documentId: string, organizationId: string): Promise<OcrJobResult | null>;
}
