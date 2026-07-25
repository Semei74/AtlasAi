# 29 — Activity

## Overview

**Purpose:** Universal activity feed showing all actions across the platform.

**Business Goal:** Provide transparency into platform activity. Enable monitoring and audit.

**User Goal:** I want to see what's happening in my workspace — who did what and when.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Sidebar "Activity", Dashboard "View all activity", Notification "View all" | Activity feed |
| **To** | Material Card, Task detail, User profile, Movement History | Context navigation |

---

## User Story

> As a user, I want to see a chronological feed of all activity in my workspace so that I stay informed.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Activity (24px SemiBold)                          │
│ Side   │  ┌─ Filters ───────────────────────────────────┐   │
│ Bar    │  │  [All] [Materials] [Users] [AI] [System]   │   │
│        │  │  Period: [Today▾]  User: [All Users▾]      │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Today ─────────────────────────────────────┐   │
│        │  │  🟢 9:45 AM  Alice issued 12x Nut M12      │   │
│        │  │               to Task A                     │   │
│        │  │  🟡 9:30 AM  Bob returned 4x Bolt M8       │   │
│        │  │               from Task B — Condition: Good │   │
│        │  │  🔵 9:15 AM  Carol created material        │   │
│        │  │               Washer M10 (SKU: WASH-M10)   │   │
│        │  │  🟣 8:45 AM  AI generated weekly report     │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Yesterday ─────────────────────────────────┐   │
│        │  │  🟢 4:30 PM  Dave reserved 20x Bolt M12   │   │
│        │  │  🟡 2:00 PM  System: Daily backup complete │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  [Load more...]                                     │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title
Filters:   Category tabs + Period/User selectors
Groups:    Today, Yesterday, Older (date-separated)
Items:     Activity rows with icon, timestamp, actor, action, target
Load more: Pagination
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Tabs | Category filter | pill |
| Select | Period, User | sm |
| Card | Activity item | default, interactive |
| Icon | Activity type (color-coded) | 16px, per type |
| Link | Actor name → User profile | default |
| Link | Target → Material/Task | default |
| Badge | Activity type | per type |
| Separator | Date group | with label |
| Button | Load more | ghost, full-width |
| Empty State | No activity | "No activity yet" |

---

## Information Hierarchy

```
Primary:   Activity text, timestamp
Secondary: Actor name, target link
Tertiary:  Filters, Load more
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Paginated activity feed. |
| **Loading** | Skeleton items. |
| **Success** | Data rendered. |
| **Error** | Error banner "Could not load activity." Retry. |
| **Offline** | "Showing cached activity." |
| **Empty** | "No activity yet. Activity will appear as you work." |
| **No permissions** | Restricted items hidden. |
| **No data (filtered)** | "No activity matches filters." |
| **Syncing** | Pull-to-refresh for new items. |
| **Updating** | Real-time new items slide in. |
| **Read only** | View only. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full feed. Sidebar visible. |
| **Tablet** | Full width. Filters collapsible. |
| **Mobile** | Single column. Swipe for quick actions. Pull-to-refresh. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-live="polite"` on new items. `role="feed"`. |
| **Focus order** | Filters → Feed → Load more |
| **Screen reader** | Announce activity type, actor, action, target. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Arrow keys navigate items. Enter opens detail. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Feed enter | Staggered slide in | 300ms |
| New item (real-time) | Slide in at top | 300ms |
| Filter change | Cross-fade | 200ms |
| Load more | Items fade in | 200ms |
| Pull-to-refresh | Spinner | — |

---

## Validation

N/A — Read-only feed.

---

## Edge Cases

1. **Thousands of events** — Virtual scroll. Max 500 shown. "View full audit log" link.
2. **Real-time updates** — New activity appears at top without page refresh.
3. **Deleted user reference** — Show "Deleted user" instead of name.
4. **Deleted material reference** — Show "Deleted material" (muted). Still show event.
5. **Activity types** — Issue, Return, Create, Update, Delete, Reserve, Cancel, AI Action, System, Login.
6. **Filter by date range** — Custom date picker in addition to presets.
7. **Activity details** — Click item to see full details (notes, quantity, timestamps).
8. **Export activity** — Download filtered activity as CSV.
9. **Activity search** — Full-text search within activity descriptions.
10. **High-frequency events** — Aggregate similar events: "Alice issued 5 materials (12 total items)."

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `activity_clicked` | `{activity_id, type}` |
| `filter_changed` | `{filter, value}` |
| `load_more` | Load more click |
| `activity_exported` | Export CSV |
| `push_refresh` | Pull-to-refresh |
| `real_time_event` | New event received |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Activity volume | Per type, per period |
| Click-through rate | Events leading to navigation |
| Filter usage | Per filter type |
| Real-time event frequency | Events per minute |
| Session activity depth | Items viewed per session |

---

## Future Improvements

1. Activity digest — Daily/weekly summary of important events
2. Custom activity alerts — Notify on specific activity types
3. Activity timeline visualization — Gantt-style timeline view
4. User activity heatmap — See when users are most active
5. Activity bookmarks — Save important events for later reference
6. Activity comments — Discuss events with team members
7. Cross-workspace activity — View activity across all workspaces
