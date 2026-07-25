/* eslint-disable @typescript-eslint/require-await */
import type { ParsedDocument, ParsedHeading, ParsedSection, ParseOptions } from "../../interfaces/parser-result.interface.js";
import type { FormatParser } from "./format-parser.interface.js";
import { buildSections, computeStatistics, detectLanguage, decodeHtmlEntities } from "./parse-text.util.js";

interface XmlElement {
  tag: string;
  text: string;
}

function parseTopLevelElements(xml: string): XmlElement[] {
  const cleaned = xml
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "");

  const result: XmlElement[] = [];
  const stack: XmlElement[] = [];

  const appendText = (text: string): void => {
    const node = text.replace(/\s+/g, " ").trim();
    if (node.length === 0 || stack.length === 0) {
      return;
    }
    const top = stack[stack.length - 1];
    if (top === undefined) {
      return;
    }
    top.text += (top.text.length > 0 ? " " : "") + node;
  };

  const tagRe = /^(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)$/;
  let pos = 0;

  while (pos < cleaned.length) {
    const lt = cleaned.indexOf("<", pos);
    if (lt === -1) {
      appendText(cleaned.slice(pos));
      break;
    }
    if (lt > pos) {
      appendText(cleaned.slice(pos, lt));
    }
    const gt = cleaned.indexOf(">", lt + 1);
    if (gt === -1) {
      appendText(cleaned.slice(lt));
      break;
    }
    const tagContent = cleaned.slice(lt + 1, gt);
    const tagMatch = tagRe.exec(tagContent);

    if (tagMatch === null) {
      appendText("<");
      pos = lt + 1;
      continue;
    }

    const closing = tagMatch[1] ?? "";
    const tag = tagMatch[2] ?? "";
    const selfClose = tagMatch[4] ?? "";

    if (closing === "/") {
      const top = stack.pop();
      if (top !== undefined) {
        if (stack.length === 0) {
          result.push(top);
        } else {
          const parent = stack[stack.length - 1];
          if (parent !== undefined) {
            parent.text += (parent.text.length > 0 ? " " : "") + top.text;
          }
        }
      }
    } else if (selfClose === "/" || tagContent.endsWith("/")) {
      if (stack.length === 0) {
        result.push({ tag, text: "" });
      }
    } else {
      stack.push({ tag, text: "" });
    }

    pos = gt + 1;
  }

  return result;
}

export class XmlParser implements FormatParser {
  public readonly name = "xml";
  public readonly version = "1.0.0";
  public readonly supportedMimeTypes = ["text/xml", "application/xml"] as const;

  public async parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument> {
    const raw = buffer.toString("utf-8");
    const elements = parseTopLevelElements(raw);

    const headings: ParsedHeading[] = [];
    const sections: ParsedSection[] = [];

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el === undefined) {
        continue;
      }
      const text = decodeHtmlEntities(el.text).trim();
      headings.push({ text: el.tag, level: 1, position: 0 });
      sections.push({
        id: `sec-${String(i)}`,
        title: el.tag,
        level: 1,
        text,
        startIndex: 0,
        endIndex: raw.length,
      });
    }

    const fullText = decodeHtmlEntities(elements.map((e) => e.text).join("\n")).trim();
    const finalSections = sections.length === 0 ? buildSections(fullText, []) : sections;

    return {
      mimeType: "application/xml",
      extractedText: fullText,
      language: options?.language ?? detectLanguage(fullText),
      pageCount: 1,
      sections: finalSections,
      headings,
      tables: [],
      statistics: computeStatistics({
        text: fullText,
        sectionCount: finalSections.length,
        headingCount: headings.length,
        tableCount: 0,
      }),
      parser: this.name,
      parserVersion: this.version,
    };
  }
}
