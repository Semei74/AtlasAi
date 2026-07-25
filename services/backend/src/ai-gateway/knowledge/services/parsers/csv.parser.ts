/* eslint-disable @typescript-eslint/require-await */
import type { ParsedDocument, ParsedHeading, ParsedSection, ParsedTable, ParseOptions } from "../../interfaces/parser-result.interface.js";
import type { FormatParser } from "./format-parser.interface.js";
import { buildSections, computeStatistics, detectLanguage } from "./parse-text.util.js";

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char ?? "";
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char ?? "";
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export class CsvParser implements FormatParser {
  public readonly name = "csv";
  public readonly version = "1.0.0";
  public readonly supportedMimeTypes = ["text/csv"] as const;

  public async parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument> {
    const text = buffer.toString("utf-8").replace(/\r\n/g, "\n").trim();
    const rows = parseCsvRows(text);

    const headers = rows.length > 0 ? (rows[0] ?? []) : [];
    const dataRows = rows.slice(1);
    const tables: ParsedTable[] = [{ headers, rows: dataRows }];

    const rebuilt = rows.map((r) => r.join(", ")).join("\n");

    const sections: readonly ParsedSection[] =
      dataRows.length === 0
        ? buildSections(rebuilt, [])
        : dataRows.map((r, index) => ({
            id: `sec-${String(index)}`,
            title: r[0] ?? null,
            level: null,
            text: r.join(", "),
            startIndex: 0,
            endIndex: rebuilt.length,
          }));

    const headings: ParsedHeading[] = [];

    return {
      mimeType: "text/csv",
      extractedText: rebuilt,
      language: options?.language ?? detectLanguage(rebuilt),
      pageCount: 1,
      sections,
      headings,
      tables,
      statistics: computeStatistics({
        text: rebuilt,
        sectionCount: sections.length,
        headingCount: 0,
        tableCount: tables.length,
      }),
      parser: this.name,
      parserVersion: this.version,
    };
  }
}
