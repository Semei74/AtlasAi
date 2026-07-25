import { Injectable } from "@nestjs/common";
import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentDescriptor } from "../interfaces/agent-descriptor.interface.js";
import type { AgentFilter } from "../interfaces/agent-filter.interface.js";
import type { AgentSearchOptions, AgentSearchResult, AgentSortField } from "../interfaces/agent-search-options.interface.js";
import type { AgentHealthStatus } from "../interfaces/agent-health.interface.js";

@Injectable()
export class AgentDiscoveryService {
  public search(
    agents: readonly AgentDefinition[],
    healthMap: ReadonlyMap<string, AgentHealthStatus>,
    options: AgentSearchOptions,
  ): AgentSearchResult {
    let filtered = [...agents];

    if (options.query !== undefined && options.query.trim().length > 0) {
      const q = options.query.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q),
      );
    }

    if (options.filter !== undefined) {
      filtered = this.applyFilter(filtered, options.filter);
    }

    const total = filtered.length;

    if (options.sort !== undefined) {
      filtered = this.applySort(filtered, options.sort, options.sortOrder ?? "asc");
    }

    const offset = Math.max(0, options.offset);
    const limit = Math.max(1, Math.min(100, options.limit));
    const items = filtered.slice(offset, offset + limit).map(
      (a) => this.toDescriptor(a, healthMap.get(a.id) ?? null),
    );

    return { items, total, offset, limit };
  }

  public filter(
    agents: readonly AgentDefinition[],
    healthMap: ReadonlyMap<string, AgentHealthStatus>,
    filter: AgentFilter,
  ): readonly AgentDescriptor[] {
    return this.applyFilter([...agents], filter).map(
      (a) => this.toDescriptor(a, healthMap.get(a.id) ?? null),
    );
  }

  public toDescriptor(
    agent: AgentDefinition,
    health: AgentHealthStatus | null,
  ): AgentDescriptor {
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      version: agent.version,
      capabilities: agent.capabilities,
      enabled: agent.enabled,
      state: agent.state,
      health: health ?? {
        status: "unknown",
        lastChecked: null,
        responseTimeMs: null,
        lastError: null,
        consecutiveFailures: 0,
      },
      tags: [...agent.tags],
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }

  private applyFilter(
    agents: AgentDefinition[],
    filter: AgentFilter,
  ): AgentDefinition[] {
    return agents.filter((a) => {
      if (filter.capabilities !== undefined) {
        for (const [cap, value] of Object.entries(filter.capabilities)) {
          const boolVal = value as boolean | undefined;
          if (boolVal !== undefined && a.capabilities[cap as keyof typeof a.capabilities] !== boolVal) {
            return false;
          }
        }
      }

      if (filter.providers !== undefined && filter.providers.length > 0) {
        if (!filter.providers.some((p) => a.supportedProviders.includes(p))) {
          return false;
        }
      }

      if (filter.models !== undefined && filter.models.length > 0) {
        if (!filter.models.some((m) => a.supportedModels.includes(m))) {
          return false;
        }
      }

      if (filter.tags !== undefined && filter.tags.length > 0) {
        if (!filter.tags.every((t) => a.tags.includes(t))) {
          return false;
        }
      }

      if (filter.organizationId !== undefined) {
        if (!a.tags.includes(filter.organizationId) && !a.tags.includes(`org:${filter.organizationId}`)) {
          return false;
        }
      }

      if (filter.workspaceId !== undefined) {
        if (!a.tags.includes(filter.workspaceId) && !a.tags.includes(`ws:${filter.workspaceId}`)) {
          return false;
        }
      }

      if (filter.enabled !== undefined && a.enabled !== filter.enabled) {
        return false;
      }

      if (filter.state !== undefined && a.state !== filter.state) {
        return false;
      }

      if (filter.version !== undefined && a.version !== filter.version) {
        return false;
      }

      return true;
    });
  }

  private applySort(
    agents: AgentDefinition[],
    field: AgentSortField,
    order: "asc" | "desc",
  ): AgentDefinition[] {
    const dir = order === "asc" ? 1 : -1;
    return [...agents].sort((a, b) => {
      let cmp = 0;
      switch (field) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "version":
          cmp = a.version.localeCompare(b.version);
          break;
        case "createdAt":
          cmp = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "updatedAt":
          cmp = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case "state":
          cmp = a.state.localeCompare(b.state);
          break;
      }
      return cmp * dir;
    });
  }
}
