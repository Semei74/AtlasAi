export interface PromptMetadata {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tags: readonly string[];
  readonly language: string;
  readonly providerCompatibility: readonly string[];
  readonly modelCompatibility: readonly string[];
  readonly variables: readonly string[];
}

export const PROMPT_METADATA_REQUIRED_FIELDS: readonly (keyof PromptMetadata)[] = [
  "name",
  "description",
  "version",
  "author",
  "createdAt",
  "updatedAt",
];
