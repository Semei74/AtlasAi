import type { OcrResult } from "./ocr-result.interface.js";

export interface OcrOptions {
  readonly language?: string;
}

export const OCR_PROVIDER = Symbol("OCR_PROVIDER");

export interface OcrProvider {
  recognize(buffer: Buffer, options?: OcrOptions): Promise<OcrResult>;
  supports(mimeType: string): boolean;
}
