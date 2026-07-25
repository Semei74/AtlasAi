import { Injectable } from "@nestjs/common";
import type { ContextSource } from "../interfaces/context-source.interface.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import { PrismaService } from "../../../prisma/prisma.service.js";
import { TokenCounter } from "../utils/token-counter.js";

@Injectable()
export class WorkspaceContextSource implements ContextSource {
  public readonly type = ContextSourceType.Workspace;
  public readonly name = "Workspace Context";
  private readonly tokenCounter = new TokenCounter();

  public constructor(private readonly prisma: PrismaService) {}

  public async collect(request: ContextRequest): Promise<readonly ContextItem[]> {
    if (request.workspaceId === undefined) return [];

    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: request.workspaceId },
      });

      if (workspace === null) return [];

      const content = [
        `Workspace: ${workspace.name}`,
        workspace.description !== null ? `Description: ${workspace.description}` : null,
        workspace.color !== null ? `Color: ${workspace.color}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const tokenCount = this.tokenCounter.estimateTokens(content);

      const item: ContextItem = {
        id: `workspace:${workspace.id}`,
        sourceType: ContextSourceType.Workspace,
        content,
        metadata: {
          workspaceId: workspace.id,
          name: workspace.name,
          description: workspace.description,
          settings: workspace.settings,
          label: "Current Workspace",
        },
        tokenCount,
        priority: 35,
        score: 0,
        freshness: new Date(),
        permissions: ["workspace:read"],
      };

      return [item];
    } catch {
      return [];
    }
  }

  public isAvailable(): boolean {
    return true;
  }
}
