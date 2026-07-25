export interface PromptTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly template: string;
  readonly variables: readonly string[];
  readonly version: number;
  readonly tags: readonly string[];
  readonly enabled: boolean;
}

export interface PromptTemplateStore {
  readonly get: (id: string) => Promise<PromptTemplate | null>;
  readonly findByName: (name: string) => Promise<PromptTemplate | null>;
  readonly list: (tags?: readonly string[]) => Promise<readonly PromptTemplate[]>;
  readonly render: (id: string, variables: Record<string, string>) => Promise<string>;
}
