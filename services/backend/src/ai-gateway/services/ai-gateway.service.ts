import { Injectable, Inject, ForbiddenException } from "@nestjs/common";
import { ORGANIZATION_SETTINGS_REPOSITORY } from "../../organization/interfaces/organization-settings-repository.interface.js";
import type { OrganizationSettingsRepository } from "../../organization/interfaces/organization-settings-repository.interface.js";
import { AI_REQUEST_REPOSITORY } from "../interfaces/ai-request-repository.interface.js";
import type { AiRequestRepository } from "../interfaces/ai-request-repository.interface.js";
import { PROVIDER_RESOLVER } from "../providers/resolver/provider-resolver.interface.js";
import type { ProviderResolver } from "../providers/resolver/provider-resolver.interface.js";
import type { GatewayResponse } from "../interfaces/ai-gateway.interface.js";
import type { ChatCompletionRequestDto } from "../dto/chat-completion-request.dto.js";
import type { ProviderChatRequest } from "../providers/interfaces/provider-request.interface.js";
import { AiGatewayErrorCode } from "../enums/ai-gateway-error-code.enum.js";

@Injectable()
export class AiGatewayService {
  public constructor(
    @Inject(ORGANIZATION_SETTINGS_REPOSITORY)
    private readonly orgSettingsRepo: OrganizationSettingsRepository,
    @Inject(PROVIDER_RESOLVER)
    private readonly providerResolver: ProviderResolver,
    @Inject(AI_REQUEST_REPOSITORY)
    private readonly requestRepo: AiRequestRepository,
  ) {}

  public async chat(
    dto: ChatCompletionRequestDto,
    userId: string,
    organizationId: string,
    workspaceId: string,
  ): Promise<GatewayResponse> {
    const settings = await this.orgSettingsRepo.findByOrganizationId(organizationId);

    if (settings === null) {
      throw new ForbiddenException({
        error: AiGatewayErrorCode.FORBIDDEN,
        message: "Organization settings not configured",
        statusCode: 403,
      });
    }

    const { ai: aiSettings } = settings;

    if (aiSettings.allowedModels.length > 0 && !aiSettings.allowedModels.includes(dto.model)) {
      throw new ForbiddenException({
        error: AiGatewayErrorCode.MODEL_NOT_ALLOWED,
        message: `Model '${dto.model}' is not allowed for this organization`,
        statusCode: 403,
      });
    }

    if (aiSettings.blockedModels.includes(dto.model)) {
      throw new ForbiddenException({
        error: AiGatewayErrorCode.MODEL_NOT_ALLOWED,
        message: `Model '${dto.model}' is blocked for this organization`,
        statusCode: 403,
      });
    }

    const providerName = aiSettings.defaultProvider ?? "stub";
    const provider = this.providerResolver.resolve(providerName);

    const providerRequest: ProviderChatRequest = {
      model: dto.model,
      messages: dto.messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.name !== undefined ? { name: m.name } : {}),
      })),
      ...(dto.temperature !== undefined ? { temperature: dto.temperature } : {}),
      ...(dto.maxTokens !== undefined ? { maxTokens: dto.maxTokens } : {}),
      stream: dto.stream ?? false,
    };

    const startTime = Date.now();

    try {
      const result = await provider.chat(providerRequest);

      if (!result.success) {
        throw new ForbiddenException({
          error: AiGatewayErrorCode.PROVIDER_ERROR,
          message: result.error.message,
          statusCode: result.error.statusCode,
        });
      }

      const { data } = result;

      const response: GatewayResponse = {
        id: data.id,
        model: data.model,
        provider: providerName,
        content: data.content,
        finishReason: data.finishReason,
        usage: {
          promptTokens: data.usage.promptTokens,
          completionTokens: data.usage.completionTokens,
          totalTokens: data.usage.totalTokens,
          estimatedCost: 0,
        },
        latency: Date.now() - startTime,
      };

      void this.requestRepo.create({
        userId,
        workspaceId,
        organizationId,
        provider: providerName,
        model: data.model,
        promptTokens: data.usage.promptTokens,
        completionTokens: data.usage.completionTokens,
        totalTokens: data.usage.totalTokens,
        estimatedCost: 0,
        duration: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      void this.requestRepo.create({
        userId,
        workspaceId,
        organizationId,
        provider: providerName,
        model: dto.model,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
        duration: Date.now() - startTime,
        success: false,
        errorCode: error instanceof Error ? error.message : "UNKNOWN",
        timestamp: new Date(),
      });

      throw error;
    }
  }
}
