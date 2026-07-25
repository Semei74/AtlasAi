import { Injectable } from "@nestjs/common";
import { type ToolRegistry, type ToolHandler, type RegisteredTool } from "./interfaces/tool-registry.interface.js";
import type { ToolDefinition, ToolType } from "../providers/interfaces/tool-executor.interface.js";

@Injectable()
export class DefaultToolRegistry implements ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  public register(definition: ToolDefinition, handler: ToolHandler): void {
    this.tools.set(definition.name, { definition, handler });
  }

  public unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  public has(name: string): boolean {
    return this.tools.has(name);
  }

  public get(name: string): RegisteredTool | null {
    return this.tools.get(name) ?? null;
  }

  public list(): readonly ToolDefinition[] {
    return [...this.tools.values()].map((tool) => tool.definition);
  }

  public listByType(type: ToolType): readonly ToolDefinition[] {
    return this.list().filter((definition) => definition.type === type);
  }
}
