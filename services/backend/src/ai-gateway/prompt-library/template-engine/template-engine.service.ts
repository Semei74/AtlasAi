import { ValidationError } from "@atlas/errors";
import { Injectable } from "@nestjs/common";
import Handlebars from "handlebars";
import { createHash } from "node:crypto";
import type { CompiledTemplate, TemplateEngine, TemplateEngineConfig, TemplateRenderResult, TemplateValidationResult } from "../interfaces/template-engine.interface.js";

const DEFAULT_CONFIG: TemplateEngineConfig = {
  strictMode: true,
  noEscape: false,
  maxLength: 1000000,
  maxRecursionDepth: 5,
};

@Injectable()
export class TemplateEngineService implements TemplateEngine {
  public readonly config: TemplateEngineConfig;

  public constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  public compile(template: string): CompiledTemplate {
    if (template.length > this.config.maxLength) {
      throw new ValidationError(`Template exceeds maximum length of ${String(this.config.maxLength)} characters`);
    }

    const depth = this.#checkDepth(template);
    if (depth > this.config.maxRecursionDepth) {
      throw new ValidationError(`Template exceeds maximum recursion depth of ${String(this.config.maxRecursionDepth)}`);
    }

    const templateFn = Handlebars.compile(template, {
      strict: this.config.strictMode,
      noEscape: this.config.noEscape,
      preventIndent: true,
    });

    const variables = this.extractVariables(template);

    return {
      render: (vars: Record<string, unknown>): string => {
        return templateFn(vars);
      },
      variables,
    };
  }

  public render(template: string, variables: Record<string, unknown>): TemplateRenderResult {
    const usedVariables: string[] = [];
    const missingVariables: string[] = [];
    const unknownVariables: string[] = [];

    const allVariables = this.extractVariables(template);
    const inputKeys = Object.keys(variables);

    for (const v of allVariables) {
      if (v in variables) {
        usedVariables.push(v);
      } else {
        missingVariables.push(v);
      }
    }

    for (const key of inputKeys) {
      if (!allVariables.includes(key)) {
        unknownVariables.push(key);
      }
    }

    const compiled = this.compile(template);
    const content = compiled.render(variables);

    return { content, usedVariables, missingVariables, unknownVariables };
  }

  public validate(template: string): TemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      Handlebars.parse(template);

      const depth = this.#checkDepth(template);
      if (depth > this.config.maxRecursionDepth) {
        warnings.push(`Template recursion depth (${String(depth)}) exceeds maximum of ${String(this.config.maxRecursionDepth)}`);
      }

      const variables = this.extractVariables(template);
      const usedPartials: string[] = [];

      const knownPartials: string[] = [];

      for (const v of variables) {
        if (v.startsWith(">") && knownPartials.includes(v.slice(1))) {
          usedPartials.push(v.slice(1));
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        variables,
        usedPartials,
      };
    } catch (error: unknown) {
      errors.push(error instanceof Error ? error.message : "Template parse error");
      return {
        valid: false,
        errors,
        warnings,
        variables: [],
        usedPartials: [],
      };
    }
  }

  public extractVariables(template: string): readonly string[] {
    const variables = new Set<string>();
    const regex = /\{\{([#/^>]?\s*[\w.]+)\s*(.*?)\}\}/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(template)) !== null) {
      const name = match[1]?.trim() ?? "";
      const cleaned = name.replace(/^[#/^>]/, "").trim();

      if (cleaned.length > 0 && !cleaned.startsWith("!")) {
        variables.add(cleaned);
      }
    }

    return [...variables];
  }

  #checkDepth(template: string): number {
    const ast = Handlebars.parse(template) as unknown as Record<string, unknown>;
    const body = ast["body"] as Record<string, unknown>[] | undefined;

    if (!Array.isArray(body)) return 0;

    let maxDepth = 0;
    for (const item of body) {
      maxDepth = Math.max(maxDepth, this.#countBlockDepth(item, 0));
    }
    return maxDepth;
  }

  #countBlockDepth(node: Record<string, unknown>, depth: number): number {
    const nodeType = node["type"] as string | undefined;

    if (nodeType === "BlockStatement") {
      let maxDepth = depth;
      const program = node["program"] as Record<string, unknown> | undefined;
      const inverse = node["inverse"] as Record<string, unknown> | undefined;

      if (program !== undefined) {
        const programBody = program["body"] as Record<string, unknown>[] | undefined;
        if (Array.isArray(programBody)) {
          for (const child of programBody) {
            maxDepth = Math.max(maxDepth, this.#countBlockDepth(child, depth + 1));
          }
        }
      }

      if (inverse !== undefined) {
        const inverseBody = inverse["body"] as Record<string, unknown>[] | undefined;
        if (Array.isArray(inverseBody)) {
          for (const child of inverseBody) {
            maxDepth = Math.max(maxDepth, this.#countBlockDepth(child, depth + 1));
          }
        }
      }

      return maxDepth;
    }

    return depth;
  }

  public createChecksum(template: string): string {
    return createHash("sha256").update(template).digest("hex");
  }
}
