import { describe, it, expect } from "vitest";
import { Test } from "@nestjs/testing";
import { AiGatewayModule } from "./ai-gateway.module.js";
import { AiGatewayService } from "./services/ai-gateway.service.js";
import { AI_REQUEST_REPOSITORY } from "./interfaces/ai-request-repository.interface.js";
import type { AiRequestRepository } from "./interfaces/ai-request-repository.interface.js";
import { PROVIDER_REGISTRY } from "./providers/registry/provider-registry.interface.js";
import type { ProviderRegistry } from "./providers/registry/provider-registry.interface.js";
import { PROVIDER_FACTORY } from "./providers/factory/provider-factory.interface.js";
import type { ProviderFactory } from "./providers/factory/provider-factory.interface.js";
import { PROVIDER_RESOLVER } from "./providers/resolver/provider-resolver.interface.js";
import type { ProviderResolver } from "./providers/resolver/provider-resolver.interface.js";
import { PROVIDER_STUB } from "./providers/stub/provider-stub.js";
import type { AiProvider } from "./providers/interfaces/ai-provider.interface.js";

describe("AiGatewayModule", () => {
  it("should provide AiGatewayService", async () => {
    const module = await Test.createTestingModule({
      imports: [AiGatewayModule],
    }).compile();

    const service = module.get<AiGatewayService>(AiGatewayService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AiGatewayService);
  });

  it("should provide PROVIDER_REGISTRY", async () => {
    const module = await Test.createTestingModule({
      imports: [AiGatewayModule],
    }).compile();

    const registry = module.get<ProviderRegistry>(PROVIDER_REGISTRY);
    expect(registry).toBeDefined();
  });

  it("should provide PROVIDER_FACTORY", async () => {
    const module = await Test.createTestingModule({
      imports: [AiGatewayModule],
    }).compile();

    const factory = module.get<ProviderFactory>(PROVIDER_FACTORY);
    expect(factory).toBeDefined();
  });

  it("should provide PROVIDER_RESOLVER", async () => {
    const module = await Test.createTestingModule({
      imports: [AiGatewayModule],
    }).compile();

    const resolver = module.get<ProviderResolver>(PROVIDER_RESOLVER);
    expect(resolver).toBeDefined();
  });

  it("should provide PROVIDER_STUB", async () => {
    const module = await Test.createTestingModule({
      imports: [AiGatewayModule],
    }).compile();

    const stub = module.get<AiProvider>(PROVIDER_STUB);
    expect(stub).toBeDefined();
    expect(stub.metadata.name).toBe("stub");
  });

  it("should provide AI_REQUEST_REPOSITORY", async () => {
    const module = await Test.createTestingModule({
      imports: [AiGatewayModule],
    }).compile();

    const repo = module.get<AiRequestRepository>(AI_REQUEST_REPOSITORY);
    expect(repo).toBeDefined();
  });

  it("should throw when AI_REQUEST_REPOSITORY.create is called without a configured repository", async () => {
    const module = await Test.createTestingModule({
      imports: [AiGatewayModule],
    }).compile();

    const repo = module.get<AiRequestRepository>(AI_REQUEST_REPOSITORY);

    await expect(repo.create({} as Parameters<AiRequestRepository["create"]>[0])).rejects.toThrow(
      "AiRequestRepository not configured",
    );
  });
});
