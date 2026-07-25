import { Injectable } from "@nestjs/common";
import type { ContextSource } from "../interfaces/context-source.interface.js";
import { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";

@Injectable()
export class SystemContextSource implements ContextSource {
  public readonly type = ContextSourceType.System;
  public readonly name = "System Context";

  public collect(request: ContextRequest): Promise<readonly ContextItem[]> {
    if (request.options?.includeSystemContext === false) return Promise.resolve([]);

    const now = new Date();

    const item: ContextItem = {
      id: "system:current",
      sourceType: this.type,
      content: `Current Date/Time: ${now.toISOString()}\nTimestamp: ${String(now.getTime())}`,
      metadata: {
        timestamp: now.toISOString(),
        label: "Current Date and Time",
      },
      tokenCount: 0,
      priority: 30,
      score: 0,
      freshness: now,
      permissions: [],
    };

    return Promise.resolve([item]);
  }

  public isAvailable(): boolean {
    return true;
  }
}
