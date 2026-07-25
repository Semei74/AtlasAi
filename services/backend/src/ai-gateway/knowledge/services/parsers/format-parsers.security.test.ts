import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { EpubParser } from "./epub.parser.js";
import { PptxParser } from "./pptx.parser.js";

async function buildEpub(opts: {
  chapters?: { id: string; href: string; html: string }[];
  spine?: string[];
}): Promise<Buffer> {
  const chapters = opts.chapters ?? [
    { id: "c1", href: "chap1.xhtml", html: "<html><body><h1>Hi</h1><p>Body</p></body></html>" },
  ];
  const spine = opts.spine ?? chapters.map((c) => c.id);
  const zip = new JSZip();
  zip.file(
    "META-INF/container.xml",
    '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
  );
  const manifest = chapters
    .map((c) => `<item id="${c.id}" href="${c.href}" media-type="application/xhtml+xml"/>`)
    .join("");
  const spineXml = spine.map((id) => `<itemref idref="${id}"/>`).join("");
  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>T</dc:title></metadata><manifest>${manifest}</manifest><spine>${spineXml}</spine></package>`,
  );
  for (const c of chapters) {
    zip.file(`OEBPS/${c.href}`, c.html);
  }
  return zip.generateAsync({ type: "nodebuffer" });
}

describe("EpubParser — malicious archive structure safety (no parser-limits mock)", () => {
  it("resolves relative '..' hrefs only against entries inside the archive (no FS access)", async () => {
    const buf = await buildEpub({
      chapters: [{ id: "c1", href: "../escape.xhtml", html: "<html><body><p>INZIP</p></body></html>" }],
    });
    const result = await new EpubParser().parse(buf);
    expect(result).toBeDefined();
    expect(result.extractedText).toContain("INZIP");
    expect(result.extractedText).not.toContain("../escape.xhtml");
  });

  it("resolves absolute hrefs only against entries inside the archive (no FS access)", async () => {
    const buf = await buildEpub({
      chapters: [{ id: "c1", href: "/etc/passwd", html: "<html><body><p>INZIP</p></body></html>" }],
    });
    const result = await new EpubParser().parse(buf);
    expect(result).toBeDefined();
    expect(result.extractedText).toContain("INZIP");
    expect(result.extractedText).not.toContain("/etc/passwd");
  });

  it("parses chapters located in nested directories", async () => {
    const buf = await buildEpub({
      chapters: [
        { id: "c1", href: "chapters/c1.xhtml", html: "<html><body><h1>Deep</h1><p>Text</p></body></html>" },
      ],
    });
    const result = await new EpubParser().parse(buf);
    expect(result.extractedText).toContain("Text");
  });

  it("handles duplicate spine references without crashing", async () => {
    const buf = await buildEpub({
      chapters: [{ id: "c1", href: "chap1.xhtml", html: "<html><body><p>Dup</p></body></html>" }],
      spine: ["c1", "c1"],
    });
    const result = await new EpubParser().parse(buf);
    expect(result.extractedText).toContain("Dup");
  });

  it("rejects an empty archive with a controlled error", async () => {
    const zip = new JSZip();
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    await expect(new EpubParser().parse(buf)).rejects.toThrow();
  });
});

describe("PptxParser — malicious archive structure safety (no parser-limits mock)", () => {
  it("rejects an empty archive with a controlled error", async () => {
    const zip = new JSZip();
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    await expect(new PptxParser().parse(buf)).rejects.toThrow(/no slides/i);
  });

  it("extracts slides safely when slide text contains path-like sequences", async () => {
    const zip = new JSZip();
    zip.file(
      "docProps/core.xml",
      '<cp:coreProperties xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Deck</dc:title></cp:coreProperties>',
    );
    zip.file(
      "ppt/slides/slide1.xml",
      '<p:sld><p:cSld><p:sp><p:txBody><a:p><a:r><a:t>Normal slide</a:t></a:r></a:p></p:txBody></p:sp></p:cSld></p:sld>',
    );
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    const result = await new PptxParser().parse(buf);
    expect(result.extractedText).toContain("Normal slide");
  });
});
