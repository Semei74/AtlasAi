import { Injectable, Inject, ForbiddenException } from "@nestjs/common";
import { ORGANIZATION_SETTINGS_REPOSITORY } from "../../organization/interfaces/organization-settings-repository.interface.js";
import type { OrganizationSettingsRepository } from "../../organization/interfaces/organization-settings-repository.interface.js";
import { AI_REQUEST_REPOSITORY } from "../interfaces/ai-request-repository.interface.js";
import type { AiRequestRepository } from "../interfaces/ai-request-repository.interface.js";
import type { AiProvider } from "../providers/interfaces/ai-provider.interface.js";
import { PROVIDER_RESOLVER } from "../providers/resolver/provider-resolver.interface.js";
import type { ProviderResolver } from "../providers/resolver/provider-resolver.interface.js";
import { AI_POLICY_ENGINE } from "../policy/interfaces/ai-policy-engine.interface.js";
import type { AiPolicyEngine } from "../policy/interfaces/ai-policy-engine.interface.js";
import type { AiPolicyViolation } from "../policy/interfaces/ai-policy-violation.interface.js";
import type { GatewayResponse, StreamChunk } from "../interfaces/ai-gateway.interface.js";
import { STREAMING_ENGINE } from "../streaming/index.js";
import type { StreamingEngine } from "../streaming/index.js";
import type { StreamingRequest, StreamingChunk } from "../streaming/index.js";
import { MODEL_ROUTER } from "../routing/index.js";
import type { ModelRouter, RoutingPreferences } from "../routing/index.js";
import { TOKEN_ACCOUNTING_PROVIDER } from "../cost/index.js";
import type { TokenAccountingService, TokenAccountingResult } from "../cost/index.js";
import type { TokenUsageDetail } from "../providers/interfaces/token-accounting.interface.js";
import type { ChatCompletionRequestDto } from "../dto/chat-completion-request.dto.js";
import type { ProviderChatRequest } from "../providers/interfaces/provider-request.interface.js";
import { AiGatewayErrorCode } from "../enums/ai-gateway-error-code.enum.js";
import { rootLogger } from "@atlas/logger";
import { PROMPT_MANAGER } from "../prompt/interfaces/prompt-manager.interface.js";
import type { PromptManager, RenderedPrompt } from "../prompt/interfaces/prompt-manager.interface.js";
import { CONTEXT_ENGINE } from "../context/interfaces/context-engine.interface.js";
import type { ContextEngine } from "../context/interfaces/context-engine.interface.js";
import type { ContextRequest } from "../context/interfaces/context-request.interface.js";
import type { ContextResult } from "../context/interfaces/context-result.interface.js";
import { RAG_ENGINE } from "../rag/rag.module.js";
import type { RagEngine, RagQuery, RagResult } from "../providers/interfaces/rag-engine.interface.js";
import { VECTOR_SEARCH_SERVICE } from "../vector-search/interfaces/vector-search.interface.js";
import type { VectorSearchService, VectorSearchQuery, VectorSearchResult } from "../vector-search/interfaces/vector-search.interface.js";
import { AGENT_REGISTRY } from "../agents/interfaces/agent-registry.interface.js";
import type { AgentRegistry } from "../agents/interfaces/agent-registry.interface.js";
import { REGISTRY } from "../agents/registry/interfaces/agent-registry.interface.js";
import type { Registry } from "../agents/registry/interfaces/agent-registry.interface.js";
import { AGENT_RUNTIME } from "../agents/runtime/interfaces/agent-runtime.interface.js";
import type { AgentRuntime } from "../agents/runtime/interfaces/agent-runtime.interface.js";
import { MetricsService } from "../../metrics/metrics.service.js";
import { Observable } from "rxjs";
import type { MessageEvent } from "@nestjs/common";

@Injectable()
export class AiGatewayService {
  public constructor(
    @Inject(ORGANIZATION_SETTINGS_REPOSITORY)
    private readonly orgSettingsRepo: OrganizationSettingsRepository,
    @Inject(PROVIDER_RESOLVER)
    private readonly providerResolver: ProviderResolver,
    @Inject(AI_REQUEST_REPOSITORY)
    private readonly requestRepo: AiRequestRepository,
    @Inject(AI_POLICY_ENGINE)
    private readonly policyEngine: AiPolicyEngine,
    @Inject(PROMPT_MANAGER)
    private readonly promptManager: PromptManager,
    @Inject(CONTEXT_ENGINE)
    private readonly contextEngine: ContextEngine,
    @Inject(RAG_ENGINE)
    private readonly ragEngine: RagEngine,
    @Inject(VECTOR_SEARCH_SERVICE)
    private readonly vectorSearch: VectorSearchService,
    @Inject(AGENT_REGISTRY)
    private readonly agentRegistry: AgentRegistry,
    @Inject(REGISTRY)
    private readonly registry: Registry,
    @Inject(AGENT_RUNTIME)
    private readonly agentRuntime: AgentRuntime,
    @Inject(MetricsService) private readonly metricsService: MetricsService,
    @Inject(STREAMING_ENGINE) private readonly streamingEngine: StreamingEngine,
    @Inject(MODEL_ROUTER) private readonly modelRouter: ModelRouter,
    @Inject(TOKEN_ACCOUNTING_PROVIDER) private readonly tokenAccounting: TokenAccountingService,
  ) {}

