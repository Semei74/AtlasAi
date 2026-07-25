export interface TemplateEngineConfig {
  readonly strictMode: boolean;
  readonly noEscape: boolean;
  readonly maxLength: number;
  readonly maxRecursionDepth: number;
}

export interface TemplateRenderResult {
  readonly content: string;
  readonly usedVariables: readonly string[];
  readonly missingVariables: readonly string[];
  readonly unknownVariables: readonly string[];
}

export interface TemplateValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly variables: readonly string[];
  readonly usedPartials: readonly string[];
}

export interface TemplateEngine {
  readonly config: TemplateEngineConfig;
  compile(template: string): CompiledTemplate;
  render(template: string, variables: Record<string, unknown>): TemplateRenderResult;
  validate(template: string): TemplateValidationResult;
  extractVariables(template: string): readonly string[];
}

export interface CompiledTemplate {
  render(variables: Record<string, unknown>): string;
  variables: readonly string[];
}

export const TEMPLATE_ENGINE = "TEMPLATE_ENGINE";
