/* eslint-disable @typescript-eslint/no-unnecessary-condition -- tesseract.js types mark these as non-optional but runtime may differ */
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { createWorker } from "tesseract.js";
import type { Worker } from "tesseract.js";
import type { OcrProvider, OcrOptions } from "../interfaces/ocr-provider.interface.js";
import type { OcrResult, OcrPageResult } from "../interfaces/ocr-result.interface.js";
import { SUPPORTED_OCR_MIME_TYPES } from "../interfaces/ocr-result.interface.js";

const DEFAULT_LANGUAGE = "eng";

@Injectable()
export class TesseractOcrProvider implements OcrProvider, OnModuleDestroy {
  #worker: Worker | null = null;
  #workerLanguage: string | null = null;

  public supports(mimeType: string): boolean {
    return SUPPORTED_OCR_MIME_TYPES.includes(mimeType);
  }

  public async recognize(buffer: Buffer, options?: OcrOptions): Promise<OcrResult> {
    const startTime = Date.now();
    const language = options?.language ?? DEFAULT_LANGUAGE;

    const worker = await this.#getWorker(language);

    const { data } = await worker.recognize(buffer);

    const processingTimeMs = Date.now() - startTime;

    const pages: OcrPageResult[] = (data.blocks ?? []).map((block, index) => ({
      pageNumber: index + 1,
      text: block.text ?? "",
      confidence: block.confidence ?? 0,
    }));

    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        text: data.text ?? "",
        confidence: data.confidence ?? 0,
      });
    }

    return {
      text: data.text ?? "",
      confidence: data.confidence ?? 0,
      detectedLanguage: data.version !== undefined ? language : null,
      pages,
      processingTimeMs,
    };
  }

  async #getWorker(language: string): Promise<Worker> {
    if (this.#worker !== null && this.#workerLanguage === language) {
      return this.#worker;
    }

    if (this.#worker !== null) {
      await this.#worker.terminate();
      this.#worker = null;
    }

    this.#worker = await createWorker(language);
    this.#workerLanguage = language;
    return this.#worker;
  }

  public async onModuleDestroy(): Promise<void> {
    if (this.#worker !== null) {
      await this.#worker.terminate();
      this.#worker = null;
      this.#workerLanguage = null;
    }
  }
}