  public getPromptManager(): PromptManager {
    return this.promptManager;
  }

  public async renderPrompt(
    id: string,
    variables: Record<string, string>,
    version?: string,
  ): Promise<RenderedPrompt | null> {
    return this.promptManager.render(id, variables, version);
  }

  public getContextEngine(): ContextEngine {
    return this.contextEngine;
  }

  public async buildContext(request: ContextRequest): Promise<ContextResult> {
    return this.contextEngine.buildContext(request);
  }

  public getRagEngine(): RagEngine {
    return this.ragEngine;
  }

  public async ragQuery(query: RagQuery): Promise<RagResult> {
    return this.ragEngine.query(query);
  }

  public getVectorSearch(): VectorSearchService {
    return this.vectorSearch;
  }

  public async vectorSearchQuery(query: VectorSearchQuery): Promise<readonly VectorSearchResult[]> {
    return this.vectorSearch.search(query);
  }

  public getAgentRegistry(): AgentRegistry {
    return this.agentRegistry;
  }

  public getRegistry(): Registry {
    return this.registry;
  }

  public getAgentRuntime(): AgentRuntime {
    return this.agentRuntime;
  }

  public async indexForRag(
    id: string,
    text: string,
    sourceType: string,
    sourceId: string,
    metadata?: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    await this.vectorSearch.indexText(id, text, sourceType, sourceId, metadata);
  }

  public async chat(
    dto: ChatCompletionRequestDto,
    userId: string,
    organizationId: string,
    workspaceId: string,
  ): Promise<GatewayResponse> {
    const { provider, modelId, policyViolations } = await this.#resolveProvider(dto, organizationId, workspaceId, userId);
    const contextResult = await this.#buildContextIfEnabled(dto, userId, organizationId, workspaceId);
    const providerRequest = this.#buildProviderRequest(dto, modelId, contextResult);
    const startTime = Date.now();

    try {
      const result = await provider.chat(providerRequest);

      if (!result.success) {
        rootLogger.warn("AI provider error", {
          provider: result.error.provider,
          code: result.error.code,
          statusCode: result.error.statusCode,
          message: result.error.message,
        });
        throw new ForbiddenException({
          error: AiGatewayErrorCode.PROVIDER_ERROR,
          message: "AI provider temporarily unavailable",
          statusCode: 502,
        });
      }

      const { data } = result;
      const providerName = provider.metadata.name;

      const accounted = this.tokenAccounting.account({
        provider: providerName,
        model: data.model,
        providerUsage: data.usage,
        promptText: providerRequest.messages.map((m) => m.content).join("\n"),
      });

      const violationsForResponse = policyViolations.length > 0 ? policyViolations : undefined;

      const response: GatewayResponse = {
        id: data.id,
        model: data.model,
        provider: providerName,
        content: data.content,
        finishReason: data.finishReason,
        usage: accounted.usage,
        latency: Date.now() - startTime,
        policyViolations: violationsForResponse,
      };

      this.#recordMetrics(providerName, data, startTime, true);
      this.#recordRequest(providerName, { model: data.model, usage: accounted.usage }, userId, organizationId, workspaceId, startTime, true, undefined);
      void this.tokenAccounting.recordUsage(
        organizationId,
        workspaceId,
        this.#toUsageDetail(providerName, data.model, accounted),
        providerName,
        data.model,
      );

      return response;
    } catch (error: unknown) {
      const providerName = provider.metadata.name;
      this.#recordMetrics(providerName, modelId, startTime, false, error);
      this.#recordRequest(providerName, modelId, userId, organizationId, workspaceId, startTime, false, error);

      throw error;
    }
  }

