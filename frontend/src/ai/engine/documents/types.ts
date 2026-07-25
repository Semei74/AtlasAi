export type DocumentFormat = 'pdf' | 'docx' | 'pptx' | 'txt' | 'markdown' | 'html' | 'csv' | 'json';

export type DocumentProcessingStage = 'pending' | 'parsing' | 'ocr' | 'chunking' | 'embedding' | 'complete' | 'error';

export interface DocumentParseResult {
  text: string;
  metadata: ParsedMetadata;
  sections: DocumentSection[];
  images?: string[];
  tables?: string[][][];
}

export interface ParsedMetadata {
  title?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  format: DocumentFormat;
  size: number;
}

export interface DocumentSection {
  id: string;
  heading: string;
  level: number;
  content: string;
  page?: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: OCRBlock[];
  language?: string;
}

export interface OCRBlock {
  text: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  page?: number;
}

export interface DocumentProcessingResult {
  id: string;
  documentId: string;
  format: DocumentFormat;
  parseResult: DocumentParseResult;
  ocrResult?: OCRResult;
  chunks: { id: string; content: string; tokens: number }[];
  metadata: ParsedMetadata;
  processedAt: string;
  processingTime: number;
}

export interface DocumentParser {
  canParse(format: DocumentFormat): boolean;
  parse(content: string | ArrayBuffer, format: DocumentFormat): Promise<DocumentParseResult>;
}

export interface OCRInterface {
  process(image: string | ArrayBuffer): Promise<OCRResult>;
  processBatch(images: (string | ArrayBuffer)[]): Promise<OCRResult[]>;
  isAvailable(): boolean;
}

export interface MetadataExtractor {
  extract(content: string | ArrayBuffer, format: DocumentFormat): Promise<ParsedMetadata>;
}
