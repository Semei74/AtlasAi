/* eslint-disable @typescript-eslint/require-await */
import type { ParsedDocument, ParseOptions } from "../../interfaces/parser-result.interface.js";
import type { FormatParser } from "./format-parser.interface.js";
import { computeStatistics, detectLanguage } from "./parse-text.util.js";

export class TxtParser implements FormatParser {
  public readonly name = "txt";
  public readonly version = "1.0.0";
  public readonly supportedMimeTypes = ["text/plain"] as const;

  public async parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument> {
    const text = buffer.toString("utf-8");
    const paragraphs = text
      .split(/\r\n|\r|\n/)
      .reduce<string[]>((acc, line) => {
        if (line.trim().length === 0) {
          return acc;
        }
        const last = acc[acc.length - 1];
        if (acc.length === 0 || (last !== undefined && last.trim().length > 0)) {
          acc.push(line);
        } else if (last !== undefined) {
          acc[acc.length - 1] = `${last}\n${line}`;
        }
        return acc;
      }, []);

    const sections = paragraphs.map((para, index) => ({
      id: `sec-${String(index)}`,
      title: null,
      level: null,
      text: para.trim(),
      startIndex: text.indexOf(para),
      endIndex: text.indexOf(para) + para.length,
    }));

    return {
      mimeType: "text/plain",
      extractedText: text,
      language: options?.language ?? detectLanguage(text),
      pageCount: 1,
      sections,
      headings: [],
      tables: [],
      statistics: computeStatistics({
        text,
        sectionCount: sections.length,
        headingCount: 0,
        tableCount: 0,
      }),
      parser: this.name,
      parserVersion: this.version,
    };
  }
}
