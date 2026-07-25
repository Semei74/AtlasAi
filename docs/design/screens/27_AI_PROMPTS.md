# 27 — AI Prompts

## Overview

**Purpose:** Browse, create, and manage saved AI prompts and templates.

**Business Goal:** Enable users to save and reuse effective prompts. Standardize common AI interactions.

**User Goal:** I want to save useful prompts so I can reuse them without retyping.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | AI Assistant "Prompts", AI Chat prompt library, Sidebar "AI Prompts" | Prompt list |
| **To** | AI Chat (with prompt applied), Prompt editor, Prompt detail | Prompt actions |

---

## User Story

> As a power user, I want to save and organize AI prompts so that I can quickly reuse them.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  AI Prompts (24px SemiBold)       [+ New Prompt]  │
│ Side   │  Search ──────────────────────                    │
│ Bar    │  ┌─ Categories ─────────────────────────────┐     │
│        │  │  [All] [Analysis] [Reports] [Actions]    │     │
│        │  │  [Automation] [Favorites]                │     │
│        │  └──────────────────────────────────────────┘     │
│        │                                                     │
│        │  ┌────────────────────────────────────────────┐    │
│        │  │  ☆ Generate Stock Report                    │    │
│        │  │  "Create a report of all materials below   │    │
│        │  │   minimum stock levels..."                  │    │
│        │  │  Analysis · 42 uses  [Use] [Edit] [⋮]     │    │
│        │  ├────────────────────────────────────────────┤    │
│        │  │  Analyze Movement Trends                    │    │
│        │  │  "Analyze material movement patterns over  │    │
│        │  │   the last 30 days..."                     │    │
│        │  │  Analysis · 28 uses  [Use] [Edit] [⋮]     │    │
│        │  ├────────────────────────────────────────────┤    │
│        │  │  Issue Materials to Task                    │    │
│        │  │  "Help me issue the following materials to │    │
│        │  │   Task A: 12x Nut M12, 8x Bolt M8..."     │    │
│        │  │  Actions · 15 uses  [Use] [Edit] [⋮]     │    │
│        │  └────────────────────────────────────────────┘    │
│        │                                                     │
│        │  Pagination: ← 1 2 3 →   18 prompts               │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + New Prompt
Search:    Prompt search
Categories: Filter tabs
List:      Prompt cards with preview, stats, actions
Pagination: Page nav
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Search Bar | Prompt search | sm |
| Tabs | Category filter | pill |
| Card | Prompt item | default, interactive |
| Tag | Category badge | per type |
| Stat | Usage count | sm, inline |
| Button | Use prompt | primary, xs |
| Button | Edit | ghost, xs |
| Button | More | ghost, xs, icon-only |
| Button | New Prompt | primary, sm |
| Modal | Prompt editor | default |
| Textarea | Prompt content | outlined, lg |
| Select | Prompt category | md |

---

## Information Hierarchy

```
Primary:   Prompt content preview, Use button
Secondary: Category, usage stats
Tertiary:  Edit, More actions
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Prompt list with previews. |
| **Loading** | Skeleton cards. |
| **Success** | Data rendered. |
| **Error** | Error banner. Retry. |
| **Offline** | "Showing cached prompts." |
| **Empty** | "No prompts yet. Create your first prompt." |
| **No permissions** | Create/Edit hidden. View only. |
| **No data (filtered)** | "No prompts in this category." |
| **Syncing** | Not applicable. |
| **Updating** | Optimistic changes. |
| **Read only** | Use still enabled. Edit/Create hidden. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Grid or list of prompt cards. |
| **Tablet** | Single column cards. |
| **Mobile** | Single column. Swipe for actions. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label` on prompt cards. `aria-live` on filter changes. |
| **Focus order** | Search → Categories → List → Actions |
| **Screen reader** | Announce prompt preview. Announce usage count. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through prompts. Enter to use. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| List enter | Staggered fade | 300ms |
| Filter change | Cross-fade | 200ms |
| Use prompt | Slide to chat with prompt | 250ms |
| New prompt | Modal slide up | 300ms |

---

## Validation

| Field (Create/Edit) | Rule |
|---------------------|------|
| Name | Required, min 3 chars, max 100 |
| Content | Required, min 10 chars, max 2000 |
| Category | Required |

---

## Edge Cases

1. **Empty prompt content** — Cannot save. "Prompt content is required."
2. **Duplicate name** — Warn "A prompt with this name already exists."
3. **Prompt variables** — Support `{material_name}`, `{date_range}` placeholder replacement.
4. **Prompt usage tracking** — Increment counter each time prompt is used.
5. **Favorite prompts** — Star toggle to mark favorites. Filter by favorites.
6. **Prompt sharing** — Share prompts with workspace. Public/private toggle.
7. **Prompt versioning** — Track edits. Show "Edited 2 days ago."
8. **Import/export prompts** — JSON export/import for sharing between workspaces.
9. **Default prompts** — Pre-loaded prompts for common tasks. Cannot delete.
10. **Prompt deletion** — Confirm dialog. "This cannot be undone."

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `prompt_used` | `{prompt_id}` |
| `prompt_created` | New prompt save |
| `prompt_edited` | Prompt update |
| `prompt_deleted` | Prompt delete |
| `prompt_favorited` | Star toggle |
| `prompt_shared` | Share action |
| `category_filtered` | `{category}` |
| `search_performed` | Search query |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Most used prompt | Usage count rank |
| Prompt creation rate | Per period |
| Category distribution | Analysis vs Reports vs Actions % |
| Search rate | Searches per session |
| Favorite rate | Percentage favorited |

---

## Future Improvements

1. AI-suggested prompts — "Based on your usage, you might like this prompt."
2. Prompt marketplace — Community shared prompts (cross-workspace)
3. Prompt variables UI — Form fields for variable input before execution
4. Prompt testing — Preview prompt output before saving
5. Prompt organization — Folders/nested categories
6. Prompt collaboration — Team-editable prompts (with version control)
