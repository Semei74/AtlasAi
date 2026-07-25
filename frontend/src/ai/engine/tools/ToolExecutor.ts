import { ToolRegistry } from './ToolRegistry';
import type {
  ToolCallRequest,
  ToolCallResult,
  ToolContext,
  ToolValidationResult,
  ToolValidationError,
  PermissionCheck,
} from './types';

type ToolHandler = (params: Record<string, unknown>, context: ToolContext) => Promise<unknown>;

export class ToolExecutor {
  private registry: ToolRegistry;
  private handlers: Map<string, ToolHandler> = new Map();
  private permissionCheckers: Array<(toolName: string, context: ToolContext) => Promise<PermissionCheck>> = [];

  constructor(registry: ToolRegistry) {
    this.registry = registry;
  }

  registerHandler(name: string, handler: ToolHandler): void {
    this.handlers.set(name, handler);
  }

  unregisterHandler(name: string): void {
    this.handlers.delete(name);
  }

  addPermissionChecker(checker: (toolName: string, context: ToolContext) => Promise<PermissionCheck>): void {
    this.permissionCheckers.push(checker);
  }

  async execute(request: ToolCallRequest, context: ToolContext = { metadata: {} }): Promise<ToolCallResult> {
    const start = Date.now();
    const tool = this.registry.get(request.toolName);
    if (!tool) {
      return {
        success: false,
        data: null,
        error: `Tool '${request.toolName}' not found`,
        duration: Date.now() - start,
      };
    }

    const validation = this.validate(request.toolName, request.parameters);
    if (!validation.valid) {
      return {
        success: false,
        data: null,
        error: validation.errors.map((e) => e.message).join('; '),
        duration: Date.now() - start,
      };
    }

    const permission = await this.checkPermission(request.toolName, context);
    if (!permission.allowed) {
      return {
        success: false,
        data: null,
        error: permission.reason ?? 'Permission denied',
        duration: Date.now() - start,
      };
    }

    const handler = this.handlers.get(request.toolName);
    if (!handler) {
      return {
        success: false,
        data: null,
        error: `Handler for '${request.toolName}' not registered`,
        duration: Date.now() - start,
      };
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Tool '${request.toolName}' timed out`)), tool.timeout),
      );

      const result = await Promise.race([
        handler(validation.resolvedParameters, context),
        timeoutPromise,
      ]);

      return {
        success: true,
        data: result,
        duration: Date.now() - start,
      };
    } catch (err) {
      return {
        success: false,
        data: null,
        error: err instanceof Error ? err.message : 'Tool execution failed',
        duration: Date.now() - start,
      };
    }
  }

  async executeBatch(requests: ToolCallRequest[], context: ToolContext = { metadata: {} }): Promise<ToolCallResult[]> {
    return Promise.all(requests.map((req) => this.execute(req, context)));
  }

  validate(toolName: string, parameters: Record<string, unknown>): ToolValidationResult {
    const tool = this.registry.get(toolName);
    if (!tool) {
      return {
        valid: false,
        errors: [{ parameter: 'tool', message: `Tool '${toolName}' not found`, code: 'missing_required' }],
        resolvedParameters: {},
      };
    }

    const errors: ToolValidationError[] = [];
    const resolved: Record<string, unknown> = { ...parameters };

    for (const param of tool.parameters) {
      const value = parameters[param.name];

      if (value === undefined || value === null) {
        if (param.required) {
          if (param.default !== undefined) {
            resolved[param.name] = param.default;
          } else {
            errors.push({
              parameter: param.name,
              message: `Required parameter '${param.name}' is missing`,
              code: 'missing_required',
            });
          }
        } else if (param.default !== undefined) {
          resolved[param.name] = param.default;
        }
        continue;
      }

      if (param.enum && !param.enum.includes(value as string)) {
        errors.push({
          parameter: param.name,
          message: `Parameter '${param.name}' must be one of: ${param.enum.join(', ')}`,
          code: 'invalid_enum',
        });
        continue;
      }

      const typeMismatch = this.checkType(value, param.type);
      if (typeMismatch) {
        errors.push({
          parameter: param.name,
          message: `Parameter '${param.name}' expected ${param.type}, got ${typeof value}`,
          code: 'type_mismatch',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      resolvedParameters: resolved,
    };
  }

  private async checkPermission(toolName: string, context: ToolContext): Promise<PermissionCheck> {
    const tool = this.registry.get(toolName);
    if (!tool) return { allowed: false, reason: 'Tool not found', requiresConfirmation: false };

    if (tool.permission === 'never') {
      return { allowed: false, reason: `Tool '${toolName}' is disabled`, requiresConfirmation: false };
    }

    if (tool.permission === 'always') {
      return { allowed: true, requiresConfirmation: tool.requiresConfirmation };
    }

    for (const checker of this.permissionCheckers) {
      const result = await checker(toolName, context);
      if (!result.allowed) return result;
    }

    return { allowed: true, requiresConfirmation: tool.requiresConfirmation };
  }

  private checkType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value !== 'string';
      case 'number':
        return typeof value !== 'number' || isNaN(value as number);
      case 'boolean':
        return typeof value !== 'boolean';
      case 'object':
        return typeof value !== 'object' || value === null || Array.isArray(value);
      case 'array':
        return !Array.isArray(value);
      default:
        return false;
    }
  }

  hasHandler(name: string): boolean {
    return this.handlers.has(name);
  }

  clearHandlers(): void {
    this.handlers.clear();
  }
}
