# 22 — Reports

## Overview

**Purpose:** Generate, view, and manage inventory reports.

**Business Goal:** Provide standardized and custom reporting. Support compliance and operational reviews.

**User Goal:** I want to generate a report about inventory activity, stock levels, or usage patterns.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Sidebar "Reports", Analytics "Generate Report", Dashboard quick action | Report list |
| **To** | Report viewer, Analytics, Export/Download | Post-report actions |

---

## User Story

> As a manager, I want to generate reports about inventory activity so that I can review operations and share insights.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Reports (24px SemiBold)              [+ Generate]│
│ Side   │  ┌─ Report Templates ─────────────────────────┐   │
│ Bar    │  │  ┌──────────────────────────────────────┐  │   │
│        │  │  │ Stock Status Report                   │  │   │
│        │  │  │ Current inventory snapshot           │  │   │
│        │  │  │ [Generate] [Schedule]                 │  │   │
│        │  │  └──────────────────────────────────────┘  │   │
│        │  │  ┌──────────────────────────────────────┐  │   │
│        │  │  │ Movement History Report               │  │   │
│        │  │  │ All issues and returns in period     │  │   │
│        │  │  │ [Generate] [Schedule]                 │  │   │
│        │  │  └──────────────────────────────────────┘  │   │
│        │  │  ┌──────────────────────────────────────┐  │   │
│        │  │  │ Low Stock Alert Report               │  │   │
│        │  │  │ Materials below minimum threshold    │  │   │
│        │  │  │ [Generate] [Schedule]                 │  │   │
│        │  │  └──────────────────────────────────────┘  │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Recent Reports ─────────────────────────────┐   │
│        │  │  Stock Status — Mar 15, 2024    [View] [DL]  │   │
│        │  │  Movement Report — Last 7 days  [View] [DL]  │   │
│        │  └──────────────────────────────────────────────┘   │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + Generate custom report
Templates: Pre-defined report cards with Generate and Schedule
Recent:    Recently generated reports with View/Download
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Button | Generate Report | primary, sm |
| Button | Schedule | outline, sm |
| Card | Report template | default, with icon |
| Card | Recent report item | interactive |
| Button | View report | ghost, sm |
| Button | Download | ghost, sm, icon-only |
| Select | Report period, format | md |
| Input | Report name | outlined, md |
| Tabs | Report categories | pill |

---

## Information Hierarchy

```
Primary:   Report templates, Generate buttons
Secondary: Recent reports, Schedule options
Tertiary:  Report descriptions, Download
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Templates + recent reports visible. |
| **Loading** | Skeleton template cards. |
| **Generating** | Progress bar on generating report. "Generating..." |
| **Success** | Toast "Report ready." Opens report viewer. |
| **Error** | Error banner on generation failure. Retry. |
| **Offline** | "Report generation requires internet." |
| **Empty** | "No reports yet. Generate your first report." |
| **No permissions** | Generate/Schedule hidden. View only. |
| **No data** | Not applicable. |
| **Syncing** | Not applicable. |
| **Updating** | Not applicable. |
| **Read only** | Generate disabled. View/download only. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Two-column: templates + recent. |
| **Tablet** | Single column. Cards stack. |
| **Mobile** | Single column. Full-width cards. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label` on report cards. `aria-live` on generation status. |
| **Focus order** | Templates → Generate → Recent → Schedule |
| **Screen reader** | Announce report generation completion. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through templates. Enter to generate. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Templates enter | Staggered fade | 300ms |
| Generating | Progress pulse | — |
| Report complete | Checkmark + toast | 400ms |
| View report | Slide to viewer | 250ms |

---

## Validation

| Field (Custom) | Rule |
|----------------|------|
| Report name | Required |
| Period | Required |
| Format | Required (PDF, CSV, Excel) |

---

## Edge Cases

1. **Large report generation** — Async generation. Show progress. Notify when ready.
2. **Empty report data** — "Selected period has no data." Offer to extend period.
3. **Scheduled report failure** — Email notification of failure. Retry logic.
4. **Download interruption** — Resume support for large downloads.
5. **Report format selection** — PDF for viewing, CSV/Excel for data analysis.
6. **Temporary report storage** — Auto-delete after 30 days. Download to persist.
7. **Report comparison** — Side-by-side compare two reports.
8. **Custom date range** — Date picker with presets (Today, This Week, This Month, Custom).
9. **Multi-workspace reports** — Aggregate across workspaces (if permission granted).
10. **Report sharing** — Share report link with team members (permission-based).

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `report_generated` | `{template, format}` |
| `report_scheduled` | Schedule config |
| `report_viewed` | View report |
| `report_downloaded` | Download report |
| `report_shared` | Share report |
| `report_failed` | Generation failure |
| `custom_report` | Custom report creation |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Most generated report | Template rank |
| Generation time | Request to completion |
| Format preference | PDF vs CSV vs Excel % |
| Schedule rate | Percentage scheduling |
| Download rate | Generated vs downloaded % |

---

## Future Improvements

1. Custom report builder — Drag-and-drop fields, filters, layout
2. AI-generated report summaries — Natural language summary of report data
3. Report templates from community — Share and import templates
4. Automated distribution — Send report to email list on schedule
5. Report annotations — Add notes to shared reports
6. Report versioning — Track changes in scheduled reports
7. Embedded charts — Rich visual reports with embedded analytics
