import type { OCRResult, OCRBlock, OCRInterface as IOCRInterface } from './types';

export class OCRInterface implements IOCRInterface {
  private provider: 'none' | 'tesseract' | 'google-cloud-vision' | 'azure-vision' = 'none';
  private apiKey?: string;

  constructor(config?: { provider?: string; apiKey?: string }) {
    if (config?.provider) {
      this.provider = config.provider as any;
      this.apiKey = config.apiKey;
    }
  }

  async process(image: string | ArrayBuffer): Promise<OCRResult> {
    if (this.provider === 'none') {
      return {
        text: '[OCR not configured]',
        confidence: 0,
        blocks: [],
      };
    }

    if (this.provider === 'tesseract') {
      return this.processWithTesseract(image);
    }

    return {
      text: `[OCR via ${this.provider} - requires API integration]`,
      confidence: 0,
      blocks: [],
    };
  }

  async processBatch(images: (string | ArrayBuffer)[]): Promise<OCRResult[]> {
    return Promise.all(images.map((img) => this.process(img)));
  }

  isAvailable(): boolean {
    return this.provider !== 'none';
  }

  setProvider(provider: string, apiKey?: string): void {
    this.provider = provider as any;
    this.apiKey = apiKey;
  }

  private async processWithTesseract(image: string | ArrayBuffer): Promise<OCRResult> {
    try {
      const Tesseract = await import('tesseract.js');
      const dataUrl = typeof image === 'string' ? image : this.arrayBufferToDataUrl(image);
      const result = await Tesseract.recognize(dataUrl, 'eng+rus');

      const blocks: OCRBlock[] = result.data.blocks.map((block: any) => ({
        text: block.text,
        confidence: block.confidence,
        boundingBox: {
          x: block.bbox.x0,
          y: block.bbox.y0,
          width: block.bbox.x1 - block.bbox.x0,
          height: block.bbox.y1 - block.bbox.y0,
        },
      }));

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        blocks,
        language: result.data.languageCode,
      };
    } catch {
      return {
        text: '[Tesseract OCR failed]',
        confidence: 0,
        blocks: [],
      };
    }
  }

  private arrayBufferToDataUrl(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:image/png;base64,${btoa(binary)}`;
  }
}
