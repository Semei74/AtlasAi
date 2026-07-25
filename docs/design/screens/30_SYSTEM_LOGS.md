# 30 — System Logs

## Overview

**Purpose:** Technical audit log for system events, errors, and performance data.

**Business Goal:** Provide technical transparency. Enable debugging and compliance auditing.

**User Goal:** I want to view system-level events for troubleshooting and compliance.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Sidebar "System Logs" (admin only), Settings "System", Activity "View audit log" | Log list |
| **To** | Log detail, Activity feed | Navigation |

---

## User Story

> As an admin, I want to view system logs so that I can monitor system health and investigate issues.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  System Logs (24px SemiBold)        [Export] [⋯] │
│ Side   │  ┌─ Filters ───────────────────────────────────┐   │
│ Bar    │  │  Level: [All] [Error] [Warn] [Info] [Debug] │   │
│        │  │  Date: [Last 24 hours▾]                     │   │
│        │  │  Source: ▾         | User: ▾                │   │
│        │  │  Search: ________________________________   │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─────────────────────────────────────────────┐    │
│        │  │  ERROR │ 10:45:23 │ Auth │ Login failed     │    │
│        │  │        │          │      │ user: alice@ex   │    │
│        │  ├─────────────────────────────────────────────┤    │
│        │  │  WARN  │ 10:44:12 │ Inv  │ Low stock: Nut   │    │
│        │  │        │          │      │ M12 (2 remaining)│    │
│        │  ├─────────────────────────────────────────────┤    │
│        │  │  INFO  │ 10:30:00 │ Sys  │ Daily backup     │    │
│        │  │        │          │      │ completed: 2.3s  │    │
│        │  ├─────────────────────────────────────────────┤    │
│        │  │  DEBUG │ 10:29:45 │ API  │ GET /materials   │    │
│        │  │        │          │      │ 200 OK (142ms)   │    │
│        │  └─────────────────────────────────────────────┘    │
│        │                                                     │
│        │  1,234 events in selected period      Auto-refresh  │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + Export + Settings
Filters:   Level, Date, Source, User, Search
List:      Log entries with level badge, timestamp, source, message
Footer:    Event count + Auto-refresh toggle
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Toggle Group | Log level filter | pill |
| Select | Date range, Source, User | sm |
| Search Bar | Full-text search within logs | sm |
| Table | Log entries | compact, monospace |
| Badge | Log level (Error/Warn/Info/Debug) | per type |
| Button | Export | outline, sm |
| Switch | Auto-refresh | sm |
| Pagination | Infinite scroll | virtual |
| Skeleton | Loading rows | 5 skeleton rows |

---

## Information Hierarchy

```
Primary:   Log level, timestamp, source, message
Secondary: Filters, search
Tertiary:  Export, auto-refresh, count
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Log entries with filters. |
| **Loading** | Skeleton rows. |
| **Success** | Data rendered. |
| **Warning** | Warnings highlighted in amber. |
| **Error** | Errors highlighted in red. Auto-scroll to errors. |
| **Offline** | "Showing cached logs." |
| **Empty** | "No logs match filters." |
| **No permissions** | Logs hidden. "Admin access required." |
| **No data** | "No logs for selected period." |
| **Syncing** | Auto-refresh indicator. |
| **Updating** | New log entries appear at top. |
| **Read only** | Export only. No deletions. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full table with all columns. |
| **Tablet** | Condensed table. Monospace font adjusts. |
| **Mobile** | Card list. Level + message visible. Details on tap. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-live="polite"` on new entries. `aria-label` on level badges. |
| **Focus order** | Filters → Log list → Export |
| **Screen reader** | Announce log level, message. Announce error count. |
| **Contrast** | Error red meets 4.5:1. Debug gray meets 3:1. |
| **Keyboard** | Arrow keys navigate logs. Enter expands detail. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| List update | New rows slide in | 200ms |
| Filter change | List refresh | 200ms |
| Auto-refresh | Pulse indicator | 1s loop |
| Expand detail | Slide down | 200ms |

---

## Validation

N/A — Read-only log viewer.

---

## Edge Cases

1. **Millions of log entries** — Server-side filtering. Max 500 displayed. Virtual scroll.
2. **Real-time streaming** — New logs appear without page refresh (WebSocket).
3. **Log level filtering** — Error shows only errors. Debug shows everything.
4. **Auto-refresh frequency** — Configurable (5s, 15s, 30s, 1min).
5. **Log detail expansion** — Click row to see full message, stack trace, metadata.
6. **Log export** — Download current filter view as CSV or JSON.
7. **Log retention** — Configurable retention period. "Logs older than 90 days are archived."
8. **Search within logs** — Full-text search across log messages. Highlight matches.
9. **Source filtering** — Filter by service/module (Auth, API, Inventory, AI, System).
10. **Log correlation** — Show related logs (same request ID, user ID).

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `filter_changed` | `{level, date, source}` |
| `log_clicked` | `{log_id, level}` |
| `export_clicked` | Export |
| `auto_refresh_toggled` | Toggle on/off |
| `search_performed` | Search query |
| `error_count_alerted` | Error count threshold exceeded |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Error rate | Errors per period |
| Most common error type | Error message rank |
| Average response time | From logs (API duration) |
| Auto-refresh usage | Percentage with auto-refresh on |
| Export rate | Exports per session |

---

## Future Improvements

1. Log visualization — Error timeline chart, source breakdown pie
2. Log alerting — Set threshold alerts for error rates
3. Log annotations — Add notes to specific log entries
4. Log sharing — Share log entry link with support team
5. Log pattern detection — AI-powered anomaly detection in log patterns
6. Log retention policy UI — Configurable retention from interface
7. Log comparison — Compare log periods side by side
