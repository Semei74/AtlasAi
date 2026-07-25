import type { Prompt } from "./prompt.interface.js";

export const PROMPT_VALIDATOR = "PROMPT_VALIDATOR";

export interface PromptValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface PromptValidator {
  validate(prompt: Prompt): Promise<PromptValidationResult>;
  validateId(id: string): Promise<PromptValidationResult>;
  validateContent(content: string): Promise<PromptValidationResult>;
  validateVariables(
    content: string,
    expectedVariables: readonly string[],
  ): Promise<PromptValidationResult>;
}
