import { ValidationError } from "@atlas/errors";
import JSZip from "jszip";
import type { ParsedDocument, ParsedHeading, ParsedMetadata, ParsedSection, ParseOptions } from "../../interfaces/parser-result.interface.js";
import type { FormatParser } from "./format-parser.interface.js";
import { computeStatistics, decodeHtmlEntities, detectLanguage } from "./parse-text.util.js";
import { assertArchiveWithinSize, assertArchiveEntriesSafe, MAX_TOTAL_DECOMPRESSED_BYTES } from "./parser-limits.js";

function extractTextRuns(xml: string): string {
  const paragraphs = xml.split(/<\/a:p>/i);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const runs = [...paragraph.matchAll(/<a:t>([\s\S]*?)<\/a:t>/gi)].map((match) => decodeHtmlEntities(match[1] ?? ""));
    if (runs.length > 0) {
      lines.push(runs.join(" ").trim());
    }
  }

  return lines.filter((line) => line.length > 0).join("\n");
}

export class PptxParser implements FormatParser {
  public readonly name = "pptx";
  public readonly version = "1.0.0";
  public readonly supportedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ] as const;

  public async parse(buffer: Buffer, options?: ParseOptions): Promise<ParsedDocument> {
    assertArchiveWithinSize(buffer);

    const zip = await JSZip.loadAsync(buffer);
    assertArchiveEntriesSafe(zip);

    const slideFiles = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => this.slideIndex(a) - this.slideIndex(b));

    if (slideFiles.length === 0) {
      throw new ValidationError("Invalid PPTX: no slides found");
    }

    const slides: { title: string | null; text: string }[] = [];
    let decompressedTotal = 0;
    const noteFiles = new Map<number, string>(
      Object.keys(zip.files)
        .filter((name) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/i.test(name))
        .map((name) => [this.slideIndex(name), name] as const),
    );

    for (const slideName of slideFiles) {
      const slideFile = zip.file(slideName);
      if (slideFile === null) {
        continue;
      }
      const slideXml = await slideFile.async("string");
      decompressedTotal += Buffer.byteLength(slideXml, "utf8");
      if (decompressedTotal > MAX_TOTAL_DECOMPRESSED_BYTES) {
        throw new ValidationError("PPTX decompressed content exceeds maximum supported limit");
      }
      let slideText = extractTextRuns(slideXml);

      const noteName = noteFiles.get(this.slideIndex(slideName));
      if (noteName !== undefined) {
        const noteFile = zip.file(noteName);
        if (noteFile !== null) {
          const noteText = extractTextRuns(await noteFile.async("string"));
          if (noteText.length > 0) {
            slideText += (slideText.length > 0 ? "\n\n" : "") + `Notes:\n${noteText}`;
          }
        }
      }

      const firstLine = slideText.split("\n", 1)[0]?.trim() ?? null;
      slides.push({ title: firstLine === "" ? null : firstLine, text: slideText });
    }

    const combinedText = slides.map((slide) => slide.text).join("\n\n");

    const sections: ParsedSection[] = slides.map((slide, index) => ({
      id: `slide-${String(index + 1)}`,
      title: slide.title,
      level: slide.title === null ? null : 1,
      text: slide.text,
      startIndex: 0,
      endIndex: slide.text.length,
    }));

    const headings: ParsedHeading[] = [];
    slides.forEach((slide, index) => {
      if (slide.title !== null) {
        headings.push({ text: slide.title, level: 1, position: index * 2 });
      }
    });

    const metadata: ParsedMetadata = await this.readMetadata(zip);

    return {
      mimeType: this.supportedMimeTypes[0],
      extractedText: combinedText,
      language: options?.language ?? detectLanguage(combinedText),
      pageCount: slides.length,
      sections,
      headings,
      tables: [],
      statistics: computeStatistics({
        text: combinedText,
        sectionCount: sections.length,
        headingCount: headings.length,
        tableCount: 0,
      }),
      parser: this.name,
      parserVersion: this.version,
      metadata,
    };
  }

  private slideIndex(name: string): number {
    const match = /(\d+)\.xml$/i.exec(name);
    return match === null ? 0 : Number(match[1]);
  }

  private async readMetadata(zip: JSZip): Promise<ParsedMetadata> {
    const metadata: ParsedMetadata = {};
    const core = zip.file("docProps/core.xml");
    if (core === null) {
      return metadata;
    }
    const xml = await core.async("string");
    const title = /<(?:dc:)?title\b[^>]*>([\s\S]*?)<\/(?:dc:)?title>/i.exec(xml);
    const creator = /<(?:dc:)?creator\b[^>]*>([\s\S]*?)<\/(?:dc:)?creator>/i.exec(xml);
    if (title !== null) metadata.title = title[1]?.replace(/\s+/g, " ").trim() ?? "";
    if (creator !== null) metadata.creator = creator[1]?.replace(/\s+/g, " ").trim() ?? "";
    return metadata;
  }
}
