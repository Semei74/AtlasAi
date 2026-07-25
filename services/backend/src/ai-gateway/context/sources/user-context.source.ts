import { Injectable } from "@nestjs/common";
import type { ContextSource } from "../interfaces/context-source.interface.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";

@Injectable()
export class UserContextSource implements ContextSource {
  public readonly type = ContextSourceType.User;
  public readonly name = "User Context";

  public collect(request: ContextRequest): Promise<readonly ContextItem[]> {
    if (request.options?.includeUserContext === false) return Promise.resolve([]);

    const item: ContextItem = {
      id: `user:${request.userId}`,
      sourceType: this.type,
      content: `User ID: ${request.userId}\nOrganization ID: ${request.organizationId}${
        request.workspaceId !== undefined ? `\nWorkspace ID: ${request.workspaceId}` : ""
      }`,
      metadata: {
        userId: request.userId,
        organizationId: request.organizationId,
        workspaceId: request.workspaceId,
        label: "User Information",
      },
      tokenCount: 0,
      priority: 40,
      score: 0,
      freshness: new Date(),
      permissions: ["user:profile:read"],
    };

    return Promise.resolve([item]);
  }

  public isAvailable(): boolean {
    return true;
  }
}
