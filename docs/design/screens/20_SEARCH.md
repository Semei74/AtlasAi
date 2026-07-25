# 20 — Search

## Overview

**Purpose:** Global search across all materials, tasks, users, and knowledge base.

**Business Goal:** Enable rapid information retrieval. Reduce time to find any entity.

**User Goal:** I want to search across everything in Atlas AI and find what I need instantly.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Top bar search (Cmd+K), Sidebar "Search", Command palette | Search results |
| **To** | Material Card, Task detail, User profile, Report, AI Chat, Knowledge article | Result navigation |

---

## User Story

> As a user, I want to search across all entities in Atlas AI so that I can find what I need without navigating through menus.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (minimal)                              Close ×     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Search ────────────────────────────────── [Filter▾]       │
│                                                             │
│  Results for "nut m12" (24 results)                         │
│                                                             │
│  ┌─ Materials (8) ─────────────────────────────────────┐    │
│  │  ● Nut M12 — SKU: NUT-M12 │ Stock: 245 │ Aisle 12  │    │
│  │  ● Nut M10 — SKU: NUT-M10 │ Stock: 89  │ Aisle 12  │    │
│  │  ● Lock Nut M12 — SKU: LNUT-M12 │ Stock: 34        │    │
│  │  [View all 8 results →]                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Tasks (3) ─────────────────────────────────────────┐    │
│  │  ● Replace brake pads — Due: Mar 20 │ Status: Open  │    │
│  │  ● Inspect engine — Due: Mar 22 │ Status: In Prog  │    │
│  │  [View all 3 results →]                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Knowledge (2) ────────────────────────────────────┐    │
│  │  ● How to issue materials — Knowledge base         │    │
│  │  ● Nut M12 specification sheet                     │    │
│  │  [View all 2 results →]                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Recent searches (when query is empty):                     │
│  ● "bolt m8"    ● "task a"    ● "alice"                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Input:     Search bar with filter toggle
Results:   Grouped by category (Materials, Tasks, Users, Knowledge)
Recent:    Recent search history (shown when query empty)
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Search Bar | Main input | lg, focused |
| Button | Filter | ghost, icon-only |
| Card | Result group | default |
| Card | Result item | interactive, with icon |
| Badge | Result type (Material/Task/User) | per type |
| Link | View all per category | default |
| KBD | Keyboard shortcut hint | — |
| Empty State | No results | "No results found" |

---

## Information Hierarchy

```
Primary:   Search input, Result items
Secondary: Filter, Category groups
Tertiary:  Recent searches, Keyboard shortcut
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Empty query. Recent searches displayed. Cursor in input. |
| **Typing** | Debounced search (300ms). Results update as user types. |
| **Loading** | Skeleton result groups. |
| **Success** | Results displayed in categorized groups. |
| **Error** | Error banner "Search failed." Retry. |
| **Offline** | "Searching cached data." Show cached results. |
| **Empty** | "No results found for '{query}'." Suggestions. |
| **No permissions** | Restricted results hidden. |
| **No data** | "No results" for empty cache. |
| **Syncing** | Not applicable. |
| **Updating** | Not applicable. |
| **Read only** | Results viewable. Actions disabled. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Overlay panel (max 720px, centered top). Full results. |
| **Tablet** | Overlay panel, similar to desktop. |
| **Mobile** | Full-screen search. Keyboard pushes results up. Native feel. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label="Search"`, `role="search"`, `aria-live="polite"` on results. `aria-activedescendant` on result navigation. |
| **Focus order** | Input → Results → Recent searches |
| **Screen reader** | Announce result count. Announce selected result. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Arrow keys navigate results. Enter opens. Esc clears/closes. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Open | Overlay expands from search bar | 250ms |
| Results update | Cross-fade | 200ms |
| Result hover | Background shift | 100ms |
| Close | Overlay collapses | 200ms |
| Recent search tap | Fills input | 150ms |

---

## Validation

| Rule | Behavior |
|------|----------|
| Min query length | 2 characters minimum for search |
| Debounce | 300ms after last keystroke |

---

## Edge Cases

1. **Zero results** — "No results for '{query}'." Show suggestions: "Try: bolt, task, alice" or "Check your spelling."
2. **Very long queries** — Max 200 characters. Show character count.
3. **Special characters** — Strip/replace special characters. Search handles partial matches.
4. **Rapid typing** — Debounce prevents excessive API calls. Cancel previous request on new input.
5. **Result count overflow** — Show "View all N results" per category. Max 3 shown inline.
6. **Empty recent searches** — Show "Search across materials, tasks, users, and knowledge."
7. **Permission-filtered results** — Results user cannot access are hidden or shown as restricted.
8. **Result navigation** — Arrow key selection follows visual order. Active result highlighted.
9. **Search while offline** — Search locally cached index. Show "Cached results" indicator.
10. **Deep link from search** — After navigating to result, back returns to search with query preserved.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Search open |
| `query_entered` | `{query}` — On debounce |
| `result_clicked` | `{type, id, position}` |
| `category_viewed` | `{category}` — Category expand |
| `filter_used` | Filter toggle |
| `recent_search_clicked` | Recent search tap |
| `search_closed` | Esc / Close click |
| `search_cleared` | Clear input |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Search usage rate | Per session |
| Average query length | Characters |
| Result click rate | Queries resulting in clicks |
| Most searched entity | Material vs Task vs User vs Knowledge |
| Zero result rate | Queries with no results |
| Time to first result | Input → results displayed |

---

## Future Improvements

1. Fuzzy search — "nut m12" matches "Nut-M12" and "NUT M12"
2. Semantic search — AI-powered meaning-based results
3. Search suggestions — Auto-complete based on common queries
4. Saved searches — Bookmark frequently used searches
5. Search within results — Filter results after search
6. Natural language search — "Show me low stock items in aisle A"
7. Image search — Search by material photo
8. Voice search — Speak your search query (mobile)
