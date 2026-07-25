import type { ToolDefinition, ToolType } from "../../providers/interfaces/tool-executor.interface.js";

export const TOOL_REGISTRY = "TOOL_REGISTRY";

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export interface RegisteredTool {
  readonly definition: ToolDefinition;
  readonly handler: ToolHandler;
}

export interface ToolRegistry {
  register(definition: ToolDefinition, handler: ToolHandler): void;
  unregister(name: string): boolean;
  has(name: string): boolean;
  get(name: string): RegisteredTool | null;
  list(): readonly ToolDefinition[];
  listByType(type: ToolType): readonly ToolDefinition[];
}
