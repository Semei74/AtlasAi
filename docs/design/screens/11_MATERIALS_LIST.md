# 11 — Materials List

## Overview

**Purpose:** Browse, search, and filter all materials in the inventory.

**Business Goal:** Provide fast access to inventory data. Enable efficient material discovery.

**User Goal:** Find materials quickly by searching, filtering, or browsing categories.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Sidebar "Materials", Dashboard "View all", Search results | Material list |
| **To** | Material Card (detail), Create Material, Issue/Return actions | Material CRUD |

---

## User Story

> As a warehouse user, I want to see a list of all materials with key information so that I can find what I need and take action.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Materials (24px SemiBold)              [+ Create] │
│ Side   │  Search ────────────────────────────────           │
│ Bar    │  Filter Bar: [Category▾] [Status▾] [Location▾]   │
│        │                                   [Clear filters] │
│        │                                                     │
│        │  ┌──────┬──────────┬────────┬──────┬────────┬────┐ │
│        │  │ Name │ SKU      │ Qty    │ Loc  │ Status │    │ │
│        │  ├──────┼──────────┼────────┼──────┼────────┼────┤ │
│        │  │ Nut  │ NUT-M12  │ 245    │ A-12 │ ✓ In   │ → │ │
│        │  │ Bolt │ BOLT-M8  │ 0      │ B-04 │ ⚠ Out  │ → │ │
│        │  │ Was… │ WASH-M10 │ 89     │ A-08 │ ✓ In   │ → │ │
│        │  └──────┴──────────┴────────┴──────┴────────┴────┘ │
│        │  Pagination: ← 1 2 3 ... 10 →   245 items         │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + Create button
Search:    Full-text search bar
Filters:   Category, Status, Location dropdowns
Table:     Sortable columns with material data
Pagination: Page navigation + item count
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Search Bar | Full-text search | md |
| Select | Category, Status, Location filters | sm |
| Button | Create | primary, sm |
| Button | Clear filters | ghost, sm |
| Table | Material rows | striped, sortable |
| Badge | Status indicator | success/warning/error/info |
| Link | Row navigation | arrow right |
| Pagination | Page navigation | default |
| Skeleton | Loading rows | 5 skeleton rows |

---

## Information Hierarchy

```
Primary:   Table rows (name, SKU, quantity, status)
Secondary: Search, Filters, Create button
Tertiary:  Pagination, Column headers
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Table with data. Sortable columns. |
| **Loading** | Skeleton rows (5). |
| **Success** | Data loaded. Row animations. |
| **Warning** | Low/out of stock rows highlighted in warning color. |
| **Error** | Error banner on load failure. Retry button. |
| **Offline** | Banner "Showing cached inventory data." |
| **Empty** | "No materials yet" with Create CTA. |
| **No permissions** | Create button hidden. Read-only view. |
| **No data (filtered)** | "No materials match filters" + Clear filters. |
| **Syncing** | Subtle sync indicator on data refresh. |
| **Updating** | Optimistic row update on stock change. |
| **Read only** | Create button hidden. Actions disabled. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full table with all columns. Sidebar visible. |
| **Tablet** | Table with fewer columns (name, qty, status). Horizontal scroll. |
| **Mobile** | Card list instead of table. Stacked layout. Bottom tab bar. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label="Materials table"`. `aria-sort` on sortable headers. `aria-live` on filter results. |
| **Focus order** | Search → Filters → Table → Create → Pagination |
| **Screen reader** | Announce filter results count. Announce sort direction. |
| **Contrast** | Per COLOR_SYSTEM.md. Status badges meet WCAG. |
| **Keyboard** | Arrow keys navigate rows. Enter opens detail. Shift+click for multi-select. |
| **Touch targets** | Row tap opens detail. Filter dropdowns ≥ 44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Table enter | Rows fade in staggered | 300ms |
| Filter change | Table cross-fade | 200ms |
| Sort | Column header icon flip | 150ms |
| Create transition | Slide to create screen | 250ms |

---

## Validation

| Field | Rule |
|-------|------|
| Search | Min 2 characters. Debounce 300ms. |

---

## Edge Cases

1. **Zero results** — "No materials found" with suggestion to adjust filters or create.
2. **Thousands of materials** — Server-side pagination (20 per page). Show total count.
3. **Very long names** — Truncate column with ellipsis. Full name in tooltip.
4. **Real-time stock changes** — Cell updates with highlight animation.
5. **Offline search** — Search cached data. Show last sync time.
6. **Column overflow** — Horizontal scroll on small screens. Minimum column widths.
7. **Delete while viewing** — If material deleted during session, row removed with animation.
8. **Bulk selection** — Checkbox column for batch operations. Shift+click for range.
9. **Filter URL state** — Filters persisted in URL params for bookmarkable views.
10. **Export current view** — Download filtered results as CSV.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `search_performed` | Search submit |
| `filter_changed` | `{filter, value}` |
| `filter_cleared` | Clear filters |
| `row_clicked` | `{material_id}` — Row click |
| `create_clicked` | Create button |
| `page_changed` | `{page}` — Pagination |
| `column_sorted` | `{column, direction}` |
| `export_clicked` | Export action |
| `bulk_action_clicked` | Bulk operation |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Search-to-result time | Query → results |
| Filter usage rate | Per filter type |
| Average page depth | Pages viewed per session |
| Row click rate | Percentage viewing details |
| Create conversion | List view → Create |

---

## Future Improvements

1. Saved searches — Bookmark frequently used filter combinations
2. Column visibility — User-configurable visible columns
3. Row density toggle — Comfortable/Compact mode
4. Quick preview — Hover card with material summary
5. Batch edit — Edit multiple materials at once
6. Barcode batch scan — Scan multiple QR codes sequentially
7. Kanban view — Card-based alternative to table
