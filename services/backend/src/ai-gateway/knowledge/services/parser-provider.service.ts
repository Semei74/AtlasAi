import { Injectable } from "@nestjs/common";
import { ValidationError } from "@atlas/errors";
import type { ParsedDocument, ParseOptions } from "../interfaces/parser-result.interface.js";
import type { ParserProvider } from "../interfaces/parser-provider.interface.js";
import type { FormatParser } from "./parsers/format-parser.interface.js";
import { TxtParser } from "./parsers/txt.parser.js";
import { MarkdownParser } from "./parsers/markdown.parser.js";
import { HtmlParser } from "./parsers/html.parser.js";
import { DocxParser } from "./parsers/docx.parser.js";
import { PdfParser } from "./parsers/pdf.parser.js";
import { CsvParser } from "./parsers/csv.parser.js";
import { JsonParser } from "./parsers/json.parser.js";
import { XmlParser } from "./parsers/xml.parser.js";
import { EpubParser } from "./parsers/epub.parser.js";
import { PptxParser } from "./parsers/pptx.parser.js";

@Injectable()
export class DefaultParserProvider implements ParserProvider {
  private readonly mimeMap = new Map<string, FormatParser>();

  public constructor() {
    const parsers: readonly FormatParser[] = [
      new TxtParser(),
      new MarkdownParser(),
      new HtmlParser(),
      new DocxParser(),
      new PdfParser(),
      new CsvParser(),
      new JsonParser(),
      new XmlParser(),
      new EpubParser(),
      new PptxParser(),
    ];

    for (const parser of parsers) {
      for (const mimeType of parser.supportedMimeTypes) {
        this.mimeMap.set(mimeType, parser);
      }
    }
  }

  public supports(mimeType: string): boolean {
    return this.mimeMap.has(mimeType);
  }

  public async parse(buffer: Buffer, mimeType: string, options?: ParseOptions): Promise<ParsedDocument> {
    const parser = this.mimeMap.get(mimeType);
    if (parser === undefined) {
      throw new ValidationError(`Unsupported MIME type for parsing: ${mimeType}`);
    }

    const result = await parser.parse(buffer, options);
    return { ...result, mimeType };
  }
}

export const PARSER_PROVIDER_IMPL = DefaultParserProvider;
