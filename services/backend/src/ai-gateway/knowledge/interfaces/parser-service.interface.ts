import type { ParsedMetadata } from "./parser-result.interface.js";

export const PARSER_SERVICE = Symbol("PARSER_SERVICE");

export interface ParserService {
  parseDocument(documentId: string, organizationId: string): Promise<ParseJobResult>;
  getParseResult(documentId: string, organizationId: string): Promise<ParseJobResult | null>;
}

export interface ParseJobResult {
  readonly documentId: string;
  readonly parseId: string;
  readonly status: string;
  readonly mimeType: string;
  readonly parser: string;
  readonly parserVersion: string;
  readonly extractedText: string | null;
  readonly language: string | null;
  readonly pageCount: number;
  readonly sectionCount: number;
  readonly headings: readonly { text: string; level: number; position: number }[];
  readonly tables: readonly { headers: readonly string[]; rows: readonly (readonly string[])[] }[];
  readonly sections: readonly {
    id: string;
    title: string | null;
    level: number | null;
    text: string;
    startIndex: number;
    endIndex: number;
  }[];
  readonly statistics: {
    characterCount: number;
    wordCount: number;
    lineCount: number;
    paragraphCount: number;
    sectionCount: number;
    headingCount: number;
    tableCount: number;
  };
  readonly processingTimeMs: number | null;
  readonly errorMessage: string | null;
  readonly metadata?: ParsedMetadata | undefined;
  readonly createdAt: string;
}
