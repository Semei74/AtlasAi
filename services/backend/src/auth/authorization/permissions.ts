import { Role } from "./interfaces/role.interface.js";

const CATEGORIES = {
  ALL: [
    "authentication",
    "organizations",
    "workspaces",
    "projects",
    "chats",
    "files",
    "ai",
    "memory",
    "billing",
    "administration",
    "mcp_tools",
    "notifications",
  ] as const,
  FULL_ACCESS: [
    "workspaces",
    "projects",
    "chats",
    "files",
    "ai",
    "memory",
    "notifications",
    "mcp_tools",
  ] as const,
  READ_ONLY: ["authentication", "organizations", "billing", "administration"] as const,
  USER_READ_ONLY: ["workspaces", "projects", "ai", "memory"] as const,
  USER_FULL_ACCESS: ["chats", "files", "notifications"] as const,
  VIEWER_READ_ONLY: [
    "workspaces",
    "projects",
    "chats",
    "files",
    "ai",
    "memory",
    "notifications",
  ] as const,
};

function allActions(categories: readonly string[]): string[] {
  const actions = ["create", "read", "update", "delete", "manage"];
  return categories.flatMap((cat) => actions.map((a) => `${cat}:${a}`));
}

function readOnly(categories: readonly string[]): string[] {
  return categories.map((cat) => `${cat}:read`);
}

function crudOnly(categories: readonly string[]): string[] {
  const actions = ["create", "read", "update", "delete"];
  return categories.flatMap((cat) => actions.map((a) => `${cat}:${a}`));
}

export const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  [Role.Owner]: allActions(CATEGORIES.ALL),
  [Role.Admin]: allActions(CATEGORIES.ALL),
  [Role.Manager]: [...allActions(CATEGORIES.FULL_ACCESS), ...readOnly(CATEGORIES.READ_ONLY)],
  [Role.User]: [...crudOnly(CATEGORIES.USER_FULL_ACCESS), ...readOnly(CATEGORIES.USER_READ_ONLY)],
  [Role.Viewer]: readOnly(CATEGORIES.VIEWER_READ_ONLY),
};
