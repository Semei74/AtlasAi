import { describe, it, expect } from "vitest";
import { Test } from "@nestjs/testing";
import { AiGatewayModule } from "./ai-gateway.module.js";
import { AiGatewayService } from "./services/ai-gateway.service.js";
import { PrismaAiRequestRepository } from "./services/prisma-ai-request.repository.js";
import { AI_REQUEST_REPOSITORY } from "./interfaces/ai-request-repository.interface.js";
import type { AiRequestRepository } from "./interfaces/ai-request-repository.interface.js";
import { PROVIDER_REGISTRY } from "./providers/registry/provider-registry.interface.js";
import type { ProviderRegistry } from "./providers/registry/provider-registry.interface.js";
import { PROVIDER_FACTORY } from "./providers/factory/provider-factory.interface.js";
import type { ProviderFactory } from "./providers/factory/provider-factory.interface.js";
import { PROVIDER_RESOLVER } from "./providers/resolver/provider-resolver.interface.js";
import type { ProviderResolver } from "./providers/resolver/provider-resolver.interface.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { PROVIDER_STUB } from "./providers/stub/provider-stub.js";
import { PROVIDER_OPENAI } from "./providers/openai/openai.provider.js";
import { PROVIDER_ANTHROPIC } from "./providers/anthropic/anthropic.provider.js";
import { PROVIDER_GEMINI } from "./providers/gemini/gemini.provider.js";
import { PROVIDER_OPENROUTER } from "./providers/openrouter/openrouter.provider.js";
import { PROVIDER_DEEPSEEK } from "./providers/deepseek/deepseek.provider.js";
import { PROVIDER_MISTRAL } from "./providers/mistral/mistral.provider.js";
import { PROVIDER_GROQ } from "./providers/groq/groq.provider.js";
import { PROVIDER_XAI } from "./providers/xai/xai.provider.js";
import { PROVIDER_OLLAMA } from "./providers/ollama/ollama.provider.js";
import { OllamaClient } from "./providers/ollama/ollama.client.js";
import { MODEL_REGISTRY } from "./model-registry/interfaces/model-registry.interface.js";
import type { ModelRegistry } from "./model-registry/interfaces/model-registry.interface.js";
import type { AiProvider } from "./providers/interfaces/ai-provider.interface.js";
import { MetricsModule } from "../metrics/metrics.module.js";

const mockPrismaService = {
  aiRequest: {
    create: () => Promise.resolve({}),
    findMany: () => Promise.resolve([]),
  },
} as unknown as PrismaService;

const providerTokens = [
  { token: PROVIDER_STUB, name: "stub" },
  { token: PROVIDER_OPENAI, name: "openai" },
  { token: PROVIDER_ANTHROPIC, name: "anthropic" },
  { token: PROVIDER_GEMINI, name: "gemini" },
  { token: PROVIDER_OPENROUTER, name: "openrouter" },
  { token: PROVIDER_DEEPSEEK, name: "deepseek" },
  { token: PROVIDER_MISTRAL, name: "mistral" },
  { token: PROVIDER_GROQ, name: "groq" },
  { token: PROVIDER_XAI, name: "xai" },
  { token: PROVIDER_OLLAMA, name: "ollama" },
] as const;

function createModule() {
  return Test.createTestingModule({
    imports: [AiGatewayModule, MetricsModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrismaService)
    .compile();
}

describe("AiGatewayModule", () => {
  it("should provide AiGatewayService", async () => {
    const module = await createModule();

    const service = module.get<AiGatewayService>(AiGatewayService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AiGatewayService);
  });

  it("should provide PROVIDER_REGISTRY", async () => {
    const module = await createModule();

    const registry = module.get<ProviderRegistry>(PROVIDER_REGISTRY);
    expect(registry).toBeDefined();
  });

  it("should provide PROVIDER_FACTORY", async () => {
    const module = await createModule();

    const factory = module.get<ProviderFactory>(PROVIDER_FACTORY);
    expect(factory).toBeDefined();
  });

  it("should provide PROVIDER_RESOLVER", async () => {
    const module = await createModule();

    const resolver = module.get<ProviderResolver>(PROVIDER_RESOLVER);
    expect(resolver).toBeDefined();
  });

  describe("providers", () => {
    for (const { token, name } of providerTokens) {
      it(`should provide ${name} provider`, async () => {
        const module = await createModule();

        const provider = module.get<AiProvider>(token);
        expect(provider).toBeDefined();
        expect(provider.metadata.name).toBe(name);
      });
    }
  });

  it("should provide OllamaClient", async () => {
    const module = await createModule();

    const client = module.get<OllamaClient>(OllamaClient);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(OllamaClient);
  });

  it("should provide MODEL_REGISTRY with static models loaded", async () => {
    const module = await createModule();

    const registry = module.get<ModelRegistry>(MODEL_REGISTRY);
    expect(registry).toBeDefined();
    expect(registry.list().length).toBeGreaterThan(0);
    expect(registry.has("openai", "gpt-4.1")).toBe(true);
    expect(registry.has("anthropic", "claude-sonnet-4")).toBe(true);
    expect(registry.has("ollama", "llama3.2")).toBe(true);
  });

  it("should provide AI_REQUEST_REPOSITORY as PrismaAiRequestRepository", async () => {
    const module = await createModule();

    const repo = module.get<AiRequestRepository>(AI_REQUEST_REPOSITORY);
    expect(repo).toBeDefined();
    expect(repo).toBeInstanceOf(PrismaAiRequestRepository);
  });
});
