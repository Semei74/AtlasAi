import JSZip from "jszip";
import mammoth from "mammoth";
import type { ParsedDocument, ParseOptions } from "../../interfaces/parser-result.interface.js";
import type { FormatParser } from "./format-parser.interface.js";
import { buildSections, computeStatistics, detectLanguage } from "./parse-text.util.js";
import { extractHtmlContent } from "./html-structure.util.js";
import { assertArchiveWithinSize, assertArchiveEntriesSafe, assertArchiveActualSize } from "./parser-limits.js";

export class DocxParser implements FormatParser {
  public readonly name = "docx";
  public readonly version = "1.0.0";
  public readonly supportedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const;

  public async parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument> {
    assertArchiveWithinSize(buffer);

    const zip = await JSZip.loadAsync(buffer);
    assertArchiveEntriesSafe(zip);
    await assertArchiveActualSize(zip);

    const result = await mammoth.convertToHtml({ buffer });
    const html = result.value;

    const { text, headings, tables } = extractHtmlContent(html);
    const sections = buildSections(text, headings);

    return {
      mimeType: this.supportedMimeTypes[0],
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
