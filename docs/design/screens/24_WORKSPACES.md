# 24 — Workspaces

## Overview

**Purpose:** Manage workspaces (warehouses/locations) and their configurations.

**Business Goal:** Support multi-site inventory management. Enable workspace-level administration.

**User Goal:** I want to view, create, and manage workspaces for different locations or departments.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Sidebar "Workspaces", Settings "Workspace", Top bar workspace switcher | Workspace list |
| **To** | Workspace detail, Settings, Users (scoped), Materials (scoped) | Workspace actions |

---

## User Story

> As an admin, I want to manage workspaces so that each location operates independently with its own inventory and users.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Workspaces (24px SemiBold)        [+ New Worksp.]│
│ Side   │  ┌────────────────────────────────────────────┐    │
│ Bar    │  │  ┌──────┐  Main Warehouse                  │    │
│        │  │  │Icon  │  ● 1,245 materials               │    │
│        │  │  │64px  │  12 users  |  Aisle 1-20         │    │
│        │  │  └──────┘  [Open] [Settings] [Archive]     │    │
│        │  ├────────────────────────────────────────────┤    │
│        │  │  ┌──────┐  Secondary Storage               │    │
│        │  │  │Icon  │  ● 543 materials                 │    │
│        │  │  │64px  │  5 users  |  Aisle A-H           │    │
│        │  │  └──────┘  [Open] [Settings] [Archive]     │    │
│        │  ├────────────────────────────────────────────┤    │
│        │  │  ┌──────┐  Workshop B                      │    │
│        │  │  │Icon  │  ○ 89 materials                  │    │
│        │  │  │64px  │  3 users  |  Bench 1-5           │    │
│        │  │  └──────┘  [Open] [Settings] [Activate]    │    │
│        │  └────────────────────────────────────────────┘    │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + Create new workspace
List:      Workspace cards with stats and actions
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Card | Workspace item | default, interactive |
| Avatar (icon) | Workspace icon | lg (64px) |
| Button | Open workspace | primary, sm |
| Button | Settings | ghost, sm |
| Button | Archive/Activate | ghost, sm, destructive |
| Button | New Workspace | primary, sm |
| Modal | Create/Edit workspace | default |
| Input | Workspace name | outlined, md |
| Select | Workspace type | md |
| Badge | Material count | info |
| Badge | User count | neutral |

---

## Information Hierarchy

```
Primary:   Workspace name, material count, user count
Secondary: Open/Settings actions, description
Tertiary:  Archive, Create
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Workspace list with stats. |
| **Loading** | Skeleton cards. |
| **Success** | Data rendered. |
| **Warning** | Archived workspaces shown muted. |
| **Error** | Error banner on load failure. |
| **Offline** | "Showing cached workspaces." |
| **Empty** | "No workspaces yet. Create your first workspace." |
| **No permissions** | Create/Settings hidden. "Contact admin." |
| **No data** | Default empty state. |
| **Syncing** | Pull-to-refresh. |
| **Updating** | Workspace status changes. |
| **Read only** | Actions disabled. View only. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Two-column grid of workspace cards. |
| **Tablet** | Single column. Cards with full details. |
| **Mobile** | Single column. Cards compact. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label` on workspace cards. `aria-live` on status changes. |
| **Focus order** | List → Card actions → Create |
| **Screen reader** | Announce workspace details. Announce status changes. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through cards. Enter opens. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Cards enter | Staggered fade | 300ms |
| Create | Modal slide up | 300ms |
| Archive | Card dims | 200ms |
| Open transition | Slide to workspace | 250ms |

---

## Validation

| Field (Create) | Rule |
|----------------|------|
| Name | Required, min 2 chars, max 50, unique |
| Type | Required (Warehouse, Workshop, Storage) |
| Location | Optional |

---

## Edge Cases

1. **Single workspace** — No workspace selector needed. Workspace is default.
2. **Archived workspace** — Cannot be selected for operations. Materials visible but read-only.
3. **Workspace deletion** — Must be empty (no materials). Transfer or archive first.
4. **Default workspace** — First workspace created is default. Can be changed in settings.
5. **Workspace switching** — Top bar switcher shows active workspace. Switch updates all scoped data.
6. **Cross-workspace transfer** — Transfer materials between workspaces (with audit).
7. **Workspace usage limits** — Some plans limit workspaces. Show upgrade prompt if at limit.
8. **Workspace-specific roles** — Users can have different roles per workspace.
9. **Workspace settings inheritance** — Child workspaces inherit settings from parent (if hierarchy).
10. **Workspace data isolation** — Strict data separation between workspaces. Users see only their workspace data.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `workspace_created` | `{workspace_id, type}` |
| `workspace_opened` | Open click |
| `workspace_settings` | Settings click |
| `workspace_archived` | Archive action |
| `workspace_activated` | Activate action |
| `workspace_switched` | Workspace switch (top bar) |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Workspace count per org | Distribution |
| Most common workspace type | Warehouse vs Workshop vs Storage |
| Workspace creation rate | Per period |
| Workspace churn | Archived per period |
| Workspace switch frequency | Per user per session |

---

## Future Improvements

1. Workspace hierarchy — Parent/child workspace relationships
2. Workspace templates — Pre-configured workspace setups
3. Workspace analytics — Per-workspace usage metrics
4. Workspace invitations — Invite users to specific workspaces
5. Workspace data export — Export all workspace data
6. Workspace merge — Combine two workspaces
7. Workspace roles — Workspace-level admin, manager, viewer roles
