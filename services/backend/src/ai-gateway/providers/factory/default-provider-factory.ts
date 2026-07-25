import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { NotFoundError } from "@atlas/errors";
import type { AiProvider } from "../interfaces/ai-provider.interface.js";
import type { ProviderFactory } from "./provider-factory.interface.js";
import { PROVIDER_REGISTRY } from "../registry/provider-registry.interface.js";
import type { ProviderRegistry } from "../registry/provider-registry.interface.js";
import { PROVIDER_STUB } from "../stub/provider-stub.js";
import { PROVIDER_OPENAI } from "../openai/openai.provider.js";
import { PROVIDER_ANTHROPIC } from "../anthropic/anthropic.provider.js";
import { PROVIDER_GEMINI } from "../gemini/gemini.provider.js";
import { PROVIDER_OPENROUTER } from "../openrouter/openrouter.provider.js";
import { PROVIDER_DEEPSEEK } from "../deepseek/deepseek.provider.js";
import { PROVIDER_MISTRAL } from "../mistral/mistral.provider.js";
import { PROVIDER_GROQ } from "../groq/groq.provider.js";
import { PROVIDER_XAI } from "../xai/xai.provider.js";
import { PROVIDER_OLLAMA } from "../ollama/ollama.provider.js";

type FactoryProviders = Record<string, AiProvider>;

@Injectable()
export class DefaultProviderFactory implements ProviderFactory, OnModuleInit {
  private readonly providers: FactoryProviders;

  public constructor(
    @Inject(PROVIDER_REGISTRY) private readonly registry: ProviderRegistry,
    @Inject(PROVIDER_STUB) stub: AiProvider,
    @Inject(PROVIDER_OPENAI) openai: AiProvider,
    @Inject(PROVIDER_ANTHROPIC) anthropic: AiProvider,
    @Inject(PROVIDER_GEMINI) gemini: AiProvider,
    @Inject(PROVIDER_OPENROUTER) openrouter: AiProvider,
    @Inject(PROVIDER_DEEPSEEK) deepseek: AiProvider,
    @Inject(PROVIDER_MISTRAL) mistral: AiProvider,
    @Inject(PROVIDER_GROQ) groq: AiProvider,
    @Inject(PROVIDER_XAI) xai: AiProvider,
    @Inject(PROVIDER_OLLAMA) ollama: AiProvider,
  ) {
    this.providers = {
      stub,
      openai,
      anthropic,
      gemini,
      openrouter,
      deepseek,
      mistral,
      groq,
      xai,
      ollama,
    };
  }

  public create(name: string): AiProvider {
    const provider = this.providers[name];

    if (provider === undefined) {
      throw new NotFoundError("Provider", name);
    }

    this.registry.register(name, provider);
    return provider;
  }

  public supports(name: string): boolean {
    return name in this.providers;
  }

  public async onModuleInit(): Promise<void> {
    for (const [name, provider] of Object.entries(this.providers)) {
      this.registry.register(name, provider);
    }

    await this.registry.initializeAll();
  }
}
