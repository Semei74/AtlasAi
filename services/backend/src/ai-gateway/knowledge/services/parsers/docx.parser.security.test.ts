import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { DocxParser } from "./docx.parser.js";
import { MAX_TOTAL_DECOMPRESSED_BYTES } from "./parser-limits.js";

async function buildMinimalDocx(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      "</Types>",
  );
  zip.file(
    "_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      "</Relationships>",
  );
  zip.file(
    "word/document.xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      "<w:body><w:p><w:r><w:t>Hello Docx</w:t></w:r></w:p></w:body></w:document>",
  );
  return zip.generateAsync({ type: "nodebuffer" });
}

describe("DocxParser — zip-bomb protection (reuses parser-limits)", () => {
  it("parses a real minimal docx end-to-end", async () => {
    const result = await new DocxParser().parse(await buildMinimalDocx());
    expect(result.extractedText).toContain("Hello Docx");
  });

  it("rejects a docx bomb with too many entries (assertArchiveEntriesSafe is invoked)", async () => {
    const zip = new JSZip();
    for (let i = 0; i < 10_001; i++) {
      zip.file(`part-${String(i)}.xml`, "<x/>");
    }
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    await expect(new DocxParser().parse(buf)).rejects.toThrow(/too many entries/);
  }, 30_000);

  it("rejects a docx whose actual decompressed content exceeds the limit (assertArchiveActualSize is invoked)", async () => {
    const zip = new JSZip();
    zip.file(
      "[Content_Types].xml",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="bin" ContentType="application/octet-stream"/>' +
        "</Types>",
    );
    zip.file("large.bin", Buffer.alloc(MAX_TOTAL_DECOMPRESSED_BYTES + 1, "a"));
    const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    await expect(new DocxParser().parse(buf)).rejects.toThrow(/decompressed/);
  }, 120_000);
});
