export type ModerationCategory =
  | "hate"
  | "harassment"
  | "self_harm"
  | "sexual"
  | "violence"
  | "illegal"
  | "personal_info"
  | "spam";

export interface ModerationResult {
  readonly flagged: boolean;
  readonly categories: Record<ModerationCategory, boolean>;
  readonly scores: Record<ModerationCategory, number>;
  readonly modelUsed: string | null;
}

export interface ModerationProvider {
  readonly moderate: (input: string) => Promise<ModerationResult>;
  readonly moderateBatch: (inputs: readonly string[]) => Promise<readonly ModerationResult[]>;
}
