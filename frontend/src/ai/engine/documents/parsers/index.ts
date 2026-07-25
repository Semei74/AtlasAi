import type { DocumentParser, DocumentParseResult, DocumentFormat } from '../types';
import type { ParsedMetadata } from '../types';

class TextParser implements DocumentParser {
  canParse(format: DocumentFormat): boolean {
    return ['txt', 'markdown', 'csv', 'json'].includes(format);
  }

  async parse(content: string | ArrayBuffer, format: DocumentFormat): Promise<DocumentParseResult> {
    const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
    const sections = this.extractSections(text, format);
    return {
      text,
      metadata: {
        wordCount: text.split(/\s+/).filter(Boolean).length,
        format,
        size: text.length,
      },
      sections,
    };
  }

  private extractSections(text: string, format: DocumentFormat): DocumentParseResult['sections'] {
    if (format === 'markdown') {
      return this.extractMarkdownSections(text);
    }
    return [];
  }

  private extractMarkdownSections(text: string): DocumentParseResult['sections'] {
    const sections: DocumentParseResult['sections'] = [];
    const lines = text.split('\n');
    let currentHeading = '';
    let currentLevel = 0;
    let currentContent: string[] = [];
    let sectionId = 0;

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        if (currentHeading || currentContent.length > 0) {
          sections.push({
            id: `section_${sectionId++}`,
            heading: currentHeading || 'Introduction',
            level: currentLevel,
            content: currentContent.join('\n').trim(),
          });
          currentContent = [];
        }
        currentLevel = headingMatch[1].length;
        currentHeading = headingMatch[2];
      } else {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0) {
      sections.push({
        id: `section_${sectionId}`,
        heading: currentHeading || 'Introduction',
        level: currentLevel,
        content: currentContent.join('\n').trim(),
      });
    }

    return sections;
  }
}

class HTMLParser implements DocumentParser {
  canParse(format: DocumentFormat): boolean {
    return format === 'html';
  }

  async parse(content: string | ArrayBuffer, format: DocumentFormat): Promise<DocumentParseResult> {
    const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
    const stripped = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      text: stripped,
      metadata: {
        wordCount: stripped.split(/\s+/).filter(Boolean).length,
        format,
        size: text.length,
      },
      sections: [],
    };
  }
}

class PDFParser implements DocumentParser {
  canParse(format: DocumentFormat): boolean {
    return format === 'pdf';
  }

  async parse(content: string | ArrayBuffer, format: DocumentFormat): Promise<DocumentParseResult> {
    const placeholder = typeof content === 'string'
      ? `[PDF content: ${content.slice(0, 100)}...]`
      : '[PDF binary content - requires PDF.js or server-side parsing]';
    return {
      text: placeholder,
      metadata: { format, size: typeof content === 'string' ? content.length : content.byteLength },
      sections: [],
    };
  }
}

class DOCXParser implements DocumentParser {
  canParse(format: DocumentFormat): boolean {
    return format === 'docx';
  }

  async parse(content: string | ArrayBuffer, format: DocumentFormat): Promise<DocumentParseResult> {
    return {
      text: '[DOCX content - requires mammoth.js or server-side parsing]',
      metadata: { format, size: typeof content === 'string' ? content.length : content.byteLength },
      sections: [],
    };
  }
}

class PPTXParser implements DocumentParser {
  canParse(format: DocumentFormat): boolean {
    return format === 'pptx';
  }

  async parse(content: string | ArrayBuffer, format: DocumentFormat): Promise<DocumentParseResult> {
    return {
      text: '[PPTX content - requires pptxjs or server-side parsing]',
      metadata: { format, size: typeof content === 'string' ? content.length : content.byteLength },
      sections: [],
    };
  }
}

export const parsers: DocumentParser[] = [
  new TextParser(),
  new HTMLParser(),
  new PDFParser(),
  new DOCXParser(),
  new PPTXParser(),
];

export { TextParser, HTMLParser, PDFParser, DOCXParser, PPTXParser };
