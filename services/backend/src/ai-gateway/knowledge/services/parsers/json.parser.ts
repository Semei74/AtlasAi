/* eslint-disable @typescript-eslint/require-await */
import type { ParsedDocument, ParsedHeading, ParsedSection, ParseOptions } from "../../interfaces/parser-result.interface.js";
import type { FormatParser } from "./format-parser.interface.js";
import { buildSections, computeStatistics, detectLanguage } from "./parse-text.util.js";

function valueToText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.map((v) => valueToText(v)).join("\n");
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return JSON.stringify(value);
}

export class JsonParser implements FormatParser {
  public readonly name = "json";
  public readonly version = "1.0.0";
  public readonly supportedMimeTypes: readonly string[] = ["application/json"];

  public async parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument> {
    const text = buffer.toString("utf-8").trim();
    const parsed = JSON.parse(text) as unknown;

    const pretty = JSON.stringify(parsed, null, 2);

    const headings: ParsedHeading[] = [];
    const sections: ParsedSection[] = [];

    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      const entries = Object.entries(parsed as Record<string, unknown>);
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry === undefined) {
          continue;
        }
        const [key, val] = entry;
        headings.push({ text: key, level: 1, position: pretty.indexOf(`"${key}"`) });
        sections.push({
          id: `sec-${String(i)}`,
          title: key,
          level: 1,
          text: valueToText(val),
          startIndex: pretty.indexOf(`"${key}"`),
          endIndex: pretty.length,
        });
      }
    } else if (Array.isArray(parsed)) {
      for (let i = 0; i < parsed.length; i++) {
        sections.push({
          id: `sec-${String(i)}`,
          title: `[${String(i)}]`,
          level: 1,
          text: valueToText(parsed[i]),
          startIndex: 0,
          endIndex: pretty.length,
        });
      }
    }

    const finalSections = sections.length === 0 ? buildSections(pretty, []) : sections;

    return {
      mimeType: "application/json",
      extractedText: pretty,
      language: options?.language ?? detectLanguage(pretty),
      pageCount: 1,
      sections: finalSections,
      headings,
      tables: [],
      statistics: computeStatistics({
        text: pretty,
        sectionCount: finalSections.length,
        headingCount: headings.length,
        tableCount: 0,
      }),
      parser: this.name,
      parserVersion: this.version,
    };
  }
}
