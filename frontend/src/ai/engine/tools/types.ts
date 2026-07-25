export type ToolPermission = 'always' | 'ask' | 'never';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  category: string;
  permission: ToolPermission;
  requiresConfirmation: boolean;
  timeout: number;
  metadata?: Record<string, unknown>;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enum?: string[];
  default?: unknown;
}

export interface ToolCallRequest {
  toolName: string;
  parameters: Record<string, unknown>;
  conversationId?: string;
  userId?: string;
}

export interface ToolCallResult {
  success: boolean;
  data: unknown;
  error?: string;
  duration: number;
  toolCalls?: ToolCallRequest[];
}

export interface ToolContext {
  conversationId?: string;
  userId?: string;
  workspaceId?: string;
  projectId?: string;
  metadata: Record<string, unknown>;
}

export interface ToolValidationResult {
  valid: boolean;
  errors: ToolValidationError[];
  resolvedParameters: Record<string, unknown>;
}

export interface ToolValidationError {
  parameter: string;
  message: string;
  code: 'missing_required' | 'type_mismatch' | 'invalid_enum' | 'validation_failed';
}

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
  requiresConfirmation: boolean;
}
