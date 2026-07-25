# 31 — Empty States

## Overview

**Purpose:** Unified empty state handling across all screens. Provides guidance when no data exists.

**Business Goal:** Reduce user confusion. Guide users to first actions. Increase activation.

**User Goal:** I want to understand why a screen is empty and what to do next.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Any screen with no data, First visit, Filter with no results | Empty state |
| **To** | Create action, Import action, Settings, Help | Next action |

---

## User Story

> As a user, I want clear guidance when there's no content so that I know what to do next.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Standard screen layout with sidebar/top bar]              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌──────────────────────┐                       │
│              │                      │                       │
│              │    Icon (64px)       │                       │
│              │    neutral-300       │                       │
│              │                      │                       │
│              └──────────────────────┘                       │
│                                                             │
│              Title (20px SemiBold, centered)                 │
│              Description (14px Regular, text-secondary)      │
│              Max width 360px, centered                       │
│                                                             │
│              ┌─────────────────────────────┐                 │
│              │   Primary Action Button     │                 │
│              └─────────────────────────────┘                 │
│                                                             │
│              Secondary link (optional)                      │
│                                                             │
│              Padding top: 120px (desktop)                    │
│                          80px (tablet)                       │
│                          48px (mobile)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Empty State Templates

| Context | Icon | Title | Description | Action |
|---------|------|-------|-------------|--------|
| **Materials** | inbox | "No materials yet" | "Create your first material to start tracking inventory." | "Create Material" |
| **Tasks** | clipboard-list | "No tasks assigned" | "Tasks will appear here when your manager assigns them." | "Contact Manager" |
| **Activity** | activity | "No activity yet" | "Activity will appear as you and your team work." | "Get Started" |
| **Notifications** | bell-off | "All caught up!" | "Notifications will appear here when there's something new." | — |
| **Search results** | search-x | "No results found" | "Try adjusting your search or filters." | "Clear Filters" |
| **Reservations** | calendar | "No reservations" | "Reserve materials for upcoming tasks." | "New Reservation" |
| **Movement history** | git-commit | "No movements recorded" | "Movements will appear when materials are issued or returned." | "Issue Material" |
| **Analytics** | bar-chart | "Not enough data" | "Start using materials to see analytics." | "Create Material" |
| **Reports** | file-text | "No reports yet" | "Generate your first report to see data." | "Generate Report" |
| **Users** | users | "No team members" | "Invite your team to collaborate." | "Invite Users" |
| **Workspaces** | building-2 | "No workspaces" | "Create a workspace to organize your inventory." | "Create Workspace" |
| **Knowledge** | book-open | "No articles yet" | "Knowledge base articles will appear here." | "Browse Guides" |
| **AI conversations** | message-circle | "No conversations" | "Start a conversation with Atlas AI." | "Start Chat" |
| **Prompts** | scroll | "No saved prompts" | "Save prompts to reuse them later." | "Create Prompt" |
| **Scanner history** | scan | "No recent scans" | "Scanned materials will appear here." | "Scan Now" |

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Empty State | Main layout | default |
| Button | Primary CTA | primary, md |
| Button | Secondary link | ghost, sm |
| Icon | State illustration | 64px, neutral-300 |

---

## Information Hierarchy

```
Primary:   Icon, Title, Description
Secondary: Primary action button
Tertiary:  Secondary link
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Empty state with CTA. |
| **Loading** | Not applicable (no data to load). |
| **Empty** | This is the empty state itself. |
| **Error** | Not applicable. |
| **Offline** | "Connect to the internet to see your data." |
| **No permissions** | "You don't have access. Contact your admin." |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Centered. 120px top padding. |
| **Tablet** | Centered. 80px top padding. |
| **Mobile** | Centered. 48px top padding. Full width description. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `role="status"`. `aria-live="polite"`. `aria-label` on action button. |
| **Focus order** | Icon (decorative) → Title → Description → Action |
| **Screen reader** | Announce empty state heading. Announce action available. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab to action button. Enter activates. |
| **Touch targets** | Action button ≥ 48pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Icon fade in + bounce | 400ms |
| Text | Staggered fade | 300ms |
| Action button | Fade in | 200ms (delayed) |

---

## Validation

N/A.

---

## Edge Cases

1. **Multiple empty sections** — Each section shows its own empty state independently.
2. **Filtered empty vs absolute empty** — Different message: "No results match filters" vs "No data yet."
3. **Role-based empty states** — Manager sees "Create" CTA. Mechanic sees "Ask your manager."
4. **Offline empty state** — Different message: "Data unavailable offline."
5. **Permission-based empty state** — "Contact admin" instead of "Create."
6. **Empty state after deletion** — "Last item deleted. Create a new one?"
7. **Real-time empty to data transition** — Empty state replaced smoothly as data arrives.
8. **Persistent empty state** — Some screens may be empty indefinitely (e.g., no notifications).
9. **Animation on first visit** — Animate empty state on first ever visit.
10. **Empty state dismissal** — Some empty states persist until action taken. Not dismissible.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `empty_state_shown` | `{context, type}` |
| `empty_state_action` | `{context, action}` |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Empty state frequency | Per context percentage |
| Action conversion | Empty state → action click rate |
| Most common empty state | Context rank |

---

## Future Improvements

1. Personalized empty states — Based on user role and usage history
2. Illustrations — Custom illustrations per context
3. Video help — Embedded "how to" video in empty state
4. Progressive empty states — Different messages over time if user never acts
