import type {
  PromptDefinition,
  PromptScope,
  PromptVariable,
  PromptMergeResult,
  PromptValidationResult,
  PromptValidationError,
  PromptContext,
  PromptPreview,
} from './types';

export class PromptRuntime {
  private prompts: Map<string, PromptDefinition> = new Map();
  private cache: Map<string, { result: string; timestamp: number }> = new Map();
  private maxCacheAge: number = 5 * 60 * 1000;

  register(prompt: PromptDefinition): void {
    this.prompts.set(prompt.id, prompt);
  }

  unregister(id: string): void {
    this.prompts.delete(id);
    this.cache.delete(id);
  }

  get(id: string): PromptDefinition | undefined {
    return this.prompts.get(id);
  }

  getByScope(scope: PromptScope): PromptDefinition[] {
    return Array.from(this.prompts.values()).filter((p) => p.scope === scope);
  }

  getAll(): PromptDefinition[] {
    return Array.from(this.prompts.values());
  }

  merge(context: PromptContext): PromptMergeResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    const resolvedVariables: Record<string, string> = {};

    let content = '';

    if (context.systemPrompt) {
      content += context.systemPrompt + '\n\n';
    }

    if (context.workspacePrompt) {
      content += context.workspacePrompt + '\n\n';
    }

    if (context.projectPrompt) {
      content += context.projectPrompt + '\n\n';
    }

    if (context.conversationPrompt) {
      content += context.conversationPrompt + '\n\n';
    }

    content += context.userPrompt;

    const variableRegex = /\{\{(\w+)\}\}/g;
    const usedVariables = new Set<string>();
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      usedVariables.add(match[1]);
    }

    for (const varName of usedVariables) {
      warnings.push(`Unresolved variable: {{${varName}}}`);
    }

    return {
      content,
      variables: resolvedVariables,
      warnings,
      errors,
    };
  }

  render(promptId: string, variables: Record<string, string>): PromptMergeResult {
    const prompt = this.prompts.get(promptId);
    if (!prompt) {
      return {
        content: '',
        variables: {},
        warnings: [],
        errors: [`Prompt ${promptId} not found`],
      };
    }

    return this.renderTemplate(prompt.template, prompt.variables, variables);
  }

  renderTemplate(
    template: string,
    definedVariables: PromptVariable[],
    providedValues: Record<string, string>,
  ): PromptMergeResult {
    const warnings: string[] = [];
    const errors: PromptValidationError[] = [];
    const resolved: Record<string, string> = {};

    let content = template;

    const variableMap = new Map(definedVariables.map((v) => [v.key, v]));

    for (const variable of definedVariables) {
      const value = providedValues[variable.key];

      if (!value && variable.required) {
        if (variable.defaultValue) {
          resolved[variable.key] = variable.defaultValue;
        } else {
          errors.push({
            field: variable.key,
            message: `Required variable {{${variable.key}}} is missing`,
            code: 'missing_required',
          });
          continue;
        }
      } else if (!value) {
        if (variable.defaultValue) {
          resolved[variable.key] = variable.defaultValue;
        } else {
          resolved[variable.key] = '';
        }
      } else {
        if (variable.validation) {
          const validationError = this.validateVariable(variable, value);
          if (validationError) {
            errors.push(validationError);
          }
        }
        resolved[variable.key] = value;
      }

      content = content.replace(
        new RegExp(`\\{\\{${variable.key}\\}\\}`, 'g'),
        resolved[variable.key] ?? '',
      );
    }

    const unresolvedRegex = /\{\{(\w+)\}\}/g;
    let unresolvedMatch;
    while ((unresolvedMatch = unresolvedRegex.exec(content)) !== null) {
      if (!variableMap.has(unresolvedMatch[1])) {
        warnings.push(`Unknown variable {{${unresolvedMatch[1]}}} in template`);
      }
    }

    return {
      content,
      variables: resolved,
      warnings,
      errors: errors.map((e) => e.message),
    };
  }

  validate(promptId: string, variables: Record<string, string>): PromptValidationResult {
    const prompt = this.prompts.get(promptId);
    if (!prompt) {
      return {
        valid: false,
        errors: [{ field: 'prompt', message: `Prompt ${promptId} not found`, code: 'missing_required' }],
        warnings: [],
        unresolvedVariables: [],
      };
    }

    return this.validateTemplate(prompt.variables, variables);
  }

  validateTemplate(
    definedVariables: PromptVariable[],
    providedValues: Record<string, string>,
  ): PromptValidationResult {
    const errors: PromptValidationError[] = [];
    const warnings: string[] = [];
    const unresolvedVariables: string[] = [];

    for (const variable of definedVariables) {
      const value = providedValues[variable.key];

      if (!value && variable.required) {
        errors.push({
          field: variable.key,
          message: `Required variable {{${variable.key}}} is missing`,
          code: 'missing_required',
        });
        continue;
      }

      if (value) {
        if (variable.validation) {
          const validationError = this.validateVariable(variable, value);
          if (validationError) {
            errors.push(validationError);
          }
        }
      }
    }

    const extraKeys = Object.keys(providedValues).filter(
      (k) => !definedVariables.find((v) => v.key === k),
    );
    for (const key of extraKeys) {
      warnings.push(`Variable {{${key}}} is not defined in prompt schema`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      unresolvedVariables,
    };
  }

  private validateVariable(
    variable: PromptVariable,
    value: string,
  ): PromptValidationError | null {
    const v = variable.validation;
    if (!v) return null;

    if (v.minLength !== undefined && value.length < v.minLength) {
      return {
        field: variable.key,
        message: `{{${variable.key}}} must be at least ${v.minLength} characters`,
        code: 'validation_failed',
      };
    }

    if (v.maxLength !== undefined && value.length > v.maxLength) {
      return {
        field: variable.key,
        message: `{{${variable.key}}} must be at most ${v.maxLength} characters`,
        code: 'validation_failed',
      };
    }

    if (v.pattern && !new RegExp(v.pattern).test(value)) {
      return {
        field: variable.key,
        message: `{{${variable.key}}} does not match required pattern`,
        code: 'validation_failed',
      };
    }

    if (variable.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        return {
          field: variable.key,
          message: `{{${variable.key}}} must be a number`,
          code: 'type_mismatch',
        };
      }
      if (v.min !== undefined && num < v.min) {
        return {
          field: variable.key,
          message: `{{${variable.key}}} must be at least ${v.min}`,
          code: 'validation_failed',
        };
      }
      if (v.max !== undefined && num > v.max) {
        return {
          field: variable.key,
          message: `{{${variable.key}}} must be at most ${v.max}`,
          code: 'validation_failed',
        };
      }
    }

    if (variable.type === 'select' && variable.options && !variable.options.includes(value)) {
      return {
        field: variable.key,
        message: `{{${variable.key}}} must be one of: ${variable.options.join(', ')}`,
        code: 'validation_failed',
      };
    }

    return null;
  }

  preview(promptId: string, variables: Record<string, string>): PromptPreview {
    const prompt = this.prompts.get(promptId);
    if (!prompt) {
      return { content: '', variables: {}, warnings: [`Prompt ${promptId} not found`] };
    }

    const result = this.renderTemplate(prompt.template, prompt.variables, variables);
    return {
      content: result.content,
      variables: result.variables,
      warnings: result.warnings,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  destroy(): void {
    this.prompts.clear();
    this.cache.clear();
  }
}
