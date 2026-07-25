import type { PromptStatus, PromptVisibility } from "../../../generated/prisma/enums.js";

export interface PromptVariableDefinition {
  readonly name: string;
  readonly type: "string" | "number" | "boolean" | "object" | "array";
  readonly required: boolean;
  readonly defaultValue?: unknown;
  readonly description?: string;
}

export interface CreatePromptDto {
  readonly slug: string;
  readonly name: string;
  readonly description?: string;
  readonly categoryId: string;
  readonly systemTemplate?: string;
  readonly userTemplate?: string;
  readonly assistantTemplate?: string;
  readonly variables?: readonly PromptVariableDefinition[];
  readonly schema?: Record<string, unknown>;
  readonly tags?: readonly string[];
  readonly metadata?: Record<string, unknown>;
  readonly visibility?: PromptVisibility;
}

export interface UpdatePromptDto {
  readonly name?: string;
  readonly description?: string;
  readonly categoryId?: string;
  readonly tags?: readonly string[];
  readonly metadata?: Record<string, unknown>;
  readonly visibility?: PromptVisibility;
}

export interface CreateVersionDto {
  readonly systemTemplate?: string;
  readonly userTemplate?: string;
  readonly assistantTemplate?: string;
  readonly variables?: readonly PromptVariableDefinition[];
  readonly schema?: Record<string, unknown>;
  readonly changelog?: string;
}

export interface PromptRenderRequest {
  readonly promptId: string;
  readonly version?: string;
  readonly variables: Record<string, unknown>;
  readonly redactPii?: boolean;
}

export interface PromptRenderResult {
  readonly id: string;
  readonly version: string;
  readonly system?: string;
  readonly user?: string;
  readonly assistant?: string;
  readonly variables: readonly string[];
  readonly missingVariables: readonly string[];
  readonly unknownVariables: readonly string[];
}

export interface PreviewRequest {
  readonly systemTemplate?: string;
  readonly userTemplate?: string;
  readonly assistantTemplate?: string;
  readonly variables: Record<string, unknown>;
}

export interface VersionComparison {
  readonly versionA: string;
  readonly versionB: string;
  readonly systemChanged: boolean;
  readonly userChanged: boolean;
  readonly assistantChanged: boolean;
  readonly variablesChanged: boolean;
  readonly schemaChanged: boolean;
}

export interface PromptFilter {
  readonly status?: PromptStatus;
  readonly categoryId?: string;
  readonly search?: string;
  readonly tags?: readonly string[];
  readonly organizationId?: string;
  readonly workspaceId?: string;
  readonly ownerId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface PromptVersion {
  readonly id: string;
  readonly promptId: string;
  readonly version: string;
  readonly systemTemplate?: string | null;
  readonly userTemplate?: string | null;
  readonly assistantTemplate?: string | null;
  readonly variables: readonly Record<string, unknown>[];
  readonly schema?: Record<string, unknown> | null;
  readonly changelog?: string | null;
  readonly checksum: string;
  readonly createdBy: string;
  readonly createdAt: Date;
}

export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}
