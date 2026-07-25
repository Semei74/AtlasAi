import { parse } from "node-html-parser";
import type { ParsedHeading, ParsedTable } from "../../interfaces/parser-result.interface.js";
import { decodeHtmlEntities } from "./parse-text.util.js";

export interface HtmlContent {
  readonly text: string;
  readonly headings: readonly ParsedHeading[];
  readonly tables: readonly ParsedTable[];
}

export function extractHtmlContent(html: string): HtmlContent {
  const root = parse(html);

  for (const tag of root.querySelectorAll("script, style, noscript, head")) {
    tag.remove();
  }

  const rawText = decodeHtmlEntities(root.textContent).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const text = rawText;

  const headingEls = root.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const headings: ParsedHeading[] = [];

  for (const el of headingEls) {
    const tag = el.tagName.toLowerCase();
    const level = Number(tag.replace("h", ""));
    const headingText = el.text.trim();
    if (headingText.length === 0) {
      continue;
    }
    const position = text.indexOf(headingText);
    headings.push({
      text: headingText,
      level: Number.isNaN(level) ? 1 : level,
      position: position === -1 ? 0 : position,
    });
  }

  const tableEls = root.querySelectorAll("table");
  const tables: ParsedTable[] = [];

  for (const table of tableEls) {
    const rowEls = table.querySelectorAll("tr");
    if (rowEls.length === 0) {
      continue;
    }

    const firstRow = rowEls[0];
    if (firstRow === undefined) {
      continue;
    }
    const firstRowCells = firstRow.querySelectorAll("th, td");
    const headers = firstRowCells.map((c) => c.text.trim());

    const rows: string[][] = [];
    for (let r = 1; r < rowEls.length; r++) {
      const rowEl = rowEls[r];
      if (rowEl === undefined) {
        continue;
      }
      const cells = rowEl.querySelectorAll("th, td");
      rows.push(cells.map((c) => c.text.trim()));
    }

    tables.push({ headers, rows });
  }

  return { text, headings, tables };
}
