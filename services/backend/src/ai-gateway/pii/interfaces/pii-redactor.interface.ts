export interface PiiPattern {
  readonly name: string;
  readonly pattern: RegExp;
  readonly replacement: string;
}

export interface PiiRedactionResult {
  readonly text: string;
  readonly redactedFields: readonly string[];
  readonly redactionCount: number;
}

export interface PiiRedactor {
  redact(text: string): PiiRedactionResult;
  addPattern(pattern: PiiPattern): void;
  getPatterns(): readonly PiiPattern[];
}

export const PII_REDACTOR = "PII_REDACTOR";
