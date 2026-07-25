import type { Prompt } from "./prompt.interface.js";
import type { PromptCategory } from "./prompt-category.enum.js";

export const PROMPT_LOADER = "PROMPT_LOADER";

export interface PromptLoader {
  load(id: string, version?: string): Promise<Prompt | null>;
  exists(id: string): Promise<boolean>;
  list(): Promise<readonly Prompt[]>;
  listByCategory(category: PromptCategory): Promise<readonly Prompt[]>;
  getLatestVersion(id: string): Promise<string | null>;
  getVersion(id: string, version: string): Promise<Prompt | null>;
}
