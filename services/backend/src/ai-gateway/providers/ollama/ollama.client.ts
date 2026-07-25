import { Injectable } from "@nestjs/common";
import { AiProviderError } from "@atlas/errors";

export interface OllamaChatMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

export interface OllamaChatRequest {
  readonly model: string;
  readonly messages: readonly OllamaChatMessage[];
  readonly stream?: boolean;
  readonly options?: {
    readonly temperature?: number;
    readonly num_predict?: number;
  };
}

export interface OllamaChatResponse {
  readonly model: string;
  readonly created_at?: string;
  readonly message: OllamaChatMessage;
  readonly done: boolean;
  readonly total_duration?: number;
  readonly load_duration?: number;
  readonly prompt_eval_count?: number;
  readonly eval_count?: number;
  readonly eval_duration?: number;
  // Optional parsed tool result when model emits a TOOL_RESULT marker
  readonly parsedToolResult?: unknown;
}

export interface OllamaTagsResponse {
  readonly models?: readonly { name: string }[];
}

@Injectable()
export class OllamaClient {
  private readonly defaultBaseUrl = "http://localhost:11434";

  private get baseUrl(): string {
    return (process.env as Record<string, string | undefined>)['OLLAMA_BASE_URL'] ?? this.defaultBaseUrl;
  }

  public async chat(request: OllamaChatRequest): Promise<OllamaChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: request.stream ?? false,
        options: request.options,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      throw new AiProviderError(`Ollama API error: ${String(status)}`);
    }

    const body = (await response.json()) as OllamaChatResponse;

    // Try to parse tool result marker if present in assistant content.
    try {
      const content = body.message.content;
      if (typeof content === "string") {
        const parsed = this.extractToolResultFromContent(content);
        if (parsed !== undefined) {
          // normalize common schema mismatches (e.g., `path` -> `filePath`)
          try {
            if (typeof parsed === "object" && parsed !== null) {
              const obj = parsed as Record<string, unknown>;
              const output = obj["output"];
              if (typeof output === "object" && output !== null) {
                const outputObj = output as Record<string, unknown>;
                if (outputObj["path"] !== undefined && outputObj["filePath"] === undefined) {
                  outputObj["filePath"] = outputObj["path"];
                }
              }
              if (obj["path"] !== undefined && obj["filePath"] === undefined) {
                obj["filePath"] = obj["path"];
              }
            }
          } catch {
            // ignore
          }
          (body as OllamaChatResponse & { parsedToolResult: unknown }).parsedToolResult = parsed;
        }
      }
    } catch {
      // noop
    }

    return body;
  }

  public async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private extractToolResultFromContent(content: string): unknown {
    // 1) Look for explicit TOOL_RESULT-like markers followed by JSON, code fences, or backticks
    const markerRe = /(?:TOOL_RESULT|ToolResult|Tool_Result|TOOLRESULT|Tool Result)\s*[:=]\s*(?:```(?:\w*\n)?([\s\S]*?)```|`([\s\S]*?)`|(\{[\s\S]*\}))/i;
    const m = markerRe.exec(content);
    if (m) {
      const raw = m[1] ?? m[2] ?? m[3];
      if (raw) {
        const cleaned = raw.trim();
        const parsed = this.tryParseJson(cleaned);
        if (parsed !== undefined) return parsed;
      }
    }

    // 2) Fallback: JSON inside triple backticks anywhere
    const fenceRe = /```(?:\w*\n)?([\s\S]*?)```/g;
    let fm: RegExpExecArray | null;
    while ((fm = fenceRe.exec(content)) !== null) {
      const candidate = fm[1]?.trim();
      if (!candidate) continue;
      const parsed = this.tryParseJson(candidate);
      if (parsed !== undefined) return parsed;
    }

    // 3) Fallback: JSON inside single backticks
    const inlineCodeRe = /`(\{[\s\S]*?\})`/g;
    while ((fm = inlineCodeRe.exec(content)) !== null) {
      const candidate = fm[1]?.trim();
      if (!candidate) continue;
      const parsed = this.tryParseJson(candidate);
      if (parsed !== undefined) return parsed;
    }

    // 4) Final fallback: try to extract the first balanced JSON object in text
    const firstBrace = content.indexOf("{");
    if (firstBrace >= 0) {
      const candidate = this.extractBalancedJson(content, firstBrace);
      if (candidate) {
        const parsed = this.tryParseJson(candidate);
        if (parsed !== undefined) return parsed;
      }
    }

    return undefined;
  }

  private tryParseJson(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      // try to clean common issues: trailing commas
      try {
        const cleaned = raw.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
        return JSON.parse(cleaned);
      } catch {
        return undefined;
      }
    }
  }

  private extractBalancedJson(text: string, startIndex: number): string | undefined {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = startIndex; i < text.length; i++) {
      const ch = text[i];
      if (inString) {
        if (escape) {
          escape = false;
        } else if (ch === "\\") {
          escape = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }
      if (ch === '"') {
        inString = true;
        continue;
      }
      if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) {
          return text.slice(startIndex, i + 1);
        }
      }
    }
    return undefined;
  }
}
