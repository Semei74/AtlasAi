import { Injectable, Inject } from "@nestjs/common";
import type { Prompt } from "../interfaces/prompt.interface.js";
import type { PromptCategory } from "../interfaces/prompt-category.enum.js";
import type { PromptStatus } from "../interfaces/prompt-status.enum.js";
import type {
  PromptManager,
  PromptVariables,
  RenderedPrompt,
} from "../interfaces/prompt-manager.interface.js";
import type { PromptValidationResult } from "../interfaces/prompt-validator.interface.js";
import { PROMPT_LOADER } from "../interfaces/prompt-loader.interface.js";
import type { PromptLoader } from "../interfaces/prompt-loader.interface.js";
import { PROMPT_CACHE } from "../interfaces/prompt-cache.interface.js";
import type { PromptCache } from "../interfaces/prompt-cache.interface.js";
import { PROMPT_VALIDATOR } from "../interfaces/prompt-validator.interface.js";
import type { PromptValidator } from "../interfaces/prompt-validator.interface.js";

const DEFAULT_PLACEHOLDERS: Record<string, () => string> = {
  today: () => new Date().toISOString().split("T")[0] ?? "",
};

@Injectable()
export class PromptManagerService implements PromptManager {
  public constructor(
    @Inject(PROMPT_LOADER) private readonly loader: PromptLoader,
    @Inject(PROMPT_CACHE) private readonly cache: PromptCache,
    @Inject(PROMPT_VALIDATOR) private readonly validator: PromptValidator,
  ) {}

  public async get(id: string, version?: string): Promise<Prompt | null> {
    const resolvedVersion = version ?? (await this.loader.getLatestVersion(id));

    if (resolvedVersion === null) {
      return null;
    }

    const cached = await this.cache.get(id, resolvedVersion);

    if (cached !== null) {
      return cached;
    }

    const prompt = await this.loader.load(id, resolvedVersion);

    if (prompt !== null) {
      await this.cache.set(id, resolvedVersion, prompt);
    }

    return prompt;
  }

  public async render(
    id: string,
    variables: PromptVariables,
    version?: string,
  ): Promise<RenderedPrompt | null> {
    const prompt = await this.get(id, version);

    if (prompt === null) {
      return null;
    }

    const rendered = this.injectVariables(prompt.content, variables);

    return {
      id: prompt.id,
      content: rendered,
      version: prompt.metadata.version,
      metadata: {
        name: prompt.metadata.name,
        description: prompt.metadata.description,
        variables: prompt.metadata.variables,
      },
    };
  }

  public async exists(id: string): Promise<boolean> {
    return this.loader.exists(id);
  }

  public async list(): Promise<readonly Prompt[]> {
    return this.loader.list();
  }

  public async listByCategory(category: PromptCategory): Promise<readonly Prompt[]> {
    return this.loader.listByCategory(category);
  }

  public async listByStatus(status: PromptStatus): Promise<readonly Prompt[]> {
    const all = await this.loader.list();

    return all.filter((p) => p.status === status);
  }

  public async validate(id: string, version?: string): Promise<PromptValidationResult> {
    const prompt = await this.get(id, version);

    if (prompt === null) {
      return {
        valid: false,
        errors: [`Prompt "${id}" not found`],
        warnings: [],
      };
    }

    return this.validator.validate(prompt);
  }

  public async getLatestVersion(id: string): Promise<string | null> {
    return this.loader.getLatestVersion(id);
  }

  private injectVariables(content: string, variables: PromptVariables): string {
    let result = content;

    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, "g");
      result = result.replace(pattern, this.sanitizeValue(value));
    }

    for (const [key, factory] of Object.entries(DEFAULT_PLACEHOLDERS)) {
      const pattern = new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, "g");
      result = result.replace(pattern, factory());
    }

    return result;
  }

  private sanitizeValue(value: string): string {
    return value
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

function escapeRegex(str: string): string {
  return str.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
