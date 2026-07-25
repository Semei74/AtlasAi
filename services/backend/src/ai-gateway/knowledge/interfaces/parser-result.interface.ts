export interface ParsedTable {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

export interface ParsedHeading {
  readonly text: string;
  readonly level: number;
  readonly position: number;
}

export interface ParsedSection {
  readonly id: string;
  readonly title: string | null;
  readonly level: number | null;
  readonly text: string;
  readonly startIndex: number;
  readonly endIndex: number;
}

export interface ParseStatistics {
  readonly characterCount: number;
  readonly wordCount: number;
  readonly lineCount: number;
  readonly paragraphCount: number;
  readonly sectionCount: number;
  readonly headingCount: number;
  readonly tableCount: number;
}

export interface ParsedMetadata {
  title?: string;
  creator?: string;
  author?: string;
  publisher?: string;
  language?: string;
}

export interface ParsedDocument {
  readonly mimeType: string;
  readonly extractedText: string;
  readonly language: string | null;
  readonly pageCount: number;
  readonly sections: readonly ParsedSection[];
  readonly headings: readonly ParsedHeading[];
  readonly tables: readonly ParsedTable[];
  readonly statistics: ParseStatistics;
  readonly parser: string;
  readonly parserVersion: string;
  readonly metadata?: ParsedMetadata;
}

export interface ParseOptions {
  readonly language?: string;
  readonly extractTables?: boolean;
}

export const SUPPORTED_PARSE_MIME_TYPES: readonly string[] = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/xml",
  "application/xml",
  "application/json",
  "text/html",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/epub+zip",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
