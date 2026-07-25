import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { AiRequestRepository } from "../interfaces/ai-request-repository.interface.js";
import type { AiRequestRecord } from "../interfaces/ai-request-record.interface.js";

@Injectable()
export class PrismaAiRequestRepository implements AiRequestRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async create(record: Omit<AiRequestRecord, "id">): Promise<AiRequestRecord> {
    const row = await this.prisma.aiRequest.create({
      data: {
        organizationId: record.organizationId,
        workspaceId: record.workspaceId !== "" ? record.workspaceId : null,
        userId: record.userId,
        provider: record.provider,
        model: record.model,
        promptTokens: record.promptTokens,
        completionTokens: record.completionTokens,
        totalTokens: record.totalTokens,
        estimatedCost: record.estimatedCost,
        duration: record.duration,
        success: record.success,
        errorCode: record.errorCode ?? null,
        streaming: false,
      },
    });
    return this.toDomain(row);
  }

  public async findByWorkspaceId(
    workspaceId: string,
    limit = 50,
    offset = 0,
  ): Promise<AiRequestRecord[]> {
    const rows = await this.prisma.aiRequest.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
    return rows.map((r) => this.toDomain(r));
  }

  public async findByOrganizationId(
    organizationId: string,
    limit = 50,
    offset = 0,
  ): Promise<AiRequestRecord[]> {
    const rows = await this.prisma.aiRequest.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
    return rows.map((r) => this.toDomain(r));
  }

  private toDomain(row: {
    id: string;
    organizationId: string;
    workspaceId: string | null;
    userId: string;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
    duration: number;
    success: boolean;
    errorCode: string | null;
    createdAt: Date;
  }): AiRequestRecord {
    return {
      id: row.id,
      organizationId: row.organizationId,
      workspaceId: row.workspaceId ?? "",
      userId: row.userId,
      provider: row.provider,
      model: row.model,
      promptTokens: row.promptTokens,
      completionTokens: row.completionTokens,
      totalTokens: row.totalTokens,
      estimatedCost: row.estimatedCost,
      duration: row.duration,
      success: row.success,
      ...(row.errorCode !== null ? { errorCode: row.errorCode } : {}),
      timestamp: row.createdAt,
    };
  }
}
