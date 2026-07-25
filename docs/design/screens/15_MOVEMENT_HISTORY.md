# 15 — Movement History

## Overview

**Purpose:** View complete audit trail of all material movements (issue, return, transfer, adjustment).

**Business Goal:** Provide full traceability for compliance and analysis. Enable audit readiness.

**User Goal:** I want to see when materials moved, who moved them, and why.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Material Card "View all movements", Sidebar "Movements", Dashboard activity "View all" | Movement list |
| **To** | Material Card (via material link), Task detail (via task link) | Context navigation |

---

## User Story

> As a warehouse manager, I want to see a chronological history of all material movements so that I can audit activity and analyze usage patterns.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Movement History (24px SemiBold)    [Export CSV] │
│ Side   │  ┌─ Filters ───────────────────────────────────┐   │
│ Bar    │  │  [All] [Issues] [Returns] [Transfers] [Adj] │   │
│        │  │  Date: [Last 7 days▾]  Material: [________] │   │
│        │  │  User: [All Users▾]                         │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─────────────────────────────────────────────┐    │
│        │  │  Mar 15  9:45 AM │ Issue │ Nut M12 │ -12   │    │
│        │  │                 │ User: Alice │ Task A     │    │
│        │  ├─────────────────────────────────────────────┤    │
│        │  │  Mar 15  8:15 AM │ Return│ Bolt M8 │ +4    │    │
│        │  │                 │ User: Bob  │ Task B     │    │
│        │  ├─────────────────────────────────────────────┤    │
│        │  │  Mar 14  4:00 PM │ Adj   │ Washer  │ -2   │    │
│        │  │                 │ User: Carol │ Count diff │    │
│        │  └─────────────────────────────────────────────┘    │
│        │                                                     │
│        │  Pagination: ← 1 2 3 ... 15 →   289 movements     │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + Export
Filters:   Type tabs + Date/Material/User filters
List:      Movement items (grouped by date, each showing type, material, qty, user, reason)
Pagination: Page navigation
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Tabs | Movement type filter | pill |
| Select | Date range, User filters | sm |
| Search Bar | Material search | sm |
| Button | Export CSV | outline, sm |
| Card | Movement item | default, interactive |
| Badge | Movement type (Issue/Return/Transfer/Adjust) | per type |
| Link | Material name (links to Material Card) | default |
| Link | Task name (links to task if associated) | default |
| Skeleton | Loading rows | 3 skeleton cards |
| Pagination | Page nav | default |
| Empty State | No movements | "No movements found" |

---

## Information Hierarchy

```
Primary:   Timestamp, Material name, Quantity change, User
Secondary: Movement type badge, Task reference
Tertiary:  Filters, Export, Pagination
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Movement list with data. |
| **Loading** | Skeleton cards (3). |
| **Success** | Data rendered. |
| **Warning** | Negative adjustments or anomalies highlighted. |
| **Error** | Error banner "Could not load movements." Retry. |
| **Offline** | "Showing cached movements." |
| **Empty** | "No movements recorded yet." |
| **No permissions** | List hidden. "Contact admin for access." |
| **No data (filtered)** | "No movements match filters." Clear filters link. |
| **Syncing** | Pull-to-refresh indicator. |
| **Updating** | New movement slides in at top. |
| **Read only** | No actions available (view only). |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full card layout with all columns. Sidebar visible. |
| **Tablet** | Card layout with fewer visible details. Horizontal scroll for table. |
| **Mobile** | Single column card list. Type icon + material + qty. Swipe to reveal details. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label="Movement history"`. `aria-live` on filter results. |
| **Focus order** | Filters → List → Pagination |
| **Screen reader** | Announce movement type, material, quantity, user. |
| **Contrast** | Per COLOR_SYSTEM.md. Movement type badges meet WCAG. |
| **Keyboard** | Arrow keys navigate list. Enter opens detail. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| List enter | Staggered slide in | 300ms total |
| Filter change | Cross-fade | 200ms |
| New movement (real-time) | Slide in at top | 300ms |
| Export | Progress indicator | — |

---

## Validation

N/A — Read-only view.

---

## Edge Cases

1. **Thousands of movements** — Server-side pagination (20 per page). Virtual scroll for large datasets.
2. **Real-time arrival** — New movement appears at top with highlight animation.
3. **Negative quantity movements** — Show in red with "Adjustment" badge.
4. **Deleted material reference** — Show "Deleted material" with muted styling. Still show history.
5. **Deleted user reference** — Show "Deleted user" instead of name.
6. **Time zone display** — Show in user's timezone with hover showing UTC.
7. **Export large dataset** — Asynchronous CSV generation. Email download link when ready.
8. **Filter by exact date** — Date picker with time range option.
9. **Movement detail expansion** — Click row to see full details (notes, approval, batch).
10. **Period comparison** — Show "vs previous period" toggle for trend analysis.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `filter_changed` | `{filter, value}` |
| `type_tab_changed` | `{type: "issues"\|"returns"\|...}` |
| `movement_clicked` | `{movement_id}` |
| `material_link_clicked` | `{material_id}` |
| `task_link_clicked` | `{task_id}` |
| `export_clicked` | Export CSV |
| `page_changed` | `{page}` |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| List load time | Screen mount → data render |
| Most filtered type | Filter type distribution |
| Average scroll depth | Items viewed per session |
| Export rate | Percentage of sessions exporting |
| Real-time update frequency | New movements per session |

---

## Future Improvements

1. Movement timeline visualization — Gantt chart of material usage
2. Anomaly detection — AI-powered flagging of unusual movement patterns
3. Batch operations — Select multiple movements for bulk export/print
4. Movement reversal — Ability to reverse a movement with audit trail
5. Custom date ranges — Preset ranges (Today, This Week, This Month, Custom)
6. Advanced search — Full-text search across all movement notes
7. Print-friendly view — Format for physical audit documentation