  public chatStream(
    dto: ChatCompletionRequestDto,
    userId: string,
    organizationId: string,
    workspaceId: string,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      this.#resolveProvider(dto, organizationId, workspaceId, userId)
        .then(async ({ provider, modelId }) => {
          const providerName = provider.metadata.name;
          const contextResult = await this.#buildContextIfEnabled(dto, userId, organizationId, workspaceId);
          const providerRequest = this.#buildProviderRequest(dto, modelId, contextResult);
          const streamingRequest: StreamingRequest = {
            provider: providerName,
            model: providerRequest.model,
            messages: providerRequest.messages,
            ...(providerRequest.temperature !== undefined ? { temperature: providerRequest.temperature } : {}),
            ...(providerRequest.maxTokens !== undefined ? { maxTokens: providerRequest.maxTokens } : {}),
          };

          const startTime = Date.now();

          try {
            for await (const chunk of this.streamingEngine.stream(streamingRequest)) {
              if (chunk.type === "done") {
                const providerUsage = chunk.usage ?? {
                  promptTokens: 0,
                  completionTokens: 0,
                  totalTokens: 0,
                  estimatedCost: 0,
                };

                const accounted: TokenAccountingResult = this.tokenAccounting.account({
                  provider: providerName,
                  model: modelId,
                  providerUsage: {
                    promptTokens: providerUsage.promptTokens,
                    completionTokens: providerUsage.completionTokens,
                    totalTokens: providerUsage.totalTokens,
                  },
                  promptText: providerRequest.messages.map((m) => m.content).join("\n"),
                });

                const usageWithCost = {
                  ...providerUsage,
                  estimatedCost: accounted.usage.estimatedCost,
                };

                this.#recordMetrics(providerName, { model: modelId, usage: accounted.usage }, startTime, true);
                this.#recordRequest(
                  providerName,
                  { model: modelId, usage: accounted.usage },
                  userId,
                  organizationId,
                  workspaceId,
                  startTime,
                  true,
                  undefined,
                );
                void this.tokenAccounting.recordUsage(
                  organizationId,
                  workspaceId,
                  this.#toUsageDetail(providerName, modelId, accounted),
                  providerName,
                  modelId,
                );

                subscriber.next({ data: JSON.stringify(this.#toStreamChunk({ ...chunk, usage: usageWithCost })) });
                subscriber.complete();
                return;
              }

              subscriber.next({ data: JSON.stringify(this.#toStreamChunk(chunk)) });

              if (chunk.type === "error") {
                this.#recordMetrics(providerName, modelId, startTime, false);
                this.#recordRequest(providerName, modelId, userId, organizationId, workspaceId, startTime, false, new Error(chunk.error));
                subscriber.complete();
                return;
              }
            }

            subscriber.complete();
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Stream error";
            subscriber.next({ data: JSON.stringify({ type: "error", error: message }) });
            this.#recordMetrics(providerName, modelId, startTime, false);
            this.#recordRequest(providerName, modelId, userId, organizationId, workspaceId, startTime, false, error instanceof Error ? error : new Error(String(error)));
            subscriber.complete();
          }
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : "Failed to resolve provider";
          subscriber.next({ data: JSON.stringify({ type: "error", error: message }) });
          subscriber.complete();
        });
    });
  }

  #toStreamChunk(chunk: StreamingChunk): StreamChunk {
    if (chunk.type === "delta") {
      return { type: "delta", content: chunk.content };
    }

    if (chunk.type === "done") {
      return {
        type: "done",
        finishReason: chunk.finishReason,
        ...(chunk.usage !== undefined ? { usage: chunk.usage } : {}),
        latency: chunk.latency,
      };
    }

    return { type: "error", error: chunk.error };
  }

  async #resolveProvider(
    dto: ChatCompletionRequestDto,
    organizationId: string,
    workspaceId: string,
    userId: string,
  ): Promise<{ provider: AiProvider; modelId: string; policyViolations: readonly AiPolicyViolation[] }> {
    const settings = await this.orgSettingsRepo.findByOrganizationId(organizationId);

    if (settings === null) {
      throw new ForbiddenException({
        error: AiGatewayErrorCode.FORBIDDEN,
        message: "Organization settings not configured",
        statusCode: 403,
      });
    }

    const { ai: aiSettings } = settings;
    let providerName = aiSettings.defaultProvider ?? "stub";
    let modelId = dto.model;

    if (modelId === "auto") {
      const routePreferences: RoutingPreferences = {
        strategy: "balanced",
        ...(aiSettings.enabledProviders.length > 0 ? { allowedProviders: aiSettings.enabledProviders } : {}),
        ...(aiSettings.allowedModels.length > 0 ? { allowedModels: aiSettings.allowedModels } : {}),
        ...(aiSettings.defaultProvider ? { preferredProvider: aiSettings.defaultProvider } : {}),
      };
      const decision = await this.modelRouter.route({}, routePreferences);
      providerName = decision.provider;
      modelId = decision.model;
    }

    const provider = this.providerResolver.resolve(providerName);

    const policyContext = {
      organizationId,
      workspaceId,
      userId,
      provider: providerName,
      model: modelId,
      settings,
      requestedCapabilities: {
        ...(dto.stream === true ? { streaming: true as const } : {}),
      },
      metadata: {},
    };

    const policyResult = await this.policyEngine.evaluate(policyContext);

    if (!policyResult.allowed) {
      throw new ForbiddenException({
        error: AiGatewayErrorCode.MODEL_NOT_ALLOWED,
        message: `Policy violation: ${policyResult.violations.map((v) => v.reason).join("; ")}`,
        statusCode: 403,
      });
    }

    return { provider, modelId, policyViolations: policyResult.violations };
  }

  async #buildContextIfEnabled(
    dto: ChatCompletionRequestDto,
    userId: string,
    organizationId: string,
    workspaceId: string,
  ): Promise<ContextResult | null> {
    try {
      const result = await this.contextEngine.buildContext({
        userId,
        organizationId,
        workspaceId,
        maxTokens: dto.maxTokens ?? 4096,
        query: dto.messages.length > 0 ? dto.messages[dto.messages.length - 1]?.content : undefined,
        options: {
          includeSystemContext: true,
          includeUserContext: true,
          includeConversationHistory: true,
          prioritizeFreshness: true,
        },
      } as ContextRequest);

      return result;
    } catch {
      return null;
    }
  }

