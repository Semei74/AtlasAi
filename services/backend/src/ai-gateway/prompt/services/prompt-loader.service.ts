import { Injectable } from "@nestjs/common";
import type { Prompt } from "../interfaces/prompt.interface.js";
import type { PromptCategory } from "../interfaces/prompt-category.enum.js";
import type { PromptLoader } from "../interfaces/prompt-loader.interface.js";

@Injectable()
export class PromptLoaderService implements PromptLoader {
  private readonly prompts = new Map<string, Map<string, Prompt>>();

  public register(prompt: Prompt): void {
    const key = prompt.id;
    const version = prompt.metadata.version;

    let versions = this.prompts.get(key);
    if (versions === undefined) {
      versions = new Map();
      this.prompts.set(key, versions);
    }

    versions.set(version, prompt);
  }

  public load(id: string, version?: string): Promise<Prompt | null> {
    const versions = this.prompts.get(id);

    if (versions === undefined || versions.size === 0) {
      return Promise.resolve(null);
    }

    if (version !== undefined) {
      return Promise.resolve(versions.get(version) ?? null);
    }

    return Promise.resolve(this.findLatest(versions) ?? null);
  }

  public exists(id: string): Promise<boolean> {
    const versions = this.prompts.get(id);

    return Promise.resolve(versions !== undefined && versions.size > 0);
  }

  public list(): Promise<readonly Prompt[]> {
    const all: Prompt[] = [];

    for (const versions of this.prompts.values()) {
      for (const prompt of versions.values()) {
        all.push(prompt);
      }
    }

    return Promise.resolve(all);
  }

  public async listByCategory(category: PromptCategory): Promise<readonly Prompt[]> {
    const all = await this.list();

    return all.filter((p) => p.category === category);
  }

  public getLatestVersion(id: string): Promise<string | null> {
    const versions = this.prompts.get(id);

    if (versions === undefined || versions.size === 0) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.findLatest(versions)?.metadata.version ?? null);
  }

  public getVersion(id: string, version: string): Promise<Prompt | null> {
    const versions = this.prompts.get(id);

    if (versions === undefined) {
      return Promise.resolve(null);
    }

    return Promise.resolve(versions.get(version) ?? null);
  }

  private findLatest(versions: Map<string, Prompt>): Prompt | null {
    let latest: Prompt | null = null;

    for (const prompt of versions.values()) {
      if (latest === null || prompt.metadata.createdAt > latest.metadata.createdAt) {
        latest = prompt;
      }
    }

    return latest;
  }
}
