import type { Prompt } from "./prompt.interface.js";
import type { PromptCategory } from "./prompt-category.enum.js";
import type { PromptStatus } from "./prompt-status.enum.js";
import type { PromptValidationResult } from "./prompt-validator.interface.js";

export type PromptVariables = Record<string, string>;

export interface RenderedPrompt {
  readonly id: string;
  readonly content: string;
  readonly version: string;
  readonly metadata: {
    readonly name: string;
    readonly description: string;
    readonly variables: readonly string[];
  };
}

export const PROMPT_MANAGER = "PROMPT_MANAGER";

export interface PromptManager {
  get(id: string, version?: string): Promise<Prompt | null>;
  render(
    id: string,
    variables: PromptVariables,
    version?: string,
  ): Promise<RenderedPrompt | null>;
  exists(id: string): Promise<boolean>;
  list(): Promise<readonly Prompt[]>;
  listByCategory(category: PromptCategory): Promise<readonly Prompt[]>;
  listByStatus(status: PromptStatus): Promise<readonly Prompt[]>;
  validate(id: string, version?: string): Promise<PromptValidationResult>;
  getLatestVersion(id: string): Promise<string | null>;
}
