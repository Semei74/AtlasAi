# 10 — Notifications

## Overview

**Purpose:** Centralized notification center displaying all alerts, updates, and system messages.

**Business Goal:** Keep users informed without interrupting workflow. Reduce notification fatigue through grouping and controls.

**User Goal:** Review notifications I've received, act on them, and control what I'm notified about.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Top bar bell icon (badge count), Push notification tap, Sidebar "Notifications" | Notification list |
| **To** | Material card (via notification action), Task detail, Report, Settings | Contextual navigation |

---

## User Story

> As a user, I want to see all my notifications in one place so that I don't miss important updates about low stock, assigned tasks, or system alerts.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Notifications (24px SemiBold)  [Mark all read]   │
│ Side   │  ┌─ Filter Bar ───────────────────────────────┐   │
│ Bar    │  │  [All] [Unread] [Low Stock] [System] [Mentions]│
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Today ──────────────────────────────────────┐   │
│        │  │  ● ⚠ Low Stock: Nut M12 (2 remaining)    9:45│   │
│        │  │  ● 📋 Task A assigned to you             9:30│   │
│        │  │  ○ ✓ Material B issued to Task C         8:15│   │
│        │  │  ○ 🔄 Return approved: Bolt M8           7:45│   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Yesterday ──────────────────────────────────┐   │
│        │  │  ○ ⚠ System maintenance tonight 2AM-4AM     │   │
│        │  │  ○ 🤖 AI analysis complete: Report ready    │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Older ─────────────────────────────────────┐   │
│        │  │  ○ 👤 Alice joined workspace                │   │
│        │  │  ○ 🔑 API key expiring in 7 days            │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  [Load more...]                                     │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + Mark all read action
Filter:    Category tabs (All, Unread, Low Stock, System, Mentions)
Groups:    Today, Yesterday, Older (collapsible)
Load more: Pagination at bottom
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Button | Mark all read | ghost, sm |
| Tabs | Filter categories | pill |
| Card | Notification item | default, interactive |
| Badge | Unread indicator | error, sm (dot) |
| Icon | Category icon | 16px, per type |
| Tag | Type label (Low Stock, System) | sm |
| Separator | Between groups | horizontal |
| Link | Load more | default |
| Empty State | No notifications | "All caught up!" |

---

## Information Hierarchy

```
Primary:   Notification list items (unread first)
Secondary: Filter tabs, Mark all read
Tertiary:  Load more, Group headers
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Notifications grouped by date. Unread prioritized. |
| **Loading** | Skeleton rows (5). |
| **Success** | List rendered. |
| **Warning** | Critical notifications (low stock 0) in warning color. |
| **Error** | Error banner on load failure. Retry. |
| **Offline** | "Showing cached notifications." New notifications arrive on reconnect. |
| **Empty** | "All caught up! No new notifications." with "Settings" link. |
| **No permissions** | Not applicable. |
| **No data** | Default empty state. |
| **Syncing** | Pull-to-refresh indicator. |
| **Updating** | New notification slides in at top. |
| **Read only** | Mark as read disabled. Notifications view-only. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full layout. Sidebar visible. |
| **Tablet** | Full width. Filter bar scrolls horizontally. |
| **Mobile** | Full width. Bottom tab bar. Swipe to dismiss. Pull-to-refresh. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-live="polite"` on new notifications. `role="list"` on items. `aria-label` on filter. |
| **Focus order** | Header → Filter → Unread group → Older groups |
| **Screen reader** | Announce new notification. Announce unread count. Read notification content. |
| **Contrast** | Per COLOR_SYSTEM.md. Warning notifications meet ≥ 4.5:1. |
| **Keyboard** | Arrow keys navigate list. Enter opens notification. |
| **Touch targets** | Swipe left to dismiss. Swipe right to mark read. ≥ 44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| List enter | Staggered fade in | 300ms total |
| New notification | Slide in from top | 300ms |
| Mark read | Checkmark appears, item fades slightly | 200ms |
| Dismiss | Swipe + slide out | 200ms |
| Filter change | List cross-fade | 200ms |
| Pull-to-refresh | Spinner appears | — |

---

## Validation

N/A — Read-only view of notifications.

---

## Edge Cases

1. **Hundreds of notifications** — Paginate 20 per page. "Load more" at bottom. Max 500 stored locally.
2. **Real-time arrival** — New notification slides in at top. Badge count updates. Sound/vibration optional.
3. **Notification types** — 6 types: Low Stock, Assignment, System, Mention, Approval, Report.
4. **Deep link from notification** — Click navigates to relevant screen. Back returns to notification center.
5. **Unread badge sync** — Badge count syncs across devices. Marking read on one device clears on all.
6. **Notification settings** — "Manage notification preferences" link at top. Goes to Settings.
7. **Dismissed by accident** — "Undo" toast on dismiss. Available 3 seconds.
8. **Empty filter result** — "No {filter} notifications" with "View all" link.
9. **Very old notifications** — Auto-archived after 90 days. "View archived" link at bottom.
10. **Notification click while offline** — Queue navigation. Execute when online or cached screen available.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `notification_clicked` | `{type, id}` — Notification row click |
| `notification_marked_read` | Mark read action |
| `all_marked_read` | Mark all read |
| `filter_changed` | `{filter: "all"\|"unread"\|...}` |
| `notification_dismissed` | Swipe dismiss |
| `load_more` | Load more click |
| `settings_clicked` | Manage preferences link |
| `push_received` | Push notification arrival |
| `push_clicked` | Push notification tap (from background) |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Notification volume | Per type, per period |
| Click-through rate | Notifications received vs acted on |
| Time to action | Notification receive → user click |
| Dismiss rate | Percentage dismissed without action |
| Unread accumulation | Average unread count per user |

---

## Future Improvements

1. Notification snooze — "Remind me in 1 hour"
2. Custom notification groups — User-defined categories
3. Quiet hours schedule — No notifications during set hours
4. Notification digest — Daily/weekly summary email
5. Priority levels — Urgent, Important, Informational
6. Actionable notifications — "Approve" / "Reject" from notification
7. Cross-device sync — Read on phone, dismissed on desktop
