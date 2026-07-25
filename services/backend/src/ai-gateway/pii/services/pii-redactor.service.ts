import { Injectable } from "@nestjs/common";
import type { PiiPattern, PiiRedactionResult, PiiRedactor } from "../interfaces/pii-redactor.interface.js";

const DEFAULT_PATTERNS: readonly PiiPattern[] = [
  { name: "email", pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: "[REDACTED_EMAIL]" },
  { name: "phone", pattern: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: "[REDACTED_PHONE]" },
  { name: "ssn", pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[REDACTED_SSN]" },
  { name: "credit_card", pattern: /\b(?:\d{4}[-.\s]?){3}\d{4}\b/g, replacement: "[REDACTED_CARD]" },
  { name: "iban", pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g, replacement: "[REDACTED_IBAN]" },
  { name: "ip_address", pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: "[REDACTED_IP]" },
  { name: "api_key", pattern: /\b(?:sk-[A-Za-z0-9]{20,}|[A-Za-z0-9]{32,}|Bearer\s+[A-Za-z0-9._-]+)\b/g, replacement: "[REDACTED_KEY]" },
  { name: "password", pattern: /(?:password|passwd|pwd|secret|token)\s*[:=]\s*\S+/gi, replacement: "[REDACTED_CREDENTIAL]" },
  { name: "authorization_header", pattern: /(Authorization|X-API-Key):\s*\S+/gi, replacement: "$1: [REDACTED]" },
  { name: "jwt_token", pattern: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, replacement: "[REDACTED_JWT]" },
];

@Injectable()
export class PiiRedactorService implements PiiRedactor {
  private readonly patterns: PiiPattern[];

  public constructor() {
    this.patterns = [...DEFAULT_PATTERNS];
  }

  public redact(text: string): PiiRedactionResult {
    const redactedFieldsSet = new Set<string>();
    let redactedCount = 0;
    let result = text;

    for (const piiPattern of this.patterns) {
      const matches = result.match(piiPattern.pattern);

      if (matches !== null && matches.length > 0) {
        redactedFieldsSet.add(piiPattern.name);
        redactedCount += matches.length;
        result = result.replace(piiPattern.pattern, piiPattern.replacement);
      }
    }

    return {
      text: result,
      redactedFields: [...redactedFieldsSet],
      redactionCount: redactedCount,
    };
  }

  public addPattern(pattern: PiiPattern): void {
    this.patterns.push(pattern);
  }

  public getPatterns(): readonly PiiPattern[] {
    return [...this.patterns];
  }
}
