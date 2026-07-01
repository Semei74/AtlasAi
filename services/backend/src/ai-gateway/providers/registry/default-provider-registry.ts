import { Injectable } from "@nestjs/common";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderRegistry } from "./provider-registry.interface.js";

@Injectable()
export class DefaultProviderRegistry implements ProviderRegistry {
  private readonly providers = new Map<string, AiProvider>();

  public register(name: string, provider: AiProvider): void {
    this.providers.set(name, provider);
  }

  public get(name: string): AiProvider | null {
    return this.providers.get(name) ?? null;
  }

  public has(name: string): boolean {
    return this.providers.has(name);
  }

  public getAll(): ReadonlyMap<string, AiProvider> {
    return this.providers;
  }
}
