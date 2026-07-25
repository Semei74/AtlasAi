import { describe, it, expect, vi, beforeEach } from "vitest";
import { TxtParser } from "./txt.parser.js";
import { MarkdownParser } from "./markdown.parser.js";
import { HtmlParser } from "./html.parser.js";
import { DocxParser } from "./docx.parser.js";
import { PdfParser } from "./pdf.parser.js";
import { CsvParser } from "./csv.parser.js";
import { JsonParser } from "./json.parser.js";
import { XmlParser } from "./xml.parser.js";
import { EpubParser } from "./epub.parser.js";
import { PptxParser } from "./pptx.parser.js";
import { assertArchiveWithinSize } from "./parser-limits.js";
import JSZip from "jszip";

vi.mock("./parser-limits.js");

beforeEach(() => {
  vi.mocked(assertArchiveWithinSize).mockReset();
});

async function buildEpub(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    "META-INF/container.xml",
    '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
  );
  zip.file(
    "OEBPS/content.opf",
    '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/">' +
      "<dc:title>Sample Book</dc:title><dc:creator>Jane Author</dc:creator><dc:language>en</dc:language><dc:publisher>Atlas Press</dc:publisher>" +
      '</metadata><manifest><item id="c1" href="chap1.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="chap2.xhtml" media-type="application/xhtml+xml"/></manifest>' +
      '<spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>',
  );
  zip.file(
    "OEBPS/chap1.xhtml",
    "<html><body><h1>Chapter One</h1><p>First chapter body text.</p></body></html>",
  );
  zip.file(
    "OEBPS/chap2.xhtml",
    "<html><body><h1>Chapter Two</h1><p>Second chapter body text.</p></body></html>",
  );
  return zip.generateAsync({ type: "nodebuffer" });
}

async function buildPptx(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    "docProps/core.xml",
    '<?xml version="1.0"?><cp:coreProperties xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Quarterly Deck</dc:title><dc:creator>John Speaker</dc:creator></cp:coreProperties>',
  );
  zip.file(
    "ppt/slides/slide1.xml",
    '<p:sld><p:cSld><p:sp><p:txBody><a:p><a:r><a:t>Welcome Slide</a:t></a:r></a:p><a:p><a:r><a:t>Intro bullet point</a:t></a:r></a:p></p:txBody></p:sp></p:cSld></p:sld>',
  );
  zip.file(
    "ppt/slides/slide2.xml",
    '<p:sld><p:cSld><p:sp><p:txBody><a:p><a:r><a:t>Second Slide</a:t></a:r></a:p></p:txBody></p:sp></p:cSld></p:sld>',
  );
  zip.file(
    "ppt/notesSlides/notesSlide1.xml",
    '<p:notes><p:cSld><p:sp><p:txBody><a:p><a:r><a:t>Speaker note for slide one</a:t></a:r></a:p></p:txBody></p:sp></p:cSld></p:notes>',
  );
  return zip.generateAsync({ type: "nodebuffer" });
}

async function buildDocx(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", "<Types/>");
  zip.file("word/document.xml", "<document/>");
  return zip.generateAsync({ type: "nodebuffer" });
}

vi.mock("mammoth", () => ({
  default: {
    convertToHtml: vi.fn().mockResolvedValue({
      value:
        "<h1>Report Title</h1><p>Body paragraph text.</p>" +
        "<table><tr><th>Name</th><th>Score</th></tr>" +
        "<tr><td>Alice</td><td>10</td></tr><tr><td>Bob</td><td>20</td></tr></table>",
    }),
  },
}));

describe("TxtParser", () => {
  it("parses plain text into paragraph sections", async () => {
    const parser = new TxtParser();
    const result = await parser.parse(Buffer.from("First paragraph.\n\nSecond paragraph."), { language: "en" });

    expect(result.extractedText).toContain("First paragraph");
    expect(result.sections.length).toBe(2);
    expect(result.pageCount).toBe(1);
    expect(result.statistics.wordCount).toBeGreaterThan(0);
    expect(parser.supportedMimeTypes).toContain("text/plain");
    expect(parser.supportedMimeTypes).not.toContain("application/pdf");
  });
});

describe("MarkdownParser", () => {
  it("extracts headings, sections and tables", async () => {
    const md = [
      "# Title",
      "",
      "Intro text.",
      "",
      "## Section A",
      "",
      "Content A.",
      "",
      "| Col1 | Col2 |",
      "| --- | --- |",
      "| a | b |",
      "| c | d |",
    ].join("\n");

    const parser = new MarkdownParser();
    const result = await parser.parse(Buffer.from(md));

    expect(result.headings.map((h) => h.text)).toContain("Title");
    expect(result.headings.map((h) => h.text)).toContain("Section A");
    expect(result.tables).toHaveLength(1);
    expect(result.tables[0]?.headers).toEqual(["Col1", "Col2"]);
    expect(result.tables[0]?.rows).toHaveLength(2);
    expect(result.sections.length).toBeGreaterThan(0);
  });
});

describe("HtmlParser", () => {
  it("extracts text, headings and tables", async () => {
    const html =
      "<html><body><h1>Heading One</h1><p>Some body text.</p>" +
      "<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table></body></html>";

    const parser = new HtmlParser();
    const result = await parser.parse(Buffer.from(html));

    expect(result.extractedText).toContain("Some body text");
    expect(result.headings.map((h) => h.text)).toContain("Heading One");
    expect(result.tables).toHaveLength(1);
  });
});

