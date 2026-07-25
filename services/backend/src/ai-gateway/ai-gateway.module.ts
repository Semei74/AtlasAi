import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { OrganizationModule } from "../organization/organization.module.js";
import { AI_REQUEST_REPOSITORY } from "./interfaces/ai-request-repository.interface.js";
import { AiGatewayService } from "./services/ai-gateway.service.js";
import { PrismaAiRequestRepository } from "./services/prisma-ai-request.repository.js";
import { AiGatewayController } from "./controllers/ai-gateway.controller.js";
import { PROVIDER_REGISTRY } from "./providers/registry/provider-registry.interface.js";
import { DefaultProviderRegistry } from "./providers/registry/default-provider-registry.js";
import { PROVIDER_FACTORY } from "./providers/factory/provider-factory.interface.js";
import { DefaultProviderFactory } from "./providers/factory/default-provider-factory.js";
import { PROVIDER_RESOLVER } from "./providers/resolver/provider-resolver.interface.js";
import { ProviderResolverService } from "./providers/resolver/provider-resolver.service.js";
import { PROVIDER_STUB, ProviderStub } from "./providers/stub/provider-stub.js";
import { PROVIDER_OPENAI, OpenaiProvider } from "./providers/openai/openai.provider.js";
import { PROVIDER_ANTHROPIC, AnthropicProvider } from "./providers/anthropic/anthropic.provider.js";
import { PROVIDER_GEMINI, GeminiProvider } from "./providers/gemini/gemini.provider.js";
import { PROVIDER_OPENROUTER, OpenrouterProvider } from "./providers/openrouter/openrouter.provider.js";
import { PROVIDER_DEEPSEEK, DeepseekProvider } from "./providers/deepseek/deepseek.provider.js";
import { PROVIDER_MISTRAL, MistralProvider } from "./providers/mistral/mistral.provider.js";
import { PROVIDER_GROQ, GroqProvider } from "./providers/groq/groq.provider.js";
import { PROVIDER_XAI, XaiProvider } from "./providers/xai/xai.provider.js";
import { PROVIDER_OLLAMA, OllamaProvider } from "./providers/ollama/ollama.provider.js";
import { OllamaClient } from "./providers/ollama/ollama.client.js";
import { MODEL_REGISTRY } from "./model-registry/interfaces/model-registry.interface.js";
import { DefaultModelRegistry } from "./model-registry/default-model-registry.js";
import { STREAMING_ENGINE, DefaultStreamingEngine } from "./streaming/index.js";
import { MODEL_ROUTER, DefaultModelRouter } from "./routing/index.js";
import { TOOL_REGISTRY, DefaultToolRegistry, TOOL_CALLING_ENGINE, DefaultToolCallingEngine } from "./tools/index.js";
import {
  PRICING_RESOLVER,
  DefaultPricingResolver,
  COST_CALCULATOR,
  DefaultCostCalculator,
  TOKEN_ESTIMATOR,
  DefaultTokenEstimator,
  USAGE_CALCULATOR,
  DefaultUsageCalculator,
  TOKEN_ACCOUNTING_PROVIDER,
  DefaultTokenAccountingService,
} from "./cost/index.js";
import { AI_POLICY_ENGINE } from "./policy/interfaces/ai-policy-engine.interface.js";
import { AiPolicyEngineService } from "./policy/services/ai-policy-engine.service.js";
import { PromptModule } from "./prompt/prompt.module.js";
import { ContextModule } from "./context/context.module.js";
import { VectorSearchModule } from "./vector-search/vector-search.module.js";
import { RagModule } from "./rag/rag.module.js";
import { AiAgentsModule } from "./agents/ai-agents.module.js";
import { MetricsModule } from "../metrics/metrics.module.js";
import { CIRCUIT_BREAKER_SERVICE, CircuitBreakerServiceImpl } from "./circuit-breaker/index.js";
import { RETRY_POLICY_SERVICE, RetryPolicyServiceImpl } from "./retry/index.js";
import { MODEL_CACHE_SERVICE, ModelCacheServiceImpl } from "./model-cache/index.js";
import { CORRELATION_ID_SERVICE, CorrelationIdServiceImpl, CorrelationIdMiddleware } from "./correlation-id/index.js";
import { PII_REDACTOR, PiiRedactorService } from "./pii/index.js";
import { REQUEST_LIMITS_SERVICE, RequestLimitsServiceImpl } from "./request-limits/index.js";
import { IDEMPOTENCY_SERVICE, IdempotencyServiceImpl } from "./idempotency/index.js";
import { HEALTH_MONITOR_SERVICE, HealthMonitorServiceImpl } from "./health-monitor/index.js";
import { PromptLibraryModule } from "./prompt-library/prompt-library.module.js";
import { RedisModule } from "../redis/redis.module.js";

