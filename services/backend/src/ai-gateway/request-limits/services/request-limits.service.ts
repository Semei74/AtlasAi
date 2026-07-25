import { Injectable } from "@nestjs/common";
import type { RequestLimits, RequestLimitsConfig, RequestLimitResult, RequestLimitsService } from "../interfaces/request-limits.interface.js";

const DEFAULT_CONFIG: RequestLimitsConfig = {
  maxPromptLength: 128000,
  maxResponseLength: 128000,
  maxContextLength: 256000,
  maxAttachments: 10,
  maxAttachmentSizeBytes: 10485760,
  maxStreamingDurationMs: 300000,
  maxMessagesPerRequest: 100,
};

class DefaultRequestLimits implements RequestLimits {
  public readonly config: RequestLimitsConfig;

  public constructor(config: Partial<RequestLimitsConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  #result(allowed: boolean, current: number, limit: number, reason?: string): RequestLimitResult {
    return { allowed, current, limit, ...(reason !== undefined ? { reason } : {}) };
  }

  public validatePrompt(prompt: string): RequestLimitResult {
    const current = prompt.length;
    return this.#result(
      current <= this.config.maxPromptLength,
      current,
      this.config.maxPromptLength,
      current > this.config.maxPromptLength ? `Prompt exceeds ${String(this.config.maxPromptLength)} characters` : undefined,
    );
  }

  public validateResponse(response: string): RequestLimitResult {
    const current = response.length;
    return this.#result(
      current <= this.config.maxResponseLength,
      current,
      this.config.maxResponseLength,
      current > this.config.maxResponseLength ? `Response exceeds ${String(this.config.maxResponseLength)} characters` : undefined,
    );
  }

  public validateContext(context: string): RequestLimitResult {
    const current = context.length;
    return this.#result(
      current <= this.config.maxContextLength,
      current,
      this.config.maxContextLength,
      current > this.config.maxContextLength ? `Context exceeds ${String(this.config.maxContextLength)} characters` : undefined,
    );
  }

  public validateAttachments(count: number): RequestLimitResult {
    return this.#result(
      count <= this.config.maxAttachments,
      count,
      this.config.maxAttachments,
      count > this.config.maxAttachments ? `Attachments exceed ${String(this.config.maxAttachments)}` : undefined,
    );
  }

  public validateStreamingDuration(durationMs: number): RequestLimitResult {
    return this.#result(
      durationMs <= this.config.maxStreamingDurationMs,
      durationMs,
      this.config.maxStreamingDurationMs,
      durationMs > this.config.maxStreamingDurationMs ? `Streaming duration exceeds ${String(this.config.maxStreamingDurationMs)}ms` : undefined,
    );
  }

  public validateMessages(count: number): RequestLimitResult {
    return this.#result(
      count <= this.config.maxMessagesPerRequest,
      count,
      this.config.maxMessagesPerRequest,
      count > this.config.maxMessagesPerRequest ? `Messages exceed ${String(this.config.maxMessagesPerRequest)}` : undefined,
    );
  }
}

@Injectable()
export class RequestLimitsServiceImpl implements RequestLimitsService {
  private readonly limitsMap = new Map<string, RequestLimits>();

  public getOrCreate(name: string, config?: Partial<RequestLimitsConfig>): RequestLimits {
    const existing = this.limitsMap.get(name);

    if (existing !== undefined) {
      return existing;
    }

    const limits = new DefaultRequestLimits(config ?? {});
    this.limitsMap.set(name, limits);
    return limits;
  }

  public validatePrompt(name: string, prompt: string): RequestLimitResult {
    return this.getOrCreate(name).validatePrompt(prompt);
  }

  public validateResponse(name: string, response: string): RequestLimitResult {
    return this.getOrCreate(name).validateResponse(response);
  }

  public validateContext(name: string, context: string): RequestLimitResult {
    return this.getOrCreate(name).validateContext(context);
  }

  public validateAttachments(name: string, count: number): RequestLimitResult {
    return this.getOrCreate(name).validateAttachments(count);
  }

  public validateStreamingDuration(name: string, durationMs: number): RequestLimitResult {
    return this.getOrCreate(name).validateStreamingDuration(durationMs);
  }

  public validateMessages(name: string, count: number): RequestLimitResult {
    return this.getOrCreate(name).validateMessages(count);
  }
}
