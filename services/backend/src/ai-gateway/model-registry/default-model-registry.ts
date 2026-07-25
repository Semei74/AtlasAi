import { ConflictError, ValidationError } from "@atlas/errors";
import { Injectable } from "@nestjs/common";
import type { ModelInfo } from "./interfaces/model-info.interface.js";
import type { ModelCapabilities } from "./interfaces/model-capabilities.interface.js";
import type { ModelRegistry } from "./interfaces/model-registry.interface.js";
import { STATIC_MODELS } from "./static-models.js";

@Injectable()
export class DefaultModelRegistry implements ModelRegistry {
  private readonly models = new Map<string, ModelInfo>();

  public constructor() {
    this.registerMany(STATIC_MODELS);
  }

  public register(info: ModelInfo): void {
    this.validate(info);
    const key = this.key(info.provider, info.id);

    if (this.models.has(key)) {
      throw new ConflictError(`Duplicate model: '${info.provider}/${info.id}' is already registered`);
    }

    this.models.set(key, info);
  }

  public registerMany(infos: readonly ModelInfo[]): void {
    for (const info of infos) {
      this.register(info);
    }
  }

  public get(provider: string, modelId: string): ModelInfo | null {
    return this.models.get(this.key(provider, modelId)) ?? null;
  }

  public has(provider: string, modelId: string): boolean {
    return this.models.has(this.key(provider, modelId));
  }

  public remove(provider: string, modelId: string): boolean {
    return this.models.delete(this.key(provider, modelId));
  }

  public list(): readonly ModelInfo[] {
    return Array.from(this.models.values());
  }

  public listByProvider(provider: string): readonly ModelInfo[] {
    return this.list().filter((m) => m.provider === provider);
  }

  public findByCapability(capability: Partial<ModelCapabilities>): readonly ModelInfo[] {
    return this.list().filter((m) => {
      for (const [key, value] of Object.entries(capability)) {
        if (m.capabilities[key as keyof ModelCapabilities] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  public findEnabled(): readonly ModelInfo[] {
    return this.list().filter((m) => m.enabled);
  }

  public findDeprecated(): readonly ModelInfo[] {
    return this.list().filter((m) => m.deprecated);
  }

  public clear(): void {
    this.models.clear();
  }

  private key(provider: string, modelId: string): string {
    return `${provider}:${modelId}`;
  }

  private validate(info: ModelInfo): void {
    if (info.id.trim() === "") {
      throw new ValidationError("Model validation failed: 'id' is required");
    }
    if (info.provider.trim() === "") {
      throw new ValidationError("Model validation failed: 'provider' is required");
    }
    if (info.displayName.trim() === "") {
      throw new ValidationError("Model validation failed: 'displayName' is required");
    }

    const { limits } = info;
    if (limits.contextWindow < 1) {
      throw new ValidationError(
        `Model validation failed: '${info.provider}/${info.id}' must have limits.contextWindow >= 1`,
      );
    }
    if (limits.maxOutputTokens < 1) {
      throw new ValidationError(
        `Model validation failed: '${info.provider}/${info.id}' must have limits.maxOutputTokens >= 1`,
      );
    }

    const { pricing } = info;
    if (pricing.inputPerToken < 0) {
      throw new ValidationError(
        `Model validation failed: '${info.provider}/${info.id}' must have pricing.inputPerToken >= 0`,
      );
    }
    if (pricing.outputPerToken < 0) {
      throw new ValidationError(
        `Model validation failed: '${info.provider}/${info.id}' must have pricing.outputPerToken >= 0`,
      );
    }
  }
}
