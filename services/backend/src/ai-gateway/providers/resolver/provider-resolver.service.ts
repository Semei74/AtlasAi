import { Injectable, Inject } from "@nestjs/common";
import { NotFoundError } from "@atlas/errors";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderResolver } from "./provider-resolver.interface.js";
import { PROVIDER_REGISTRY } from "../registry/provider-registry.interface.js";
import type { ProviderRegistry } from "../registry/provider-registry.interface.js";
import { PROVIDER_FACTORY } from "../factory/provider-factory.interface.js";
import type { ProviderFactory } from "../factory/provider-factory.interface.js";

@Injectable()
export class ProviderResolverService implements ProviderResolver {
  public constructor(
    @Inject(PROVIDER_REGISTRY) private readonly registry: ProviderRegistry,
    @Inject(PROVIDER_FACTORY) private readonly factory: ProviderFactory,
  ) {}

  public resolve(name: string): AiProvider {
    const existing = this.registry.get(name);

    if (existing !== null) {
      return existing;
    }

    if (!this.factory.supports(name)) {
      throw new NotFoundError("Provider", name);
    }

    return this.factory.create(name);
  }
}
