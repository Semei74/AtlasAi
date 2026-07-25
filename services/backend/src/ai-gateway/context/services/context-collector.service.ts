import { Injectable } from "@nestjs/common";
import type { ContextSource } from "../interfaces/context-source.interface.js";
import type { ContextRequest } from "../interfaces/context-request.interface.js";
import type { ContextItem } from "../interfaces/context-item.interface.js";
import type { ContextSourceType } from "../interfaces/context-source-type.enum.js";
import type { ContextSourceMetrics } from "../interfaces/context-metrics.interface.js";

const SOURCE_TIMEOUT_MS = 5_000;

@Injectable()
export class ContextCollectorService {
  private readonly sources = new Map<string, ContextSource>();
  private readonly sourceMetrics = new Map<string, ContextSourceMetrics>();
  private readonly sourcePriority: ContextSourceType[] = [];

  public registerSource(source: ContextSource): void {
    this.sources.set(source.type, source);
    this.sourceMetrics.set(source.type, {
      type: source.type,
      collectCount: 0,
      totalItems: 0,
      totalCollectTimeMs: 0,
      errorCount: 0,
      lastCollectTime: null,
    });
    this.sourcePriority.push(source.type);
  }

  public removeSource(type: ContextSourceType): void {
    this.sources.delete(type);
    this.sourceMetrics.delete(type);
    const idx = this.sourcePriority.indexOf(type);
    if (idx !== -1) this.sourcePriority.splice(idx, 1);
  }

  public hasSource(type: ContextSourceType): boolean {
    return this.sources.has(type);
  }

  public async collect(
    request: ContextRequest,
    requiredSources?: readonly ContextSourceType[],
    signal?: AbortSignal,
  ): Promise<readonly ContextItem[]> {
    const items: ContextItem[] = [];

    const sourceTypes = requiredSources !== undefined
      ? [...requiredSources]
      : [...this.sourcePriority];

    for (const type of sourceTypes) {
      if (signal?.aborted === true) break;

      const source = this.sources.get(type);
      if (source?.isAvailable() !== true) continue;

      const start = Date.now();
      try {
        const sourceItems = await this.#collectWithTimeout(source, request, signal);
        const elapsed = Date.now() - start;
        items.push(...sourceItems);

        const metrics = this.sourceMetrics.get(type);
        if (metrics !== undefined) {
          metrics.collectCount += 1;
          metrics.totalItems += sourceItems.length;
          metrics.totalCollectTimeMs += elapsed;
          metrics.lastCollectTime = new Date();
        }
      } catch {
        const metrics = this.sourceMetrics.get(type);
        if (metrics !== undefined) {
          metrics.errorCount += 1;
        }
      }
    }

    return items;
  }

  async #collectWithTimeout(source: ContextSource, request: ContextRequest, signal?: AbortSignal): Promise<readonly ContextItem[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => { controller.abort(); }, SOURCE_TIMEOUT_MS);

    const combinedSignal = signal !== undefined
      ? this.#combineSignals(signal, controller.signal)
      : controller.signal;

    try {
      if (combinedSignal.aborted) return [];
      return await source.collect(request);
    } finally {
      clearTimeout(timeout);
    }
  }

  #combineSignals(s1: AbortSignal, s2: AbortSignal): AbortSignal {
    const controller = new AbortController();
    const abort = (): void => { controller.abort(); };
    s1.addEventListener("abort", abort, { once: true });
    s2.addEventListener("abort", abort, { once: true });
    if (s1.aborted || s2.aborted) controller.abort();
    return controller.signal;
  }

  public getSourceMetrics(): readonly ContextSourceMetrics[] {
    return [...this.sourceMetrics.values()];
  }
}
