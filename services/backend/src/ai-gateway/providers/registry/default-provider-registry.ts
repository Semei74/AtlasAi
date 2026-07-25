import { Injectable } from "@nestjs/common";
import { NotFoundError } from "@atlas/errors";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderHealth } from "../interfaces/provider-health.interface.js";
import type { ProviderMetadata } from "../interfaces/provider-metadata.interface.js";
import type { ProviderRegistry } from "./provider-registry.interface.js";
import type {
  ProviderCapabilityKey,
  ProviderRegistration,
  ProviderRegistrationOptions,
} from "./provider-registration.interface.js";

@Injectable()
export class DefaultProviderRegistry implements ProviderRegistry {
  private readonly entries = new Map<string, ProviderRegistration>();

  public register(name: string, provider: AiProvider, options?: ProviderRegistrationOptions): void {
    this.entries.set(name, {
      name,
      provider,
      metadata: provider.metadata,
      enabled: options?.enabled ?? true,
      initialized: false,
      health: null,
      registeredAt: new Date(),
    });
  }

  public unregister(name: string): boolean {
    return this.entries.delete(name);
  }

  public get(name: string): AiProvider | null {
    return this.entries.get(name)?.provider ?? null;
  }

  public has(name: string): boolean {
    return this.entries.has(name);
  }

  public getAll(): ReadonlyMap<string, AiProvider> {
    const map = new Map<string, AiProvider>();

    this.entries.forEach((entry, name) => {
      map.set(name, entry.provider);
    });

    return map;
  }

  public getEntry(name: string): ProviderRegistration | null {
    return this.entries.get(name) ?? null;
  }

  public list(): readonly ProviderRegistration[] {
    return [...this.entries.values()];
  }

  public listEnabled(): readonly ProviderRegistration[] {
    return this.list().filter((entry) => entry.enabled);
  }

  public findByCapability(capability: ProviderCapabilityKey): readonly ProviderRegistration[] {
    return this.list().filter((entry) => entry.provider.capabilities[capability] === true);
  }

  public setEnabled(name: string, enabled: boolean): void {
    const entry = this.entries.get(name);

    if (entry === undefined) {
      throw new NotFoundError("Provider", name);
    }

    entry.enabled = enabled;
  }

  public isEnabled(name: string): boolean {
    return this.entries.get(name)?.enabled ?? false;
  }

  public getMetadata(name: string): ProviderMetadata | null {
    return this.entries.get(name)?.metadata ?? null;
  }

  public async initialize(name: string): Promise<void> {
    const entry = this.entries.get(name);

    if (entry === undefined) {
      throw new NotFoundError("Provider", name);
    }

    await entry.provider.initialize();
    entry.initialized = true;
  }

  public async initializeAll(): Promise<void> {
    await Promise.all(
      this.list().map(async (entry) => {
        try {
          await entry.provider.initialize();
          entry.initialized = true;

          try {
            entry.health = await entry.provider.health();
          } catch {
            entry.health = null;
          }
        } catch {
          entry.initialized = false;
        }
      }),
    );
  }

  public async getHealth(name: string): Promise<ProviderHealth | null> {
    const entry = this.entries.get(name);

    if (entry === undefined) {
      return null;
    }

    try {
      const health = await entry.provider.health();
      entry.health = health;

      return health;
    } catch {
      entry.health = null;

      return null;
    }
  }

  public async getHealthAll(): Promise<ReadonlyMap<string, ProviderHealth>> {
    const map = new Map<string, ProviderHealth>();

    await Promise.all(
      this.list().map(async (entry) => {
        const health = await this.getHealth(entry.name);

        if (health !== null) {
          map.set(entry.name, health);
        }
      }),
    );

    return map;
  }
}
