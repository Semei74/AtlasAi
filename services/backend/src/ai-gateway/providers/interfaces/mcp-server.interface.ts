export interface McpServerInfo {
  readonly name: string;
  readonly version: string;
  readonly description: string | null;
  readonly enabled: boolean;
  readonly endpoint: string | null;
}

export interface McpResource {
  readonly uri: string;
  readonly name: string;
  readonly description: string | null;
  readonly mimeType: string | null;
}

export interface McpTool {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Record<string, unknown>;
}

export interface McpServer {
  readonly info: McpServerInfo;
  readonly getResources: () => Promise<readonly McpResource[]>;
  readonly getTools: () => Promise<readonly McpTool[]>;
  readonly callTool: (toolName: string, arguments_: Record<string, unknown>) => Promise<unknown>;
}
