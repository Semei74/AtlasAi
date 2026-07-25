import { Injectable } from "@nestjs/common";
import type { Prompt } from "../interfaces/prompt.interface.js";
import type { PromptCache } from "../interfaces/prompt-cache.interface.js";

interface CacheEntry {
  readonly prompt: Prompt;
  readonly cachedAt: number;
}

@Injectable()
export class PromptCacheService implements PromptCache {
  private readonly store = new Map<string, CacheEntry>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  public constructor(ttlMs = 60_000, maxEntries = 1000) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  public get(id: string, version: string): Promise<Prompt | null> {
    const key = this.buildKey(id, version);
    const entry = this.store.get(key);

    if (entry === undefined) {
      return Promise.resolve(null);
    }

    if (Date.now() - entry.cachedAt > this.ttlMs) {
      this.store.delete(key);
      return Promise.resolve(null);
    }

    return Promise.resolve(entry.prompt);
  }

  public set(id: string, version: string, prompt: Prompt): Promise<void> {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.findOldest();
      if (oldest !== undefined) {
        this.store.delete(oldest[0]);
      }
    }

    const key = this.buildKey(id, version);
    this.store.set(key, { prompt, cachedAt: Date.now() });

    return Promise.resolve();
  }

  public invalidate(id: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(`${id}@`)) {
        this.store.delete(key);
      }
    }

    return Promise.resolve();
  }

  public invalidateAll(): Promise<void> {
    this.store.clear();

    return Promise.resolve();
  }

  public has(id: string, version: string): Promise<boolean> {
    const key = this.buildKey(id, version);
    const entry = this.store.get(key);

    if (entry === undefined) {
      return Promise.resolve(false);
    }

    if (Date.now() - entry.cachedAt > this.ttlMs) {
      this.store.delete(key);
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  public size(): Promise<number> {
    return Promise.resolve(this.store.size);
  }

  private buildKey(id: string, version: string): string {
    return `${id}@${version}`;
  }

  private findOldest(): [string, CacheEntry] | undefined {
    let oldest: [string, CacheEntry] | undefined;

    for (const [key, entry] of this.store.entries()) {
      if (oldest === undefined || entry.cachedAt < oldest[1].cachedAt) {
        oldest = [key, entry];
      }
    }

    return oldest;
  }
}
