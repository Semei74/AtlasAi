import type { ToolExecutor, ToolResult } from "../../providers/interfaces/tool-executor.interface.js";

export const TOOL_CALLING_ENGINE = "TOOL_CALLING_ENGINE";

export interface ToolValidationResult {
  readonly valid: boolean;
  readonly error?: string;
}

export interface ToolCallingEngine extends ToolExecutor {
  validate(toolName: string, args: Record<string, unknown>): ToolValidationResult;
  formatResult(result: ToolResult): string;
}
