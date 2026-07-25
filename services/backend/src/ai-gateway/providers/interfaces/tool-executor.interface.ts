export type ToolType = "function" | "mcp" | "api" | "code_interpreter" | "retrieval";

export interface ToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly type: ToolType;
  readonly inputSchema: Record<string, unknown>;
  readonly enabled: boolean;
}

export interface ToolCall {
  readonly id: string;
  readonly toolName: string;
  readonly arguments: Record<string, unknown>;
}

export interface ToolResult {
  readonly toolCallId: string;
  readonly success: boolean;
  readonly output: unknown;
  readonly errorMessage: string | null;
  readonly durationMs: number;
}

export interface ToolExecutor {
  readonly execute: (call: ToolCall) => Promise<ToolResult>;
  readonly executeBatch: (calls: readonly ToolCall[]) => Promise<readonly ToolResult[]>;
  readonly listTools: () => Promise<readonly ToolDefinition[]>;
}
