import type { Prompt } from "./prompt.interface.js";

export const PROMPT_CACHE = "PROMPT_CACHE";

export interface PromptCache {
  get(id: string, version: string): Promise<Prompt | null>;
  set(id: string, version: string, prompt: Prompt): Promise<void>;
  invalidate(id: string): Promise<void>;
  invalidateAll(): Promise<void>;
  has(id: string, version: string): Promise<boolean>;
  size(): Promise<number>;
}
