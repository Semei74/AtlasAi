import type { AgentFilter } from "./agent-filter.interface.js";
import type { AgentDescriptor } from "./agent-descriptor.interface.js";

export type AgentSortField = "name" | "version" | "createdAt" | "updatedAt" | "state";

export interface AgentSearchOptions {
  readonly query?: string;
  readonly filter?: AgentFilter;
  readonly sort?: AgentSortField;
  readonly sortOrder?: "asc" | "desc";
  readonly offset: number;
  readonly limit: number;
}

export interface AgentSearchResult {
  readonly items: readonly AgentDescriptor[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
}
