export interface OcrPageResult {
  readonly pageNumber: number;
  readonly text: string;
  readonly confidence: number;
}

export interface OcrResult {
  readonly text: string;
  readonly confidence: number;
  readonly detectedLanguage: string | null;
  readonly pages: readonly OcrPageResult[];
  readonly processingTimeMs: number;
}

export interface OcrJobResult {
  readonly documentId: string;
  readonly ocrId: string;
  readonly status: string;
  readonly extractedText: string | null;
  readonly confidence: number | null;
  readonly detectedLanguage: string | null;
  readonly pages: number;
  readonly processingTimeMs: number | null;
  readonly errorMessage: string | null;
  readonly createdAt: string;
}

export const SUPPORTED_OCR_MIME_TYPES: readonly string[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/tiff",
  "image/bmp",
];
