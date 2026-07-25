export type PromptScope = 'system' | 'workspace' | 'project' | 'conversation' | 'user';

export interface PromptVariable {
  key: string;
  label: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface PromptDefinition {
  id: string;
  name: string;
  description: string;
  scope: PromptScope;
  template: string;
  variables: PromptVariable[];
  version: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptMergeResult {
  content: string;
  variables: Record<string, string>;
  warnings: string[];
  errors: string[];
}

export interface PromptValidationResult {
  valid: boolean;
  errors: PromptValidationError[];
  warnings: string[];
  unresolvedVariables: string[];
}

export interface PromptValidationError {
  field: string;
  message: string;
  code: 'missing_required' | 'type_mismatch' | 'validation_failed' | 'unknown_variable';
}

export interface PromptContext {
  systemPrompt?: string;
  workspacePrompt?: string;
  projectPrompt?: string;
  conversationPrompt?: string;
  userPrompt: string;
}

export interface PromptPreview {
  content: string;
  variables: Record<string, string>;
  warnings: string[];
}
