import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service.js";

export interface CreateExecutionDto {
  readonly promptId: string;
  readonly versionId: string;
  readonly provider?: string;
  readonly model?: string;
  readonly variables: Record<string, unknown>;
  readonly renderedPrompt?: string;
  readonly latencyMs?: number;
  readonly promptTokens?: number;
  readonly completionTokens?: number;
  readonly totalTokens?: number;
  readonly estimatedCost?: number;
  readonly success: boolean;
  readonly errorCode?: string;
  readonly organizationId?: string;
  readonly workspaceId?: string;
  readonly userId?: string;
}

@Injectable()
export class PrismaPromptExecutionRepository {
  private readonly db: PrismaService;

  public constructor(db: PrismaService) {
    this.db = db;
  }

  get #delegate(): Record<string, (...args: unknown[]) => unknown> {
    return this.db.promptExecution as unknown as Record<string, (...args: unknown[]) => unknown>;
  }

  public create(dto: CreateExecutionDto): Promise<Record<string, unknown>> {
    const data: Record<string, unknown> = {
      promptId: dto.promptId,
      versionId: dto.versionId,
      variables: dto.variables,
      success: dto.success,
    };

    if (dto.provider !== undefined) data["provider"] = dto.provider;
    if (dto.model !== undefined) data["model"] = dto.model;
    if (dto.renderedPrompt !== undefined) data["renderedPrompt"] = dto.renderedPrompt;
    if (dto.latencyMs !== undefined) data["latencyMs"] = dto.latencyMs;
    if (dto.promptTokens !== undefined) data["promptTokens"] = dto.promptTokens;
    if (dto.completionTokens !== undefined) data["completionTokens"] = dto.completionTokens;
    if (dto.totalTokens !== undefined) data["totalTokens"] = dto.totalTokens;
    if (dto.estimatedCost !== undefined) data["estimatedCost"] = dto.estimatedCost;
    if (dto.errorCode !== undefined) data["errorCode"] = dto.errorCode;
    if (dto.organizationId !== undefined) data["organizationId"] = dto.organizationId;
    if (dto.workspaceId !== undefined) data["workspaceId"] = dto.workspaceId;
    if (dto.userId !== undefined) data["userId"] = dto.userId;

    return (this.#delegate["create"] as (...args: unknown[]) => unknown)({
      data,
    }) as Promise<Record<string, unknown>>;
  }

  public async findByPromptId(promptId: string, limit = 50): Promise<readonly Record<string, unknown>[]> {
    const results = await (this.#delegate["findMany"] as (...args: unknown[]) => unknown)({
      where: { promptId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }) as readonly Record<string, unknown>[];
    return results;
  }
}