  #buildProviderRequest(dto: ChatCompletionRequestDto, modelId: string, contextResult?: ContextResult | null): ProviderChatRequest {
    const messages = [...dto.messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.name !== undefined ? { name: m.name } : {}),
    }))];

    if (contextResult !== null && contextResult !== undefined && contextResult.composedContext.length > 0) {
      messages.unshift({
        role: "system" as const,
        content: `Context:\n${contextResult.composedContext}`,
      });
    }

    return {
      model: modelId,
      messages,
      ...(dto.temperature !== undefined ? { temperature: dto.temperature } : {}),
      ...(dto.maxTokens !== undefined ? { maxTokens: dto.maxTokens } : {}),
      stream: dto.stream ?? false,
    };
  }

  #recordMetrics(
    providerName: string,
    dataOrModel: { model: string; usage: { promptTokens: number; completionTokens: number } } | string,
    startTime: number,
    success: boolean,
    error?: unknown,
  ): void {
    const model = typeof dataOrModel === "string" ? dataOrModel : dataOrModel.model;
    const usage = typeof dataOrModel === "string" ? { promptTokens: 0, completionTokens: 0 } : dataOrModel.usage;

    this.metricsService.aiGatewayRequestsTotal.inc({ provider: providerName, model });

    if (success) {
      this.metricsService.aiGatewayTokensTotal.inc({ provider: providerName, model, type: "prompt" }, usage.promptTokens);
      this.metricsService.aiGatewayTokensTotal.inc({ provider: providerName, model, type: "completion" }, usage.completionTokens);
      this.metricsService.aiGatewayDurationSeconds.observe({ provider: providerName, model }, (Date.now() - startTime) / 1000);
    } else {
      this.metricsService.aiGatewayErrorsTotal.inc({
        provider: providerName,
        error_type: error instanceof Error ? error.constructor.name : "Unknown",
      });
    }
  }

  #recordRequest(
    providerName: string,
    dataOrModel: {
      model: string;
      usage: { promptTokens: number; completionTokens: number; totalTokens: number; estimatedCost: number };
    } | string,
    userId: string,
    organizationId: string,
    workspaceId: string,
    startTime: number,
    success: boolean,
    error?: unknown,
  ): void {
    const model = typeof dataOrModel === "string" ? dataOrModel : dataOrModel.model;
    const usage = typeof dataOrModel === "string"
      ? { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 }
      : dataOrModel.usage;

    const errorCode = error instanceof Error ? error.message : success ? undefined : "UNKNOWN";
    this.requestRepo.create({
      userId,
      workspaceId,
      organizationId,
      provider: providerName,
      model,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      estimatedCost: usage.estimatedCost,
      duration: Date.now() - startTime,
      success,
      ...(errorCode !== undefined ? { errorCode } : {}),
      timestamp: new Date(),
    }).catch((err: unknown) => {
      rootLogger.error("Failed to record AI request", err instanceof Error ? err : new Error(String(err)));
    });
  }

  #toUsageDetail(_provider: string, _model: string, accounted: TokenAccountingResult): TokenUsageDetail {
    return {
      promptTokens: accounted.usage.promptTokens,
      completionTokens: accounted.usage.completionTokens,
      cachedTokens: accounted.cachedTokens,
      totalTokens: accounted.usage.totalTokens,
      estimatedCost: accounted.usage.estimatedCost,
      currency: accounted.currency,
    };
  }
}
