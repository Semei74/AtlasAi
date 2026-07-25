import type { ParsedDocument, ParseOptions } from "../../interfaces/parser-result.interface.js";

export interface FormatParser {
  readonly name: string;
  readonly version: string;
  readonly supportedMimeTypes: readonly string[];
  parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument>;
}
