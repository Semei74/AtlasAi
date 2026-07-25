import { Injectable } from "@nestjs/common";
import type { Prompt } from "../interfaces/prompt.interface.js";
import type { PromptValidationResult } from "../interfaces/prompt-validator.interface.js";
import type { PromptValidator } from "../interfaces/prompt-validator.interface.js";
import { PROMPT_METADATA_REQUIRED_FIELDS } from "../interfaces/prompt-metadata.interface.js";

const PLACEHOLDER_PATTERN = /\{\{(.+?)\}\}/g;
const VALID_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9._-]{0,127}$/;
const VALID_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

@Injectable()
export class PromptValidatorService implements PromptValidator {
  public async validate(prompt: Prompt): Promise<PromptValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const idResult = await this.validateId(prompt.id);
    errors.push(...idResult.errors);
    warnings.push(...idResult.warnings);

    const contentResult = await this.validateContent(prompt.content);
    errors.push(...contentResult.errors);
    warnings.push(...contentResult.warnings);

    this.validateMetadata(prompt, errors, warnings);

    const varResult = await this.validateVariables(
      prompt.content,
      prompt.metadata.variables,
    );
    errors.push(...varResult.errors);
    warnings.push(...varResult.warnings);

    return { valid: errors.length === 0, errors, warnings };
  }

  public validateId(id: string): Promise<PromptValidationResult> {
    const errors: string[] = [];

    if (id.length === 0) {
      errors.push("Prompt ID must not be empty");
    } else if (!VALID_ID_PATTERN.test(id)) {
      errors.push(
        `Invalid prompt ID "${id}". IDs must start with a letter and contain only letters, digits, dots, hyphens, and underscores (max 128 chars).`,
      );
    }

    return Promise.resolve({ valid: errors.length === 0, errors, warnings: [] });
  }

  public validateContent(content: string): Promise<PromptValidationResult> {
    const errors: string[] = [];

    if (content.length === 0) {
      errors.push("Prompt content must not be empty");
    }

    if (content.length > 100_000) {
      errors.push("Prompt content exceeds maximum length of 100,000 characters");
    }

    return Promise.resolve({ valid: errors.length === 0, errors, warnings: [] });
  }

  public validateVariables(
    content: string,
    expectedVariables: readonly string[],
  ): Promise<PromptValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const usedPlaceholders = new Set<string>();
    let match: RegExpExecArray | null;

    const re = new RegExp(PLACEHOLDER_PATTERN.source, "g");
    while ((match = re.exec(content)) !== null) {
      const captured = match[1];
      if (captured !== undefined) {
        usedPlaceholders.add(captured.trim());
      }
    }

    const expectedSet = new Set(expectedVariables);

    for (const placeholder of usedPlaceholders) {
      if (!expectedSet.has(placeholder)) {
        warnings.push(
          `Placeholder "{{${placeholder}}}" is used in content but not declared in metadata.variables`,
        );
      }
    }

    for (const variable of expectedVariables) {
      if (!usedPlaceholders.has(variable)) {
        warnings.push(
          `Variable "${variable}" is declared in metadata.variables but not used in content`,
        );
      }
    }

    return Promise.resolve({ valid: errors.length === 0, errors, warnings });
  }

  private validateMetadata(
    prompt: Prompt,
    errors: string[],
    warnings: string[],
  ): void {
    for (const field of PROMPT_METADATA_REQUIRED_FIELDS) {
      const value = prompt.metadata[field];

      if (value === "") {
        errors.push(`Required metadata field "${field}" is missing or empty`);
      }
    }

    if (!VALID_VERSION_PATTERN.test(prompt.metadata.version)) {
      errors.push(
        `Invalid version "${prompt.metadata.version}". Versions must follow semver (e.g., "1.0.0").`,
      );
    }

    if (prompt.metadata.variables.length > 100) {
      warnings.push("Prompt declares more than 100 variables");
    }

    if (prompt.metadata.tags.length > 50) {
      warnings.push("Prompt has more than 50 tags");
    }
  }
}
