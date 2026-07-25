import type { ParsedDocument, ParseOptions } from "./parser-result.interface.js";

export type { ParseOptions } from "./parser-result.interface.js";

export const PARSER_PROVIDER = Symbol("PARSER_PROVIDER");

export interface ParserProvider {
  parse(buffer: Buffer, mimeType: string, options?: ParseOptions): Promise<ParsedDocument>;
  supports(mimeType: string): boolean;
}