describe("DocxParser", () => {
  it("parses docx via mammoth into structure", async () => {
    const parser = new DocxParser();
    const result = await parser.parse(await buildDocx());

    expect(result.extractedText).toContain("Body paragraph text");
    expect(result.headings.map((h) => h.text)).toContain("Report Title");
    expect(result.tables).toHaveLength(1);
    expect(result.tables[0]?.rows[0]).toEqual(["Alice", "10"]);
    expect(parser.supportedMimeTypes).toContain(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
  });
});

describe("PdfParser", () => {
  it("extracts native text and counts pages", async () => {
    const pdf =
      "%PDF-1.4\n1 0 obj<</Type/Page>>endobj\n2 0 obj<</Type /Page>>endobj\n" +
      "BT (Hello PDF World) Tj ET\n[/A (B) (C)] TJ\n%%EOF";

    const parser = new PdfParser();
    const result = await parser.parse(Buffer.from(pdf));

    expect(result.extractedText).toContain("Hello PDF World");
    expect(result.extractedText).toContain("B C");
    expect(result.pageCount).toBe(2);
    expect(parser.supportedMimeTypes).toContain("application/pdf");
  });
});

describe("CsvParser", () => {
  it("parses csv into a table and sections", async () => {
    const csv = "name,score\nAlice,10\nBob,20";

    const parser = new CsvParser();
    const result = await parser.parse(Buffer.from(csv));

    expect(result.tables).toHaveLength(1);
    expect(result.tables[0]?.headers).toEqual(["name", "score"]);
    expect(result.tables[0]?.rows).toEqual([
      ["Alice", "10"],
      ["Bob", "20"],
    ]);
    expect(result.sections.length).toBe(2);
  });

  it("handles quoted fields with commas and newlines", async () => {
    const csv = 'name,note\n"Smith, John","line one\nline two"';

    const parser = new CsvParser();
    const result = await parser.parse(Buffer.from(csv));

    expect(result.tables[0]?.rows[0]).toEqual(["Smith, John", "line one\nline two"]);
  });
});

describe("JsonParser", () => {
  it("parses json into sections per key", async () => {
    const json = JSON.stringify({ title: "Doc", count: 3 });

    const parser = new JsonParser();
    const result = await parser.parse(Buffer.from(json));

    expect(result.extractedText).toContain("\"title\"");
    expect(result.headings.map((h) => h.text)).toEqual(["title", "count"]);
    expect(result.sections.length).toBe(2);
  });

  it("throws on invalid json", async () => {
    const parser = new JsonParser();
    await expect(parser.parse(Buffer.from("{not valid"))).rejects.toThrow();
  });
});

describe("XmlParser", () => {
  it("extracts top-level element structure", async () => {
    const xml = "<item>First</item><item>Second</item>";

    const parser = new XmlParser();
    const result = await parser.parse(Buffer.from(xml));

    expect(result.sections.map((s) => s.title)).toEqual(["item", "item"]);
    expect(result.extractedText).toContain("First");
    expect(result.extractedText).toContain("Second");
    expect(result.headings.map((h) => h.text)).toEqual(["item", "item"]);
  });
});

describe("EpubParser", () => {
  it("extracts chapters, headings, metadata and statistics", async () => {
    const parser = new EpubParser();
    const result = await parser.parse(await buildEpub());

    expect(result.extractedText).toContain("First chapter body text");
    expect(result.extractedText).toContain("Second chapter body text");
    expect(result.pageCount).toBe(2);
    expect(result.sections.length).toBe(2);
    expect(result.sections[0]?.title).toBe("Chapter One");
    expect(result.headings.map((h) => h.text)).toContain("Chapter One");
    expect(result.metadata?.title).toBe("Sample Book");
    expect(result.metadata?.creator).toBe("Jane Author");
    expect(result.metadata?.publisher).toBe("Atlas Press");
    expect(result.language).toBe("en");
    expect(parser.supportedMimeTypes).toContain("application/epub+zip");
  });

  it("throws on invalid epub (no container)", async () => {
    const parser = new EpubParser();
    await expect(parser.parse(Buffer.from("not a zip"))).rejects.toThrow();
  });

  it("rejects archives exceeding the size limit", async () => {
    vi.mocked(assertArchiveWithinSize).mockImplementation(() => {
      throw new Error("exceeds maximum supported archive size");
    });
    const parser = new EpubParser();
    await expect(parser.parse(await buildEpub())).rejects.toThrow(/exceeds maximum supported archive size/);
  });
});

describe("PptxParser", () => {
  it("extracts text from all slides, notes and metadata", async () => {
    const parser = new PptxParser();
    const result = await parser.parse(await buildPptx());

    expect(result.extractedText).toContain("Welcome Slide");
    expect(result.extractedText).toContain("Second Slide");
    expect(result.extractedText).toContain("Speaker note for slide one");
    expect(result.pageCount).toBe(2);
    expect(result.sections.length).toBe(2);
    expect(result.sections[0]?.title).toBe("Welcome Slide");
    expect(result.metadata?.title).toBe("Quarterly Deck");
    expect(result.metadata?.creator).toBe("John Speaker");
    expect(parser.supportedMimeTypes).toContain(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
  });

  it("throws on invalid pptx (no slides)", async () => {
    const parser = new PptxParser();
    await expect(parser.parse(Buffer.from("not a zip"))).rejects.toThrow();
  });

  it("rejects archives exceeding the size limit", async () => {
    vi.mocked(assertArchiveWithinSize).mockImplementation(() => {
      throw new Error("exceeds maximum supported archive size");
    });
    const parser = new PptxParser();
    await expect(parser.parse(await buildPptx())).rejects.toThrow(/exceeds maximum supported archive size/);
  });
});
