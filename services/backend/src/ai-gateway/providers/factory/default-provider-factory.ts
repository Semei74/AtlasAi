import { Injectable, Inject } from "@nestjs/common";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderFactory } from "./provider-factory.interface.js";
import { PROVIDER_REGISTRY } from "../registry/provider-registry.interface.js";
import type { ProviderRegistry } from "../registry/provider-registry.interface.js";
import { PROVIDER_STUB } from "../stub/provider-stub.js";

@Injectable()
export class DefaultProviderFactory implements ProviderFactory {
  public constructor(
    @Inject(PROVIDER_REGISTRY) private readonly registry: ProviderRegistry,
    @Inject(PROVIDER_STUB) private readonly stub: AiProvider,
  ) {}

  public create(name: string): AiProvider {
    switch (name) {
      case "stub":
        this.registry.register("stub", this.stub);
        return this.stub;
      default:
        throw new Error(`Unsupported provider: ${name}`);
    }
  }

  public supports(name: string): boolean {
    return name === "stub";
  }
}
