import { Injectable, Inject } from "@nestjs/common";
import type { ProviderResolver } from "../../../providers/resolver/provider-resolver.interface.js";
import type { AiProvider } from "../../../providers/interfaces/ai-provider.interface.js";
import type { ExecutionContext } from "../interfaces/execution-context.interface.js";
import type { ExecutionResult } from "../interfaces/execution-result.interface.js";
import { PROVIDER_RESOLVER } from "../../../providers/resolver/provider-resolver.interface.js";

const TIMEOUT_ERROR_MESSAGE = "timeout exceeded";

@Injectable()
export class AgentExecutionService {
  public constructor(
    @Inject(PROVIDER_RESOLVER)
    private readonly providerResolver: ProviderResolver,
  ) {}

  public async execute(context: ExecutionContext): Promise<ExecutionResult> {
    if (context.signal.aborted) {
      return this.#cancelledResult(context);
    }

    try {
      const ctxMeta = context.context.metadata;
      const providerName = (ctxMeta["provider"] as string | undefined) ?? context.agent.defaultProvider;
      const model = (ctxMeta["model"] as string | undefined) ?? context.agent.defaultModel;

      const provider: AiProvider = this.providerResolver.resolve(providerName);

      const providerResult = await provider.chat({
        model,
        messages: [
          {
            role: "system",
            content: `You are ${context.agent.name}, an AI agent. ${context.agent.description}`,
          },
          {
            role: "user",
            content: context.context.input,
          },
        ],
        temperature: 0.7,
        maxTokens: context.limits.maxTokens,
        stream: false,
      });

      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- signal can be aborted during the async provider call */
      if (context.signal.aborted) {
        return this.#cancelledResult(context);
      }

      if (!providerResult.success) {
        return {
          output: "",
          status: "failed",
          totalTokens: 0,
          totalCost: 0,
          durationMs: Date.now() - context.startedAt.getTime(),
          modelUsed: model,
          providerUsed: providerName,
          finishedAt: new Date(),
          error: providerResult.error.message,
        };
      }

      return {
        output: providerResult.data.content,
        status: "completed",
        totalTokens: providerResult.data.usage.totalTokens,
        totalCost: this.#estimateCost(providerResult.data.usage.totalTokens, model),
        durationMs: Date.now() - context.startedAt.getTime(),
        modelUsed: providerResult.data.model,
        providerUsed: providerName,
        finishedAt: new Date(),
        error: null,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.toLowerCase().includes("timeout")) {
        return {
          output: "",
          status: "timeout",
          totalTokens: 0,
          totalCost: 0,
          durationMs: context.limits.timeoutMs,
          modelUsed: context.agent.defaultModel,
          providerUsed: context.agent.defaultProvider,
          finishedAt: new Date(),
          error: TIMEOUT_ERROR_MESSAGE,
        };
      }

      return {
        output: "",
        status: "failed",
        totalTokens: 0,
        totalCost: 0,
        durationMs: Date.now() - context.startedAt.getTime(),
        modelUsed: context.agent.defaultModel,
        providerUsed: context.agent.defaultProvider,
        finishedAt: new Date(),
        error: message,
      };
    }
  }

  #estimateCost(totalTokens: number, _model: string): number {
    return totalTokens * 0.000002;
  }

  #cancelledResult(context: ExecutionContext): ExecutionResult {
    return {
      output: "",
      status: "cancelled",
      totalTokens: 0,
      totalCost: 0,
      durationMs: Date.now() - context.startedAt.getTime(),
      modelUsed: context.agent.defaultModel,
      providerUsed: context.agent.defaultProvider,
      finishedAt: new Date(),
      error: "Execution was cancelled",
    };
  }
}
