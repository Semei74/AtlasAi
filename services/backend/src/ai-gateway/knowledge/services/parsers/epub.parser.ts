import { ValidationError } from "@atlas/errors";
import JSZip from "jszip";
import { parse } from "node-html-parser";
import type { ParsedDocument, ParsedHeading, ParsedMetadata, ParsedSection, ParsedTable, ParseOptions } from "../../interfaces/parser-result.interface.js";
import type { FormatParser } from "./format-parser.interface.js";
import { computeStatistics, detectLanguage } from "./parse-text.util.js";
import { extractHtmlContent } from "./html-structure.util.js";
import { assertArchiveWithinSize, assertArchiveEntriesSafe, MAX_TOTAL_DECOMPRESSED_BYTES } from "./parser-limits.js";

function readAttr(attrs: string, name: string): string | null {
  const match = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i").exec(attrs);
  return match === null ? null : (match[1] ?? null);
}

function firstTagText(content: string, tag: string): string | null {
  const match = new RegExp(`<(?:[\\w-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w-]+:)?${tag}>`, "i").exec(content);
  if (match === null) {
    return null;
  }
  return (match[1] ?? "").replace(/\s+/g, " ").trim();
}

interface ManifestItem {
  readonly id: string;
  readonly href: string;
  readonly mediaType: string;
}

function parseManifest(opf: string): readonly ManifestItem[] {
  const items: ManifestItem[] = [];
  const regex = /<item\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(opf)) !== null) {
    const attrs = match[1] ?? "";
    const id = readAttr(attrs, "id");
    const href = readAttr(attrs, "href");
    const mediaType = readAttr(attrs, "media-type");
    if (id !== null && href !== null) {
      items.push({ id, href, mediaType: mediaType ?? "" });
    }
  }
  return items;
}

function parseSpine(opf: string): readonly string[] {
  const idrefs: string[] = [];
  const regex = /<itemref\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(opf)) !== null) {
    const idref = readAttr(match[1] ?? "", "idref");
    if (idref !== null) {
      idrefs.push(idref);
    }
  }
  return idrefs;
}

function resolvePath(baseDir: string, href: string): string {
  const parts = baseDir.length > 0 ? baseDir.split("/") : [];
  for (const segment of href.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }
    if (segment === "..") {
      parts.pop();
    } else {
      parts.push(segment);
    }
  }
  return parts.join("/");
}

export class EpubParser implements FormatParser {
  public readonly name = "epub";
  public readonly version = "1.0.0";
  public readonly supportedMimeTypes = ["application/epub+zip"] as const;

  public async parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument> {
    assertArchiveWithinSize(buffer);

    const zip = await JSZip.loadAsync(buffer);
    assertArchiveEntriesSafe(zip);

    const containerFile = zip.file("META-INF/container.xml");
    if (containerFile === null) {
      throw new ValidationError("Invalid EPUB: META-INF/container.xml not found");
    }
    const container = await containerFile.async("string");
    const rootFile = parse(container).querySelector("rootfile");
    const opfPath = rootFile?.getAttribute("full-path") ?? null;
    if (opfPath === null || opfPath.length === 0) {
      throw new ValidationError("Invalid EPUB: rootfile full-path not found");
    }

    const opfFile = zip.file(opfPath);
    if (opfFile === null) {
      throw new ValidationError(`Invalid EPUB: OPF not found at ${opfPath}`);
    }
    const opf = await opfFile.async("string");

    const manifest = parseManifest(opf);
    const spine = parseSpine(opf);
    const manifestById = new Map(manifest.map((item) => [item.id, item]));

    const baseDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/")) : "";
    const chapterPaths = spine
      .map((idref) => manifestById.get(idref))
      .filter((item): item is ManifestItem => item !== undefined)
      .filter((item) => item.mediaType.includes("xhtml"))
      .map((item) => resolvePath(baseDir, item.href));

    const chapters: { title: string | null; text: string; headings: readonly ParsedHeading[]; tables: readonly ParsedTable[]; offset: number }[] = [];
    let combinedText = "";
    let decompressedTotal = 0;
    const headings: ParsedHeading[] = [];
    const tables: ParsedTable[] = [];

    for (const path of chapterPaths) {
      const file = zip.file(path);
      if (file === null) {
        continue;
      }
      const xhtml = await file.async("string");
      decompressedTotal += Buffer.byteLength(xhtml, "utf8");
      if (decompressedTotal > MAX_TOTAL_DECOMPRESSED_BYTES) {
        throw new ValidationError("EPUB decompressed content exceeds maximum supported limit");
      }
      const { text, headings: chapterHeadings, tables: chapterTables } = extractHtmlContent(xhtml);

      const offset = combinedText.length;
      const firstHeading = chapterHeadings[0];
      chapters.push({
        title: firstHeading === undefined ? null : firstHeading.text,
        text,
        headings: chapterHeadings,
        tables: chapterTables,
        offset,
      });

      for (const heading of chapterHeadings) {
        headings.push({ ...heading, position: heading.position + offset });
      }
      for (const table of chapterTables) {
        tables.push(table);
      }
      combinedText += (combinedText.length > 0 ? "\n\n" : "") + text;
    }

    if (chapters.length === 0) {
      throw new ValidationError("Invalid EPUB: no readable XHTML content found in spine");
    }

    const sections: ParsedSection[] = chapters.map((chapter, index) => ({
      id: `chap-${String(index)}`,
      title: chapter.title,
      level: chapter.title === null ? null : 1,
      text: chapter.text,
      startIndex: chapter.offset,
      endIndex: chapter.offset + chapter.text.length,
    }));

    const title = firstTagText(opf, "title");
    const creator = firstTagText(opf, "creator");
    const languageMeta = firstTagText(opf, "language");
    const publisher = firstTagText(opf, "publisher");

    const metadata: ParsedMetadata = {};
    if (title !== null) metadata.title = title;
    if (creator !== null) metadata.creator = creator;
    if (publisher !== null) metadata.publisher = publisher;

    const language = options?.language ?? languageMeta ?? detectLanguage(combinedText);

    return {
      mimeType: this.supportedMimeTypes[0],
      extractedText: combinedText,
      language,
      pageCount: chapters.length,
      sections,
      headings,
      tables,
      statistics: computeStatistics({
        text: combinedText,
        sectionCount: sections.length,
        headingCount: headings.length,
        tableCount: tables.length,
      }),
      parser: this.name,
      parserVersion: this.version,
      metadata,
    };
  }
}
