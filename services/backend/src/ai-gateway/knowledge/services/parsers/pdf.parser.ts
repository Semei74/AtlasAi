/* eslint-disable @typescript-eslint/require-await */
import type { ParsedDocument, ParsedHeading, ParseOptions } from "../../interfaces/parser-result.interface.js";
import type { FormatParser } from "./format-parser.interface.js";
import { buildSections, computeStatistics, detectLanguage } from "./parse-text.util.js";

function decodePdfLiteral(input: string): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "\\") {
      const next = input[i + 1];
      if (next === "n") out += "\n";
      else if (next === "r") out += "\r";
      else if (next === "t") out += "\t";
      else if (next === "b") out += "\b";
      else if (next === "f") out += "\f";
      else if (next === "(") out += "(";
      else if (next === ")") out += ")";
      else if (next === "\\") out += "\\";
      else if (next !== undefined && /[0-7]/.test(next)) {
        const octal = /^[0-7]{1,3}/.exec(input.slice(i + 1));
        if (octal !== null) {
          out += String.fromCodePoint(Number.parseInt(octal[0], 8));
          i += octal[0].length;
        }
      } else {
        out += next ?? "";
      }
      i++;
    } else {
      out += ch ?? "";
    }
  }
  return out;
}

function decodePdfHex(input: string): string {
  const cleaned = input.replace(/\s/g, "");
  let out = "";
  for (let i = 0; i + 1 < cleaned.length; i += 2) {
    out += String.fromCodePoint(Number.parseInt(cleaned.slice(i, i + 2), 16) || 32);
  }
  return out;
}

function extractPdfText(buffer: Buffer): string {
  const content = buffer.toString("latin1");
  const fragments: string[] = [];

  const literalOps = content.match(/\((?:[^()\\]|\\.)*\)\s*Tj/g);
  if (literalOps !== null) {
    for (const op of literalOps) {
      const inner = op.slice(op.indexOf("(") + 1, op.lastIndexOf(")"));
      fragments.push(decodePdfLiteral(inner));
    }
  }

  const arrayOps = content.match(/\[[\s\S]*?\]\s*TJ/g);
  if (arrayOps !== null) {
    for (const op of arrayOps) {
      const inner = op.slice(op.indexOf("[") + 1, op.lastIndexOf("]"));
      const tokens = inner.match(/\((?:[^()\\]|\\.)*\)|<[0-9A-Fa-f\s]+>/g);
      if (tokens !== null) {
        for (const token of tokens) {
          if (token.startsWith("<")) {
            fragments.push(decodePdfHex(token.slice(1, -1)));
          } else {
            fragments.push(decodePdfLiteral(token.slice(1, -1)));
          }
        }
      }
    }
  }

  return fragments.join(" ").replace(/\s+/g, " ").trim();
}

export class PdfParser implements FormatParser {
  public readonly name = "pdf";
  public readonly version = "1.0.0";
  public readonly supportedMimeTypes = ["application/pdf"] as const;

  public async parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument> {
    const text = extractPdfText(buffer);
    const pageMatches = buffer.toString("latin1").match(/Type\s*\/\s*Page\b(?!s)/g);
    const pageCount = pageMatches === null ? 1 : Math.max(pageMatches.length, 1);

    const headings: ParsedHeading[] = [];
    const sections = buildSections(text, headings);

    return {
      mimeType: "application/pdf",
      extractedText: text,
      language: options?.language ?? detectLanguage(text),
      pageCount,
      sections,
      headings,
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
