# 21 — Analytics

## Overview

**Purpose:** Data analysis dashboard with charts, trends, and insights about inventory operations.

**Business Goal:** Enable data-driven decision making. Surface usage patterns and trends.

**User Goal:** I want to analyze inventory data, spot trends, and export insights.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Sidebar "Analytics", Dashboard "View Analytics", Report links | Analytics dashboard |
| **To** | Reports, Material detail (drill-down), Export | Analysis actions |

---

## User Story

> As a manager, I want to analyze inventory trends and usage patterns so that I can make informed decisions about stock levels and ordering.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Analytics (24px SemiBold)   [Export] [Share]     │
│ Side   │  ┌─ Filter Bar ───────────────────────────────┐   │
│ Bar    │  │  Period: [Last 30 days▾] [Compare: Prev▾]  │   │
│        │  │  Category ▾  |  Material ▾  |  User ▾      │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│        │  │ 245       │ │ 1,234    │ │ 89%      │           │
│        │  │ Issues    │ │ Items    │ │ Fill Rt  │           │
│        │  │ ▲ 12%    │ │ ▲ 8%     │ │ ▼ 3%     │           │
│        │  └──────────┘ └──────────┘ └──────────┘           │
│        │                                                     │
│        │  ┌──────────────────────────────────────────┐       │
│        │  │  Issues Over Time (Line Chart)            │       │
│        │  │  ┌────────────────────────────────────┐  │       │
│        │  │  │  Chart: daily issue count           │  │       │
│        │  │  └────────────────────────────────────┘  │       │
│        │  └──────────────────────────────────────────┘       │
│        │                                                     │
│        │  ┌─────────────────────┐ ┌──────────────────────┐   │
│        │  │  Top Materials      │ │  Usage by Category   │   │
│        │  │  1. Nut M12   145   │ │  ┌──── Pie ──────┐  │   │
│        │  │  2. Bolt M8   89    │ │  │  Fasteners    │  │   │
│        │  │  3. Washer    67    │ │  │  Tools        │  │   │
│        │  └─────────────────────┘ └──────────────────────┘   │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + Export/Share
Filters:   Period, Comparison, Category/Material/User selectors
KPI Row:   3 KPI cards with trends
Charts:    Main chart (line/bar) + Secondary charts (top materials, category pie)
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Button | Export, Share | outline, sm |
| Select | Period, Category, Material, User | sm |
| Stat | KPI cards (3) | md, with trend |
| Line Chart | Issues over time | interactive |
| Bar Chart | Top materials | horizontal |
| Pie Chart | Category distribution | donut |
| Tabs | Chart type selector | pill |
| Button | Drill down | ghost, sm |
| Skeleton | Chart loading | chart pattern |

---

## Information Hierarchy

```
Primary:   KPIs, Main chart, Top materials
Secondary: Secondary charts, Filters
Tertiary:  Export, Share, Comparison
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Charts with data. Interactive tooltips. |
| **Loading** | Skeleton charts + skeleton KPIs. |
| **Success** | Data rendered with animations. |
| **Warning** | Negative trends highlighted. Low fill rate warning. |
| **Error** | Error banner on failed chart. Retry per chart. |
| **Offline** | "Showing cached analytics data." Update on connect. |
| **Empty** | "Not enough data for analysis. Start issuing materials to see analytics." |
| **No permissions** | Restricted data hidden. |
| **No data** | Charts show empty state. |
| **Syncing** | Data refresh indicator. |
| **Updating** | Real-time chart updates. |
| **Read only** | Export disabled. View only. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Two-column charts. Full filter bar. Sidebar visible. |
| **Tablet** | Single column. Filters collapsible. |
| **Mobile** | Stacked layout. KPIs small. Charts scrollable. Filters as bottom sheet. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label` on charts. `aria-live` on KPI updates. `role="img"` with data table fallback. |
| **Focus order** | Filters → KPIs → Chart 1 → Chart 2 → Chart 3 |
| **Screen reader** | Announce KPI values. Announce chart data via table fallback. |
| **Contrast** | Per DATA_VISUALIZATION.md. |
| **Keyboard** | Arrow keys navigate charts. Enter selects data point. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| KPI count-up | Number increment | 1s |
| Chart draw | Line/bar draw | 500ms |
| Chart filter change | Chart cross-fade | 300ms |
| Drill down | Slide to detail | 250ms |
| KPI trend arrow | Arrow animation | 300ms |

---

## Validation

N/A — Read-only analysis view.

---

## Edge Cases

1. **Insufficient data for chart** — Show "Not enough data. Select a longer time period." with suggested actions.
2. **Comparison period empty** — Show "No data for comparison period." Disable comparison toggle.
3. **Extreme values skewing chart** — Log scale option for charts with outliers.
4. **Very large dataset** — Aggregated data points (daily/weekly) with drill-down to raw data.
5. **Chart export** — Download chart as PNG/SVG. Download data as CSV.
6. **Shareable analytics link** — Generate shareable URL with current filter state.
7. **Filter by material with no data** — "No data for selected material. Try a different material."
8. **Real-time data updates** — Charts refresh periodically. User notified of update.
9. **Timezone display** — All data in workspace timezone. Option to view in UTC.
10. **Currency/unit display** — Format values based on workspace preferences.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `filter_changed` | `{filter, value}` |
| `period_changed` | Period selector |
| `chart_interacted` | `{chart_type}` — Tooltip hover/click |
| `kpi_clicked` | KPI click (drill-down) |
| `drill_down` | Data point click |
| `export_clicked` | Export |
| `share_clicked` | Share link |
| `comparison_toggled` | Compare mode on/off |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Analytics session time | Time on screen |
| Most viewed chart | Chart interaction count |
| Filter usage rate | Per filter type |
| Export rate | Sessions with export |
| Drill-down rate | Data points clicked |

---

## Future Improvements

1. Custom dashboard — User-configurable chart layout
2. Predictive analytics — AI-powered trend forecasting
3. Anomaly detection — Auto-flag unusual patterns
4. Scheduled reports — Email analytics daily/weekly/monthly
5. Benchmarking — Compare against industry averages
6. What-if analysis — Simulate inventory scenarios
7. Cohort analysis — Usage patterns by user group
