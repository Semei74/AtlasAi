import { Injectable } from "@nestjs/common";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";

@Injectable()
export class ContextFilterService {
  public filter(
    items: readonly ContextItem[],
    request: ContextRequest,
  ): readonly ContextItem[] {
    const securityContext = request.options?.securityContext;
    if (securityContext === undefined) return [...items];

    const userPermissions = securityContext.permissions;

    return items.filter((item) => {
      if (item.permissions.length === 0) return true;
      return item.permissions.some((p) => userPermissions.includes(p));
    });
  }

  public maskSensitiveData(
    items: readonly ContextItem[],
  ): readonly ContextItem[] {
    return items.map((item) => ({
      ...item,
      content: this.applyMasks(item.content),
    }));
  }

  private applyMasks(content: string): string {
    const patterns = [
      { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: "[EMAIL]" },
      { regex: /\b(?:\+?[1-9]\d{0,2})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: "[PHONE]" },
      { regex: /\bssn[-:\s]?\d{3}[-:\s]?\d{2}[-:\s]?\d{4}\b/gi, replacement: "[SSN]" },
      { regex: /\b\d{3}[-]\d{2}[-]\d{4}\b/g, replacement: "[SSN]" },
    ];

    let masked = content;
    for (const pattern of patterns) {
      masked = masked.replace(pattern.regex, pattern.replacement);
    }
    return masked;
  }
}
