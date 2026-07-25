export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface ValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface PromptValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationWarning[];
}

export interface SchemaValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface TemplateValidator {
  validateTemplates(system?: string, user?: string, assistant?: string): PromptValidationResult;
  validateVariables(template: string, variables: readonly string[]): PromptValidationResult;
  validateSchema(data: unknown, schema: Record<string, unknown>): SchemaValidationResult;
  validateJsonSchema(schema: unknown): SchemaValidationResult;
}

export const PROMPT_VALIDATOR_LIBRARY = "PROMPT_VALIDATOR_LIBRARY";
