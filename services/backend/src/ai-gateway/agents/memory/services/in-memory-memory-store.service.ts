import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { AgentMemoryEntry, AgentMemoryType } from "../../interfaces/agent-memory.interface.js";
import type { MemoryStore } from "../interfaces/agent-memory-store.interface.js";

@Injectable()
export class InMemoryMemoryStore implements MemoryStore {
  private readonly entries = new Map<string, AgentMemoryEntry>();
  private readonly byAgent = new Map<string, Set<string>>();

  public save(entry: AgentMemoryEntry): Promise<AgentMemoryEntry> {
    const id = entry.id || randomUUID();
    const stored: AgentMemoryEntry = { ...entry, id };

    this.entries.set(id, stored);

    const agentKey = `${entry.agentId}:${entry.type}`;
    const existing = this.byAgent.get(agentKey) ?? new Set();
    existing.add(id);
    this.byAgent.set(agentKey, existing);

    return Promise.resolve(stored);
  }

  public get(id: string): Promise<AgentMemoryEntry | null> {
    return Promise.resolve(this.entries.get(id) ?? null);
  }

  public findByKey(
    agentId: string,
    key: string,
    type: AgentMemoryType,
  ): Promise<AgentMemoryEntry | null> {
    const agentKey = `${agentId}:${type}`;
    const ids = this.byAgent.get(agentKey);
    if (!ids) return Promise.resolve(null);

    for (const id of ids) {
      const entry = this.entries.get(id);
      if (entry?.key === key) return Promise.resolve(entry);
    }
    return Promise.resolve(null);
  }

  public findByAgent(
    agentId: string,
    type?: AgentMemoryType,
  ): Promise<readonly AgentMemoryEntry[]> {
    if (type) {
      const agentKey = `${agentId}:${type}`;
      const ids = this.byAgent.get(agentKey);
      if (!ids) return Promise.resolve([]);
      return Promise.resolve(
        [...ids].map((id) => this.entries.get(id)).filter(Boolean) as AgentMemoryEntry[],
      );
    }

    const results: AgentMemoryEntry[] = [];
    const allTypes = ["session", "conversation", "workspace", "longTerm", "vector"] as const;
    for (const t of allTypes) {
      const agentKey = `${agentId}:${t}`;
      const ids = this.byAgent.get(agentKey);
      if (ids) {
        for (const id of ids) {
          const entry = this.entries.get(id);
          if (entry) results.push(entry);
        }
      }
    }
    return Promise.resolve(results);
  }

  public findRecent(
    agentId: string,
    type: AgentMemoryType,
    limit: number,
  ): Promise<readonly AgentMemoryEntry[]> {
    const agentKey = `${agentId}:${type}`;
    const ids = this.byAgent.get(agentKey);
    if (!ids) return Promise.resolve([]);

    const entries: AgentMemoryEntry[] = [];
    for (const id of ids) {
      const entry = this.entries.get(id);
      if (entry) entries.push(entry);
    }

    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return Promise.resolve(entries.slice(0, limit));
  }

  public search(
    agentId: string,
    query: string,
    type: AgentMemoryType,
  ): Promise<readonly AgentMemoryEntry[]> {
    const agentKey = `${agentId}:${type}`;
    const ids = this.byAgent.get(agentKey);
    if (!ids) return Promise.resolve([]);

    const lowerQuery = query.toLowerCase();
    const entries: AgentMemoryEntry[] = [];
    for (const id of ids) {
      const entry = this.entries.get(id);
      if (
        entry &&
        (entry.key.toLowerCase().includes(lowerQuery) ||
          entry.value.toLowerCase().includes(lowerQuery))
      ) {
        entries.push(entry);
      }
    }

    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return Promise.resolve(entries);
  }

  public delete(id: string): Promise<boolean> {
    const entry = this.entries.get(id);
    if (!entry) return Promise.resolve(false);

    this.entries.delete(id);
    const agentKey = `${entry.agentId}:${entry.type}`;
    const ids = this.byAgent.get(agentKey);
    if (ids) {
      ids.delete(id);
      if (ids.size === 0) this.byAgent.delete(agentKey);
    }
    return Promise.resolve(true);
  }

  public deleteByAgent(agentId: string, type?: AgentMemoryType): Promise<void> {
    if (type) {
      const agentKey = `${agentId}:${type}`;
      const ids = this.byAgent.get(agentKey);
      if (ids) {
        for (const id of ids) this.entries.delete(id);
        this.byAgent.delete(agentKey);
      }
      return Promise.resolve();
    }

    const allTypes = ["session", "conversation", "workspace", "longTerm", "vector"] as const;
    for (const t of allTypes) {
      const agentKey = `${agentId}:${t}`;
      const ids = this.byAgent.get(agentKey);
      if (ids) {
        for (const id of ids) this.entries.delete(id);
        this.byAgent.delete(agentKey);
      }
    }
    return Promise.resolve();
  }

  public count(agentId: string, type?: AgentMemoryType): Promise<number> {
    if (type) {
      const agentKey = `${agentId}:${type}`;
      return Promise.resolve(this.byAgent.get(agentKey)?.size ?? 0);
    }

    let total = 0;
    const allTypes = ["session", "conversation", "workspace", "longTerm", "vector"] as const;
    for (const t of allTypes) {
      total += this.byAgent.get(`${agentId}:${t}`)?.size ?? 0;
    }
    return Promise.resolve(total);
  }

  public clear(): Promise<void> {
    this.entries.clear();
    this.byAgent.clear();
    return Promise.resolve();
  }
}
