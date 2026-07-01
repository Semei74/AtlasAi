import { Module } from "@nestjs/common";
import { OrganizationModule } from "../organization/organization.module.js";
import { AI_REQUEST_REPOSITORY } from "./interfaces/ai-request-repository.interface.js";
import type { AiRequestRepository } from "./interfaces/ai-request-repository.interface.js";
import { AiGatewayService } from "./services/ai-gateway.service.js";
import { AiGatewayController } from "./controllers/ai-gateway.controller.js";
import { PROVIDER_REGISTRY } from "./providers/registry/provider-registry.interface.js";
import { DefaultProviderRegistry } from "./providers/registry/default-provider-registry.js";
import { PROVIDER_FACTORY } from "./providers/factory/provider-factory.interface.js";
import { DefaultProviderFactory } from "./providers/factory/default-provider-factory.js";
import { PROVIDER_RESOLVER } from "./providers/resolver/provider-resolver.interface.js";
import { ProviderResolverService } from "./providers/resolver/provider-resolver.service.js";
import { PROVIDER_STUB } from "./providers/stub/provider-stub.js";
import { ProviderStub } from "./providers/stub/provider-stub.js";

const DEFAULT_AI_REQUEST_REPOSITORY: AiRequestRepository = {
  create(): Promise<never> {
    return Promise.reject(
      new Error(
        "AiRequestRepository not configured. Provide a custom AI_REQUEST_REPOSITORY provider.",
      ),
    );
  },
  findByWorkspaceId(): Promise<never> {
    return Promise.reject(
      new Error(
        "AiRequestRepository not configured. Provide a custom AI_REQUEST_REPOSITORY provider.",
      ),
    );
  },
  findByOrganizationId(): Promise<never> {
    return Promise.reject(
      new Error(
        "AiRequestRepository not configured. Provide a custom AI_REQUEST_REPOSITORY provider.",
      ),
    );
  },
};

@Module({
  imports: [OrganizationModule],
  controllers: [AiGatewayController],
  providers: [
    AiGatewayService,
    {
      provide: PROVIDER_REGISTRY,
      useClass: DefaultProviderRegistry,
    },
    {
      provide: PROVIDER_FACTORY,
      useClass: DefaultProviderFactory,
    },
    {
      provide: PROVIDER_RESOLVER,
      useClass: ProviderResolverService,
    },
    {
      provide: PROVIDER_STUB,
      useClass: ProviderStub,
    },
    {
      provide: AI_REQUEST_REPOSITORY,
      useValue: DEFAULT_AI_REQUEST_REPOSITORY,
    },
  ],
  exports: [AiGatewayService, AI_REQUEST_REPOSITORY],
})
export class AiGatewayModule {}
