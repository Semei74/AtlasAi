# 06 — Dashboard Manager

## Overview

**Purpose:** Provide managers with a real-time overview of warehouse operations, key metrics, and quick access to critical actions.

**Business Goal:** Enable informed decision-making. Surface anomalies and bottlenecks. Drive operational efficiency.

**User Goal:** I want to see current inventory status, recent activity, and key metrics at a glance.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Login, App launch, Sidebar "Dashboard", Home/Logo click | KPI overview |
| **To** | Material list, Analytics, AI Assistant, Notifications, Specific material card | Drill-down |

---

## User Story

> As a warehouse manager, I want to see a real-time dashboard of inventory status, low-stock alerts, recent movements, and key performance indicators so that I can make informed decisions about material management.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (56px)              Notif(3)  AI  Avatar▾          │
├────────┬────────────────────────────────────────────────────┤
│        │  Dashboard (24px SemiBold)               [Date▾]  │
│ Side   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│ Bar    │  │ 245       │ │ 38       │ │ 12       │ │ 97%  │ │
│ (240px)│  │ Materials │ │ Low Stk  │ │ Reserved │ │ Fill │ │
│        │  └──────────┘ └──────────┘ └──────────┘ └──────┘ │
│        │                                                     │
│        │  ┌──────────────────────────────────────────┐       │
│        │  │  [All] [Low Stock] [Reserved] [Issued]   │       │
│        │  │  ┌────────────────────────────────────┐  │       │
│        │  │  │  Movement Chart (Area/Bar)          │  │       │
│        │  │  └────────────────────────────────────┘  │       │
│        │  └──────────────────────────────────────────┘       │
│        │                                                     │
│        │  ┌─────────────────────┐ ┌──────────────────────┐   │
│        │  │  Recent Activity    │ │  Low Stock Alerts    │   │
│        │  │  ├─ Material A out  │ │  ├─ ⚠ Nut M12 (2)  │   │
│        │  │  ├─ Material B in   │ │  ├─ ⚠ Bolt M8 (0)  │   │
│        │  │  ├─ Material C res  │ │  └─ View all →      │   │
│        │  │  └─ View all →      │ │                      │   │
│        │  └─────────────────────┘ └──────────────────────┘   │
│        │                                                     │
│        │  ┌──────────────────────────────────────────┐       │
│        │  │  Quick Actions: [Issue] [Return] [Scan]  │       │
│        │  └──────────────────────────────────────────┘       │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + Date range picker
KPI Row:   4 KPI cards (Materials, Low Stock, Reserved, Fill Rate)
Chart:     Movement trends with filter tabs
Dual Panel: Activity feed (left) + Low stock alerts (right)
Actions:   Quick action buttons
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Top Bar | Main nav header | Standard |
| Sidebar | Navigation | Standard, expanded |
| Stat | KPI cards (4) | md, with trend |
| Card | Activity panel | default |
| Card | Alerts panel | default |
| Button | Quick actions (Issue, Return, Scan) | primary, sm |
| Button | Date range | outline, sm |
| Tabs | Chart filter (All/Low/Reserved/Issued) | pill |
| Area Chart | Movement trends | — |
| Timeline | Recent activity | — |
| Link | View all | default |
| Skeleton | Loading placeholders | Card + Chart patterns |

---

## Information Hierarchy

```
Primary:   KPI values, Movement chart, Low stock alerts
Secondary: Recent activity, Quick actions
Tertiary:  Date range, Chart filter tabs
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Live data displayed. KPIs animate on load. Chart interactive. |
| **Loading** | Skeleton cards (4) + skeleton chart. |
| **Success** | Data loaded with animations. KPIs count up. |
| **Warning** | Low stock alerts highlighted in warning color. |
| **Error** | Error state on failed panel. Retry button per panel. |
| **Offline** | Banner "Showing cached data. Last updated: {time}." |
| **Empty** | "No materials yet. Create your first material to get started." with CTA. |
| **No permissions** | Restricted panels hidden. Message "Contact admin for full access." |
| **No data** | KPI cards show "—" (dash). Chart shows empty state. |
| **Syncing** | Subtle sync indicator in top bar. |
| **Updating** | Real-time updates animate into KPIs. |
| **Read only** | Quick actions hidden. "View only mode." |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop (≥1280px)** | 4 KPI cards in a row. Full chart. 2-column bottom. Sidebar expanded. |
| **Tablet (768–1024px)** | 2x2 KPI grid. Chart full width. Single column bottom. Sidebar collapsed (icon). |
| **Mobile (<768px)** | 2x2 KPI grid (compact). Chart smaller. Single column. Bottom tab bar. Quick actions as FAB. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-live="polite"` on KPI updates. `role="region"` per panel. `aria-label` on chart. |
| **Focus order** | Sidebar → Top bar → KPIs → Chart → Activity → Alerts → Actions |
| **Screen reader** | Announce KPI value changes. Announce low stock count. |
| **Contrast** | Per COLOR_SYSTEM.md. Warning alerts meet ≥ 4.5:1. |
| **Keyboard** | Tab between panels. Arrow keys navigate chart. Enter drills down. |
| **Touch targets** | KPI cards, action buttons ≥ 44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| KPI count-up | Number increment | 1s per KPI |
| Chart enter | Draw line animation | 500ms |
| Panel enter | Staggered fade (100ms each) | 300ms total |
| Alert update | Slide in new alert | 200ms |
| Refresh | Data cross-fade | 300ms |

---

## Validation

N/A — Dashboard is a read-only overview. No user input validation.

---

## Edge Cases

1. **All KPIs zero** — Show "0" values. Empty state guides next action.
2. **Extreme KPI values** — Truncate display: "12.3K" beyond 9999. Chart scale adjusts.
3. **Large activity feed** — Show last 10. "View all" links to full Activity screen.
4. **Real-time update conflict** — If data updates during interaction, queue and apply after action.
5. **Browser tab backgrounded** — Pause real-time updates. Refresh on tab focus.
6. **Very long material names** — Truncate with ellipsis in activity feed. Show full name on hover tooltip.
7. **Multiple warehouses** — Show aggregate or allow workspace selector filter.
8. **Time zone mismatch** — All timestamps in workspace timezone. Show "UTC" if different from local.
9. **Empty chart data** — Show "No movements in this period" with suggestion to adjust date range.
10. **KPI card click ambiguity** — KPI header is not clickable. Only explicit "View" links navigate.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `kpi_card_viewed` | KPI card render |
| `chart_filter_changed` | Filter tab click |
| `chart_data_point_clicked` | Chart interaction |
| `low_stock_alert_clicked` | Alert row click |
| `activity_item_clicked` | Activity row click |
| `quick_action_clicked` | `{action: "issue"\|"return"\|"scan"}` |
| `date_range_changed` | Date picker change |
| `view_all_activity` | "View all" activity link |
| `view_all_alerts` | "View all" alerts link |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Dashboard load time | Mount to interactive |
| KPI render time | KPI data fetch + render |
| Chart render time | Chart data + draw |
| Real-time update latency | Event to UI update |
| Dashboard session time | Time spent on screen |

---

## Future Improvements

1. Customizable KPI layout (drag to reorder, choose metrics)
2. Saved dashboard views (personal presets)
3. Export dashboard as PDF report
4. AI-powered anomaly detection on charts
5. Predictive analytics (forecast low stock 7 days ahead)
6. Comparison mode (compare current period vs previous)
7. Drill-down dashboard (click KPI → detailed view)
