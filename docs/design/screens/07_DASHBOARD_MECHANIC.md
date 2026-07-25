# 07 — Dashboard Mechanic

## Overview

**Purpose:** Provide mechanics with a task-focused dashboard showing assignments, next actions, and quick material access.

**Business Goal:** Minimize time spent searching for materials. Maximize productive work time.

**User Goal:** See my assigned tasks, find materials quickly, and report usage with minimal friction.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Login, App launch, Sidebar "Dashboard" | Task overview |
| **To** | Issue Material, Return Material, QR Scanner, AI Chat, Material Card | Task execution |

---

## User Story

> As a mechanic, I want a focused dashboard showing my current tasks, recent materials I've used, and quick buttons for stock actions so that I can do my job efficiently.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (56px)              Notif(1)  AI  Avatar▾          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Good morning, Alex! (20px SemiBold)                        │
│  You have 3 tasks due today. (14px Regular)                 │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐    │
│  │  Issue Stock │ │ Return Stock │ │ Search Materials │    │
│  └──────────────┘ └──────────────┘ └──────────────────┘    │
│                                                             │
│  ┌─ My Tasks (3) ───────────────────────────────────────┐   │
│  │  ● Task A — Replace brake pads          Due 2:00 PM  │   │
│  │  ● Task B — Inspect engine                     Today  │   │
│  │  ○ Task C — Oil change                   Tomorrow    │   │
│  │  [View All Tasks →]                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Recent Activity ───────────────────────────────────┐    │
│  │  Today 9:45 AM — Issued 12x Nut M12 to Task A       │    │
│  │  Today 9:30 AM — Returned 4x Bolt M8 from Task B    │    │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Quick Scan QR ─────────────────────────────────────┐    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │         Tap to scan material QR code          │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Greeting:      Personalized welcome + task count
Quick Actions: Issue, Return, Search (big touch-friendly buttons)
Tasks:         Task list with status + deadlines
Activity:      Recent material movements
QR Scan:       Quick scan button (large, centered)
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Top Bar | Header | Standard |
| Button | Issue Stock | primary, lg, with icon |
| Button | Return Stock | outline, lg, with icon |
| Search Bar | Search materials | md |
| Card | Tasks panel | default |
| Card | Activity panel | default |
| Badge | Task count | error (for overdue) |
| Tag | Task priority | warning/info/success |
| Timeline | Activity | — |
| Empty State | QR scan zone | "Tap to scan" |

---

## Information Hierarchy

```
Primary:   Quick actions (Issue, Return, Scan), My Tasks
Secondary: Search, Recent Activity
Tertiary:  Greeting, Task count
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Tasks, activity, quick actions visible. |
| **Loading** | Skeleton cards for tasks + activity. Quick actions skeleton. |
| **Success** | Data loaded. Animations complete. |
| **Warning** | Overdue tasks shown with warning color. |
| **Error** | Error banner on failed data. Retry button. |
| **Offline** | Banner "Offline mode. Actions will sync when connected." |
| **Empty** | "No tasks assigned" + "No recent activity" |
| **No permissions** | Restricted actions hidden. |
| **No data** | Greeting shows "No tasks due today." |
| **Syncing** | Subtle indicator on submitted actions. |
| **Updating** | Not applicable. |
| **Read only** | Quick actions disabled with tooltip "View only mode." |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full layout. Quick action buttons side by side. |
| **Tablet** | Similar to desktop. Slightly larger touch targets. |
| **Mobile** | Stacked layout. Full-width action buttons. Search prominent. QR scan takes half screen. Bottom tab bar. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label` on quick action buttons. `aria-live="polite"` on task updates. |
| **Focus order** | Quick actions → Tasks → Activity → QR scan → Top bar |
| **Screen reader** | Announce task deadlines. Announce activity updates. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Quick actions have keyboard shortcuts (I=Issue, R=Return, Cmd+K=Search). |
| **Touch targets** | All quick actions ≥ 56pt. QR scan target full width. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Greeting | Fade in | 200ms |
| KPI cards | Scale in | 300ms |
| Task list | Staggered slide in | 300ms total |
| QR scan | Pulsing border on scan zone | 2s loop |
| Quick actions | Scale on press | 100ms |

---

## Validation

| Field | Rule |
|-------|------|
| Search | Min 2 characters for auto-search. Debounce 300ms. |

---

## Edge Cases

1. **No tasks assigned** — Empty state "No tasks yet. Check back later or contact your manager."
2. **All tasks completed** — Banner "All tasks completed! Great work." with confetti on first completion.
3. **Overdue tasks** — Warning color on overdue items. Count shown in greeting.
4. **QR scan denied permission** — Show "Camera permission required. Enable in Settings." with link.
5. **Multiple rapid issues** — Queue actions. Show progress indicator.
6. **Task with no materials** — Task card shows "No materials required."
7. **Shift handover** — If user's shift ends, show countdown. Tasks transfer automatically.
8. **Manager reassigns task** — Real-time update. Show notification "Task A reassigned to {user}."
9. **Offline task view** — Cached task list. Submit actions when online.
10. **First login (no history)** — Empty activity section with "Your material usage will appear here."

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `issue_clicked` | Issue button |
| `return_clicked` | Return button |
| `search_performed` | Search submitted |
| `task_clicked` | Task row click |
| `qr_scan_opened` | QR scan zone tap |
| `activity_item_clicked` | Activity row |
| `offline_action_queued` | Action submitted offline |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Time to action | Screen open → Issue/Return/Scan click |
| Most used quick action | Issue vs Return vs Scan ratio |
| Task completion from dashboard | Tasks clicked vs completed |
| QR scan usage rate | Per session |
| Offline action rate | Percentage of offline submissions |

---

## Future Improvements

1. Task timer — Start/stop tracking time per task
2. Material request — Request materials not in stock
3. Favorite materials — Quick access to frequently used items
4. Voice commands — "Issue 5 bolts to Task A" via voice
5. Haptic feedback on quick actions (mobile)
6. Weekly summary card — "You issued 145 items this week"
7. AI material recommendations — "Based on Task A, you might need: Nut M12, Bolt M8"
