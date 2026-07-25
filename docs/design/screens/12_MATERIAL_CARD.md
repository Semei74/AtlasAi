# 12 — Material Card

## Overview

**Purpose:** View detailed information about a single material, its current stock, movement history, and related data.

**Business Goal:** Provide comprehensive material intelligence. Enable informed stock decisions.

**User Goal:** I want to see everything about this material — where it is, how much is available, and its movement history.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Materials List row click, QR scan result, Search result, Notification tap, Movement History "View material" | Material detail |
| **To** | Edit Material, Issue Material, Return Material, Movement History, AI Chat | Material actions |

---

## User Story

> As a warehouse user, I want to see complete details about a specific material so that I can make decisions about issuing, returning, or reordering it.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  ← Materials  /  Nut M12 (20px SemiBold) [Edit][⋯]│
│ Side   │  ┌────────────────────────────────────────────┐    │
│ Bar    │  │  ┌─────────────┬──────────────────────────┐ │    │
│        │  │  │ SKU          │ NUT-M12                  │ │    │
│        │  │  │ Category     │ Fasteners › Nuts         │ │    │
│        │  │  │ Quantity     │ 245 units     ✓ In Stock │ │    │
│        │  │  │ Location     │ Warehouse A › Aisle 12   │ │    │
│        │  │  │ Min Stock    │ 20 units                 │ │    │
│        │  │  │ Unit         │ Piece (pc)               │ │    │
│        │  │  │ Supplier     │ FastenerCo Inc.          │ │    │
│        │  │  │ Last Update  │ Today, 9:45 AM           │ │    │
│        │  │  └─────────────┴──────────────────────────┘ │    │
│        │  └────────────────────────────────────────────┘    │
│        │                                                     │
│        │  ┌─ Actions ───────────────────────────────────┐   │
│        │  │  [Issue Stock] [Return Stock] [Reserve]     │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Stock Timeline ────────────────────────────┐   │
│        │  │  ┌──────────────────────────────────────┐   │   │
│        │  │  │  Mini area chart (last 30 days)       │   │   │
│        │  │  └──────────────────────────────────────┘   │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Recent Movements ──────────────────────────┐   │
│        │  │  Today 9:45 AM  Issue  -12  to Task A       │   │
│        │  │  Today 8:15 AM  Return +4   from Task B     │   │
│        │  │  Yesterday     Issue  -20  to Task C        │   │
│        │  │  [View all movement history →]              │   │
│        │  └──────────────────────────────────────────────┘   │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Breadcrumb + Title + Edit/More actions
Info:      Description list with all material attributes
Actions:   Issue, Return, Reserve buttons (prominent)
Chart:     Stock level timeline
Movements: Recent movement rows with link to full history
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Breadcrumb | Navigation path | default |
| Button | Edit | outline, sm |
| Button | More | ghost, icon-only, sm |
| Description List | Material attributes | horizontal |
| Badge | Stock status | success/warning/error |
| Button | Issue Stock | primary, md |
| Button | Return Stock | outline, md |
| Button | Reserve | ghost, md |
| Area Chart | Stock timeline | mini, 30 day |
| Timeline | Recent movements | compact |
| Link | View all movements | default |
| Card | Detail card | default |
| Skeleton | Loading placeholder | Card + chart |

---

## Information Hierarchy

```
Primary:   Material name, Current quantity, Stock status, Action buttons
Secondary: SKU, Category, Location, Movement history
Tertiary:  Supplier, Unit, Last update, Chart
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | All material info displayed. Actions available. |
| **Loading** | Skeleton card + skeleton chart. |
| **Success** | Data loaded with animations. |
| **Warning** | Low stock warning banner if below minimum. |
| **Error** | Error banner "Could not load material." Retry. |
| **Offline** | Banner "Showing cached data." Actions disabled. |
| **Empty** | Not applicable (material exists if viewing). |
| **No permissions** | Action buttons hidden for restricted roles. |
| **No data** | Movement history empty: "No movements recorded yet." |
| **Syncing** | Real-time stock update animates quantity change. |
| **Updating** | Optimistic action result reflected immediately. |
| **Read only** | Action buttons disabled with tooltip "View only." |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Two-column info + sidebar. Chart full width. |
| **Tablet** | Single column. Chart full width. |
| **Mobile** | Stacked layout. Actions as full-width buttons. Chart scrollable. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label="Material: {name}"`. `aria-live` on stock changes. |
| **Focus order** | Breadcrumb → Info → Actions → Chart → Movements |
| **Screen reader** | Announce stock level. Announce status changes. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through sections. Enter activates actions. |
| **Touch targets** | Action buttons ≥ 48pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Card slide in | 300ms |
| Quantity change | Number count-up/down | 500ms |
| Chart | Line draw | 400ms |
| Action transition | Slide to action screen | 250ms |

---

## Validation

N/A — Read-only detail view. Actions have their own screens.

---

## Edge Cases

1. **Material not found** — Error state "Material not found. It may have been deleted."
2. **Quantity zero** — Show "0 units" with "Out of Stock" badge. Issue button disabled.
3. **Negative quantity** — Show as "0" with warning. Log anomaly. Flag for admin review.
4. **Multiple locations** — Show quantity per location. Expandable section.
5. **Reserved stock** — Show reserved quantity separately from available. "245 (12 reserved)"
6. **Linked materials** — Show "Used in Kit A" or "Contains Part B" cross-references.
7. **Image/attachment** — Show material photo if available. Placeholder if not.
8. **Unit conversion** — Show alternate units if applicable (pieces vs boxes).
9. **Price history** — If tracked, show last purchase price and trend.
10. **Concurrent stock updates** — Real-time WebSocket push updates quantity without page refresh.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | `{material_id}` — Screen mount |
| `edit_clicked` | Edit button |
| `issue_clicked` | Issue action |
| `return_clicked` | Return action |
| `reserve_clicked` | Reserve action |
| `view_movements` | View all movements link |
| `qr_code_clicked` | QR code display (if present) |
| `more_clicked` | More menu open |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Detail view rate | List views → detail views ratio |
| Time on screen | Detail session duration |
| Action conversion | Detail view → action taken |
| Most used action | Issue vs Return vs Reserve |
| Chart interaction | Tooltip hovers, clicks |

---

## Future Improvements

1. Photo gallery — Multiple material images with zoom
2. Barcode generation — Download/print QR code for this material
3. Supplier info — Contact supplier, lead time, pricing
4. Alternative materials — "Users also viewed" recommendations
5. AI insights — "Based on usage patterns, you may need to reorder in 2 weeks"
6. Version history — Track attribute changes over time
7. Stocktaking integration — Count verification workflow
