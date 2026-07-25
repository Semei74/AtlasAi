/* eslint-disable @typescript-eslint/require-await */
import type { ParsedDocument, ParsedHeading, ParsedTable, ParseOptions } from "../../interfaces/parser-result.interface.js";
import type { FormatParser } from "./format-parser.interface.js";
import { buildSections, computeStatistics, detectLanguage } from "./parse-text.util.js";

function parseMarkdownTables(lines: readonly string[]): { tables: ParsedTable[]; tableLineIndexes: Set<number> } {
  const tables: ParsedTable[] = [];
  const tableLineIndexes = new Set<number>();

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i]?.trim() ?? "";
    const next = lines[i + 1]?.trim() ?? "";

    const isHeader = line.startsWith("|") && line.endsWith("|") && line.includes(" ");
    const cleanedSeparator = next.replace(/\|/g, "").replace(/\s/g, "");
    const isSeparator =
      cleanedSeparator.length > 0 && /^[:-]+$/.test(cleanedSeparator) && cleanedSeparator.includes("-");

    if (isHeader && isSeparator) {
      const headers = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length) {
        const rowLine = lines[j]?.trim() ?? "";
        if (!rowLine.startsWith("|") || !rowLine.endsWith("|")) {
          break;
        }
        rows.push(
          rowLine
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim()),
        );
        tableLineIndexes.add(j);
        j++;
      }

      tables.push({ headers, rows });
      tableLineIndexes.add(i);
      tableLineIndexes.add(i + 1);
      i = j - 1;
    }
  }

  return { tables, tableLineIndexes };
}

export class MarkdownParser implements FormatParser {
  public readonly name = "markdown";
  public readonly version = "1.0.0";
  public readonly supportedMimeTypes = ["text/markdown", "text/x-markdown"] as const;

  public async parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument> {
    const raw = buffer.toString("utf-8");
    const lines = raw.split(/\r\n|\r|\n/);

    const { tables, tableLineIndexes } = parseMarkdownTables(lines);

    const headings: ParsedHeading[] = [];
    const bodyLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";
      const headingMatch = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
      if (headingMatch !== null && !tableLineIndexes.has(i)) {
        const levelText = headingMatch[1] ?? "";
        const text = (headingMatch[2] ?? "").trim();
        const level = levelText.length;
        headings.push({ text, level, position: bodyLines.join("\n").length });
        bodyLines.push(`#${"#".repeat(level - 1)} ${text}`);
        continue;
      }

      if (!tableLineIndexes.has(i)) {
        bodyLines.push(line);
      }
    }

    const text = bodyLines.join("\n").trim();
    const sections = buildSections(text, headings);

    return {
      mimeType: "text/markdown",
      extractedText: text,
      language: options?.language ?? detectLanguage(text),
      pageCount: 1,
      sections,
      headings,
      tables,
      statistics: computeStatistics({
        text,
        sectionCount: sections.length,
        headingCount: headings.length,
        tableCount: tables.length,
      }),
      parser: this.name,
      parserVersion: this.version,
    };
  }
}
