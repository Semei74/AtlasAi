import type {
  DocumentFormat,
  DocumentProcessingStage,
  DocumentParseResult,
  DocumentProcessingResult,
  DocumentParser,
  OCRInterface,
  ParsedMetadata,
} from './types';

export class DocumentPipeline {
  private parsers: Map<DocumentFormat, DocumentParser> = new Map();
  private ocrProvider: OCRInterface | null = null;
  private stage: DocumentProcessingStage = 'pending';

  registerParser(format: DocumentFormat, parser: DocumentParser): void {
    this.parsers.set(format, parser);
  }

  registerOCR(ocr: OCRInterface): void {
    this.ocrProvider = ocr;
  }

  getStage(): DocumentProcessingStage {
    return this.stage;
  }

  async process(
    content: string | ArrayBuffer,
    documentId: string,
    format: DocumentFormat,
  ): Promise<DocumentProcessingResult> {
    const start = Date.now();

    this.stage = 'parsing';
    const parseResult = await this.parse(content, format);

    let ocrResult = undefined;
    if (format === 'pdf' && this.ocrProvider && parseResult.images?.length) {
      this.stage = 'ocr';
      ocrResult = await this.ocrProvider.processBatch(parseResult.images).then((results) => results[0]);
    }

    const text = ocrResult ? parseResult.text + '\n' + ocrResult.text : parseResult.text;
    const chunks = this.chunkText(text, documentId);
    const metadata = this.extractMetadata(content, format);

    this.stage = 'complete';

    return {
      id: `proc_${documentId}_${Date.now()}`,
      documentId,
      format,
      parseResult,
      ocrResult,
      chunks,
      metadata,
      processedAt: new Date().toISOString(),
      processingTime: Date.now() - start,
    };
  }

  private async parse(content: string | ArrayBuffer, format: DocumentFormat): Promise<DocumentParseResult> {
    const parser = this.parsers.get(format);
    if (parser) {
      return parser.parse(content, format);
    }

    const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
    return {
      text,
      metadata: {
        wordCount: text.split(/\s+/).filter(Boolean).length,
        size: typeof content === 'string' ? content.length : content.byteLength,
        format,
      },
      sections: [],
    };
  }

  private chunkText(text: string, documentId: string): { id: string; content: string; tokens: number }[] {
    const maxChunkSize = 2000;
    const chunks: { id: string; content: string; tokens: number }[] = [];
    const paragraphs = text.split(/\n\n+/);
    let current = '';
    let chunkIndex = 0;

    for (const para of paragraphs) {
      if ((current + para).length > maxChunkSize && current) {
        chunks.push({
          id: `${documentId}_chunk_${chunkIndex}`,
          content: current.trim(),
          tokens: Math.ceil(current.length / 4),
        });
        chunkIndex++;
        current = '';
      }
      current += (current ? '\n\n' : '') + para;
    }

    if (current) {
      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        content: current.trim(),
        tokens: Math.ceil(current.length / 4),
      });
    }

    return chunks;
  }

  private extractMetadata(content: string | ArrayBuffer, format: DocumentFormat): ParsedMetadata {
    const text = typeof content === 'string' ? content : '';
    return {
      wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0,
      format,
      size: typeof content === 'string' ? content.length : content.byteLength,
      language: this.detectLanguage(text),
    };
  }

  private detectLanguage(text: string): string | undefined {
    if (!text) return undefined;
    const cyrillic = text.match(/[а-яА-Я]/g);
    const latin = text.match(/[a-zA-Z]/g);
    if (cyrillic && latin) return 'mixed';
    if (cyrillic) return 'ru';
    return 'en';
  }

  reset(): void {
    this.stage = 'pending';
  }
}
