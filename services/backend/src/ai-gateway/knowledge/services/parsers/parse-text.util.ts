import type {
  ParsedHeading,
  ParsedSection,
  ParseStatistics,
} from "../../interfaces/parser-result.interface.js";

const LANGUAGE_STOPWORDS: Readonly<Record<string, readonly string[]>> = {
  en: ["the", "and", "is", "to", "of", "in", "that", "we", "for", "are", "by", "with", "can", "from", "this", "it"],
  es: ["el", "la", "los", "las", "y", "de", "que", "en", "un", "una", "por", "con", "para", "es", "se", "su", "lo"],
  de: ["der", "die", "das", "und", "ist", "zu", "den", "fur", "mit", "sich", "auf", "ein", "eine", "nicht", "auch"],
  fr: ["le", "la", "les", "et", "de", "que", "un", "une", "est", "pour", "dans", "ce", "son", "sur", "avec", "pas"],
  ru: ["и", "в", "не", "на", "я", "с", "что", "а", "то", "все", "он", "как", "это", "по", "но", "мы"],
};

export function detectLanguage(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.trim().length < 20) {
    return null;
  }

  let best: string | null = null;
  let bestScore = 0;

  for (const [lang, words] of Object.entries(LANGUAGE_STOPWORDS)) {
    let score = 0;
    for (const word of words) {
      const matches = lower.match(new RegExp(`\\b${word}\\b`, "g"));
      if (matches !== null) {
        score += matches.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = lang;
    }
  }

  return bestScore >= 4 ? best : null;
}

export function computeStatistics(params: {
  text: string;
  sectionCount: number;
  headingCount: number;
  tableCount: number;
}): ParseStatistics {
  const trimmed = params.text.trim();

  const characterCount = params.text.length;
  const wordCount = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  const lineCount = params.text.length === 0 ? 0 : params.text.split(/\r\n|\r|\n/).length;
  const paragraphCount =
    trimmed.length === 0 ? 0 : trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

  return {
    characterCount,
    wordCount,
    lineCount,
    paragraphCount,
    sectionCount: params.sectionCount,
    headingCount: params.headingCount,
    tableCount: params.tableCount,
  };
}

export function buildSections(text: string, headings: readonly ParsedHeading[]): readonly ParsedSection[] {
  if (headings.length === 0) {
    return [
      {
        id: "sec-0",
        title: null,
        level: null,
        text: text.trim(),
        startIndex: 0,
        endIndex: text.length,
      },
    ];
  }

  const sections: ParsedSection[] = [];

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    if (heading === undefined) {
      continue;
    }
    const fallbackStart = heading.position < text.length ? heading.position : 0;
    const start = text.indexOf(heading.text, fallbackStart);
    const startIndex = start === -1 ? fallbackStart : start;

    const next = headings[i + 1];
    const endIndex = next === undefined ? text.length : Math.max(text.indexOf(next.text, next.position), startIndex + 1);

    const slice = text.slice(startIndex, endIndex === -1 ? text.length : endIndex).trim();

    sections.push({
      id: `sec-${String(i)}`,
      title: heading.text,
      level: heading.level,
      text: slice,
      startIndex,
      endIndex: endIndex === -1 ? text.length : endIndex,
    });
  }

  return sections;
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&[a-z]+;/gi, " ");
}
