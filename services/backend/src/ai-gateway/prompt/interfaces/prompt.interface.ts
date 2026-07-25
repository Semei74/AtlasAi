import type { PromptCategory } from "./prompt-category.enum.js";
import type { PromptStatus } from "./prompt-status.enum.js";
import type { PromptMetadata } from "./prompt-metadata.interface.js";

export interface Prompt {
  readonly id: string;
  readonly category: PromptCategory;
  readonly status: PromptStatus;
  readonly content: string;
  readonly metadata: PromptMetadata;
}
