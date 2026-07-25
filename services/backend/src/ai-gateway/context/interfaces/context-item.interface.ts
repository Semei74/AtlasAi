import type { ContextSourceType } from "./context-source-type.enum.js";

export interface ContextItem {
  readonly id: string;
  readonly sourceType: ContextSourceType;
  readonly content: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly tokenCount: number;
  readonly priority: number;
  readonly score: number;
  readonly freshness: Date;
  readonly permissions: readonly string[];
}
