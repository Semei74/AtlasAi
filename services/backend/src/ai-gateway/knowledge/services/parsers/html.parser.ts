/* eslint-disable @typescript-eslint/require-await */
import type { ParsedDocument, ParseOptions } from "../../interfaces/parser-result.interface.js";
import type { FormatParser } from "./format-parser.interface.js";
import { buildSections, computeStatistics, detectLanguage } from "./parse-text.util.js";
import { extractHtmlContent } from "./html-structure.util.js";

export class HtmlParser implements FormatParser {
  public readonly name = "html";
  public readonly version = "1.0.0";
  public readonly supportedMimeTypes = ["text/html", "application/xhtml+xml"] as const;

  public async parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument> {
    const html = buffer.toString("utf-8");
    const { text, headings, tables } = extractHtmlContent(html);
    const sections = buildSections(text, headings);

    return {
      mimeType: "text/html",
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
