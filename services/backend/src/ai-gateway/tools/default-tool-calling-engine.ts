import { Injectable, Inject, Logger } from "@nestjs/common";
import {
  type ToolCallingEngine,
  type ToolValidationResult,
} from "./interfaces/tool-calling-engine.interface.js";
import { TOOL_REGISTRY, type ToolRegistry } from "./interfaces/tool-registry.interface.js";
import type { ToolCall, ToolDefinition, ToolResult } from "../providers/interfaces/tool-executor.interface.js";
import { validateToolArguments } from "./schema/tool-schema-validator.js";

@Injectable()
export class DefaultToolCallingEngine implements ToolCallingEngine {
  private readonly logger = new Logger(DefaultToolCallingEngine.name);

  public constructor(@Inject(TOOL_REGISTRY) private readonly registry: ToolRegistry) {}

  public async execute(call: ToolCall): Promise<ToolResult> {
    const start = Date.now();
    const registered = this.registry.get(call.toolName);

    if (!registered) {
      return this.failure(call.id, call.toolName, `Unknown tool: ${call.toolName}`, start);
    }
    if (!registered.definition.enabled) {
      return this.failure(call.id, call.toolName, `Tool is disabled: ${call.toolName}`, start);
    }

    const validation = this.validate(call.toolName, call.arguments);
    if (!validation.valid) {
      return this.failure(call.id, call.toolName, validation.error ?? "Invalid arguments", start);
    }

    try {
      const output = await registered.handler(call.arguments);
      const durationMs = Date.now() - start;
      this.logger.debug(`Executed tool ${call.toolName} in ${String(durationMs)}ms`);
      return { toolCallId: call.id, success: true, output, errorMessage: null, durationMs };
    } catch (error: unknown) {
      return this.failure(call.id, call.toolName, error instanceof Error ? error.message : String(error), start);
    }
  }

  public async executeBatch(calls: readonly ToolCall[]): Promise<readonly ToolResult[]> {
    return Promise.all(calls.map((call) => this.execute(call)));
  }

  public listTools(): Promise<readonly ToolDefinition[]> {
    return Promise.resolve(this.registry.list());
  }

  public validate(toolName: string, args: Record<string, unknown>): ToolValidationResult {
    const registered = this.registry.get(toolName);
    if (!registered) {
      return { valid: false, error: `Unknown tool: ${toolName}` };
    }
    return validateToolArguments(registered.definition.inputSchema, args);
  }

  public formatResult(result: ToolResult): string {
    if (result.success) {
      return `Tool result [${result.toolCallId}]: ${safeStringify(result.output)}`;
    }
    return `Tool error [${result.toolCallId}]: ${result.errorMessage ?? "unknown error"}`;
  }

  private failure(toolCallId: string, toolName: string, errorMessage: string, start: number): ToolResult {
    this.logger.warn(`Tool ${toolName} failed: ${errorMessage}`);
    return { toolCallId, success: false, output: null, errorMessage, durationMs: Date.now() - start };
  }
}

function safeStringify(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
