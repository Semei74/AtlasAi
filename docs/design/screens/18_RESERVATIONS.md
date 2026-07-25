# 18 — Reservations

## Overview

**Purpose:** Reserve materials for future use. View, create, and manage reservations.

**Business Goal:** Prevent stockouts for critical tasks. Enable planning and allocation.

**User Goal:** I want to reserve materials for an upcoming job so they're available when needed.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Material Card "Reserve", Sidebar "Reservations", Dashboard quick action | Reservation list |
| **To** | Material Card (via material), Reservation detail, Issue from reservation | Reservation actions |

---

## User Story

> As a planner, I want to reserve materials for upcoming tasks so that they are guaranteed to be available.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Reservations (24px SemiBold)          [+ New]    │
│ Side   │  ┌─ Filters ───────────────────────────────────┐   │
│ Bar    │  │  [Active] [Upcoming] [Expired] [All]        │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─────────────────────────────────────────────┐    │
│        │  │  ⏳ Task A — 12x Nut M12       Due: Mar 20 │    │
│        │  │     Reserved by Alice on Mar 15    [Issue] │    │
│        │  ├─────────────────────────────────────────────┤    │
│        │  │  ⏳ Task C — 5x Bolt M8         Due: Mar 22│    │
│        │  │     Reserved by Bob on Mar 14     [Cancel] │    │
│        │  ├─────────────────────────────────────────────┤    │
│        │  │  ✅ Task B — 20x Washer         Issued Mar 18│   │
│        │  └─────────────────────────────────────────────┘    │
│        │                                                     │
│        │  Pagination: ← 1 2 3 →   18 reservations           │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + New reservation button
Filters:   Status tabs (Active, Upcoming, Expired, All)
List:      Reservation cards with status, material, quantity, due date, actions
Pagination: Page nav
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Button | New Reservation | primary, sm |
| Tabs | Status filter | pill |
| Card | Reservation item | default, interactive |
| Badge | Status (Active/Issued/Expired/Cancelled) | per type |
| Button | Issue (from reservation) | primary, xs |
| Button | Cancel | ghost, xs, destructive |
| Select | Material, Task (in creation form) | md |
| Input (number) | Quantity (in creation form) | outlined, md |
| Date Picker | Due date (in creation form) | md |
| Pagination | Page nav | default |

---

## Information Hierarchy

```
Primary:   Reservation list, status, actions
Secondary: Filters, new reservation
Tertiary:  Pagination
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | List of reservations. |
| **Loading** | Skeleton cards. |
| **Success** | Data rendered. |
| **Warning** | Expired/overdue reservations highlighted. |
| **Error** | Error banner. Retry. |
| **Offline** | "Showing cached reservations." |
| **Empty** | "No reservations. Reserve materials for upcoming tasks." |
| **No permissions** | Reservation actions hidden. "Contact admin." |
| **No data** | Default empty state. |
| **Syncing** | Pull-to-refresh. |
| **Updating** | Optimistic status changes. |
| **Read only** | Actions disabled. View only. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full card list with actions. |
| **Tablet** | Card list with reduced actions. |
| **Mobile** | Single column cards. Swipe for actions. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label` on reservation cards. `aria-live` on status changes. |
| **Focus order** | Filters → List → Actions → New → Pagination |
| **Screen reader** | Announce reservation details. Announce status changes. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Arrow keys navigate. Enter opens detail. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| List enter | Staggered fade | 300ms |
| Status change | Card highlight | 300ms |
| New reservation | Modal slide up | 300ms |
| Cancel | Card fade out | 200ms |

---

## Validation

| Field (New) | Rule |
|-------------|------|
| Material | Required |
| Quantity | Required, > 0, ≤ available stock |
| Task | Required |
| Due date | Required, future date |

---

## Edge Cases

1. **Reservation expires** — Auto-expire after due date. Change status to Expired.
2. **Insufficient stock at issue time** — Allow partial issue from reservation.
3. **Reservation cancellation** — Soft cancel with reason required.
4. **Material deleted while reserved** — Show "Material unavailable" on reservation.
5. **Overlapping reservations** — Show total reserved quantity vs available.
6. **Reservation modification** — Edit quantity or due date after creation.
7. **Auto-issue from reservation** — Option to auto-convert to issue on due date.
8. **Reservation notifications** — Notify when reservation is about to expire.
9. **Bulk reservation** — Reserve multiple materials for one task.
10. **Reservation hold** — Place reservation on hold if task is postponed.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `reservation_created` | New reservation submit |
| `reservation_issued` | Issue from reservation |
| `reservation_cancelled` | Cancel action |
| `reservation_expired` | Auto-expire |
| `filter_changed` | `{status}` |
| `reservation_clicked` | Card click |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Reservation rate | Per material, per period |
| Issue-to-reservation ratio | Reserved vs actually issued |
| Average reservation lead time | Created to due date |
| Expiry rate | Percentage expiring unfulfilled |
| Cancellation rate | Percentage cancelled |

---

## Future Improvements

1. Recurring reservations — Auto-reserve for regular tasks
2. Reservation dashboard widget — Show upcoming reservations on dashboard
3. Conflict detection — Warn if total reservations exceed stock + incoming
4. Approval workflow — Manager approval for reservations
5. Calendar view — See reservations on a timeline calendar
6. Supplier integration — Auto-order if reservations exceed stock