@Module({
  imports: [OrganizationModule, PromptModule, ContextModule, VectorSearchModule, RagModule, AiAgentsModule, MetricsModule, RedisModule, PromptLibraryModule],
  controllers: [AiGatewayController],
  providers: [
    AiGatewayService,
    PrismaAiRequestRepository,
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
      provide: PROVIDER_OPENAI,
      useClass: OpenaiProvider,
    },
    {
      provide: PROVIDER_ANTHROPIC,
      useClass: AnthropicProvider,
    },
    {
      provide: PROVIDER_GEMINI,
      useClass: GeminiProvider,
    },
    {
      provide: PROVIDER_OPENROUTER,
      useClass: OpenrouterProvider,
    },
    {
      provide: PROVIDER_DEEPSEEK,
      useClass: DeepseekProvider,
    },
    {
      provide: PROVIDER_MISTRAL,
      useClass: MistralProvider,
    },
    {
      provide: PROVIDER_GROQ,
      useClass: GroqProvider,
    },
    {
      provide: PROVIDER_XAI,
      useClass: XaiProvider,
    },
    {
      provide: PROVIDER_OLLAMA,
      useClass: OllamaProvider,
    },
    OllamaClient,
    {
      provide: MODEL_REGISTRY,
      useClass: DefaultModelRegistry,
    },
    {
      provide: STREAMING_ENGINE,
      useClass: DefaultStreamingEngine,
    },
    {
      provide: MODEL_ROUTER,
      useClass: DefaultModelRouter,
    },
    {
      provide: TOOL_REGISTRY,
      useClass: DefaultToolRegistry,
    },
    {
      provide: TOOL_CALLING_ENGINE,
      useClass: DefaultToolCallingEngine,
    },
    {
      provide: PRICING_RESOLVER,
      useClass: DefaultPricingResolver,
    },
    {
      provide: COST_CALCULATOR,
      useClass: DefaultCostCalculator,
    },
    {
      provide: TOKEN_ESTIMATOR,
      useClass: DefaultTokenEstimator,
    },
    {
      provide: USAGE_CALCULATOR,
      useClass: DefaultUsageCalculator,
    },
    {
      provide: TOKEN_ACCOUNTING_PROVIDER,
      useClass: DefaultTokenAccountingService,
    },
    {
      provide: AI_REQUEST_REPOSITORY,
      useClass: PrismaAiRequestRepository,
    },
    {
      provide: AI_POLICY_ENGINE,
      useClass: AiPolicyEngineService,
    },
    {
      provide: CIRCUIT_BREAKER_SERVICE,
      useClass: CircuitBreakerServiceImpl,
    },
    {
      provide: RETRY_POLICY_SERVICE,
      useClass: RetryPolicyServiceImpl,
    },
    {
      provide: MODEL_CACHE_SERVICE,
      useClass: ModelCacheServiceImpl,
    },
    {
      provide: CORRELATION_ID_SERVICE,
      useClass: CorrelationIdServiceImpl,
    },
    {
      provide: PII_REDACTOR,
      useClass: PiiRedactorService,
    },
    {
      provide: REQUEST_LIMITS_SERVICE,
      useClass: RequestLimitsServiceImpl,
    },
    {
      provide: IDEMPOTENCY_SERVICE,
      useClass: IdempotencyServiceImpl,
    },
    {
      provide: HEALTH_MONITOR_SERVICE,
      useClass: HealthMonitorServiceImpl,
    },
  ],
  exports: [
    AiGatewayService, PROVIDER_RESOLVER, AI_REQUEST_REPOSITORY, MODEL_REGISTRY, AI_POLICY_ENGINE,
    STREAMING_ENGINE, MODEL_ROUTER, TOOL_REGISTRY, TOOL_CALLING_ENGINE, CIRCUIT_BREAKER_SERVICE, RETRY_POLICY_SERVICE, MODEL_CACHE_SERVICE, CORRELATION_ID_SERVICE,
    PII_REDACTOR, REQUEST_LIMITS_SERVICE, IDEMPOTENCY_SERVICE, HEALTH_MONITOR_SERVICE, PRICING_RESOLVER, COST_CALCULATOR, TOKEN_ESTIMATOR, USAGE_CALCULATOR, TOKEN_ACCOUNTING_PROVIDER,
    PromptModule, ContextModule, VectorSearchModule, RagModule, AiAgentsModule,
  ],
})
export class AiGatewayModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes("api/v1/ai");
  }
}
