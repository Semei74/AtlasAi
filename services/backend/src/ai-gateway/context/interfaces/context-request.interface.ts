import type { ContextSourceType } from "./context-source-type.enum.js";

export interface ContextRequestOptions {
  readonly includeSystemContext?: boolean;
  readonly includeUserContext?: boolean;
  readonly includeConversationHistory?: boolean;
  readonly prioritizeFreshness?: boolean;
  readonly securityContext?: {
    readonly roles: readonly string[];
    readonly permissions: readonly string[];
  };
}

export interface ContextRequest {
  readonly userId: string;
  readonly organizationId: string;
  readonly workspaceId?: string;
  readonly conversationId?: string;
  readonly query?: string;
  readonly maxTokens: number;
  readonly timeoutMs?: number;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly requiredSources?: readonly ContextSourceType[];
  readonly options?: ContextRequestOptions;
}
