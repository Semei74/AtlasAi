# 05 — Onboarding

## Overview

**Purpose:** Guide new users through first-time setup and introduce key platform features.

**Business Goal:** Increase activation rate. Reduce time-to-value. Collect initial user preferences.

**User Goal:** Set up my workspace, understand key features, and start my first task.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Registration complete, First login (new account detection) | Welcome step 1 |
| **To** | Dashboard (role-specific), Workspace selection, First material creation | Post-onboarding |

---

## User Story

> As a new user, I want a guided introduction so that I understand how Atlas AI works and can start being productive immediately.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Minimal Top Bar: Logo (left) | Skip (right, link)          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │                ┌────────────────────┐                 │   │
│  │                │  Illustration      │                 │   │
│  │                │  (320×240px)       │                 │   │
│  │                └────────────────────┘                 │   │
│  │                                                       │   │
│  │   Title: Welcome to Atlas AI (24px SemiBold, center)  │   │
│  │   Description: Your AI-powered workspace              │   │
│  │   for material management. (16px Regular, center)     │   │
│  │                                                       │   │
│  │   ● ● ○ ○ ○   (progress dots, 5 steps)               │   │
│  │                                                       │   │
│  │            [Skip]    [Next →]                         │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Logo + Skip link
Content:   Illustration, Title, Description (centered, max 480px)
Progress:  Dot indicators (5 steps)
Actions:   Skip (ghost) + Next (primary)
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Button | Skip | ghost, sm |
| Button | Next | primary, md |
| Button | Get Started (last step) | primary, lg |
| Stepper | Progress dots | 5 steps, horizontal |
| Empty State | Welcome illustration | 320×240px |

---

## Steps

| Step | Title | Content | Action |
|------|-------|---------|--------|
| 1 | Welcome to Atlas AI | "Your AI-powered workspace for material management." | Next |
| 2 | Manage Materials | "Track, issue, and return materials with ease. Scan QR codes for instant updates." | Next |
| 3 | AI-Powered Insights | "Get smart recommendations, automate workflows, and chat with Atlas AI." | Next |
| 4 | Workspace Setup | Select your role, workspace name, preferences | Next |
| 5 | You're All Set! | Summary of what's ready. Quick start guide. | Get Started |

---

## Information Hierarchy

```
Primary:   Next/Get Started button, Step content
Secondary: Skip link, Progress dots
Tertiary:  Logo, Illustration
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Current step visible. Next enabled. Skip always available. |
| **Loading** | Not applicable (no async operations during onboarding). |
| **Success** | On last step, "Get Started" transitions to dashboard. |
| **Error** | Not applicable during steps. Error on workspace creation if applicable. |
| **Offline** | Onboarding works in offline mode. Sync preferences later. |
| **Empty** | Not applicable. |
| **No permissions** | Not applicable (fresh account). |
| **No data** | First-time state is expected. |
| **Syncing** | On final step, sync preferences if online. |
| **Updating** | Not applicable. |
| **Read only** | Not applicable. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Card centered, max 560px. Illustration 320×240. |
| **Tablet** | Card centered, max 480px. Illustration 280×210. |
| **Mobile** | Full width. Illustration 240×180. 16px padding. Steps are scrollable vertically. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label="Onboarding step {N} of 5"`. `role="progressbar"` on dots. `aria-live="polite"` on step content change. |
| **Focus order** | Skip → Step content → Next/Get Started |
| **Screen reader** | Announce step changes. Announce progress. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Right arrow = Next. Left arrow = Previous (if implemented). Enter = Next. Esc = Skip? Confirm. |
| **Touch targets** | ≥ 44×44pt. Swipe left/right to navigate steps. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Step enter | Slide in from right | 300ms ease-out |
| Step exit | Slide out to left | 200ms ease-in |
| Progress dot | Active dot scale + color | 200ms |
| Last step | Confetti or celebration | 500ms |
| Skip exit | Fade out + redirect | 200ms |

---

## Validation

| Step | Validation |
|------|-----------|
| Workspace name (step 4) | Required, min 2 chars, max 50, alphanumeric + spaces |
| Role selection (step 4) | Must select one option |
| All steps | No validation on walkthrough steps (1–3, 5). Step 4 requires input. |

---

## Edge Cases

1. **Skip at any step** — Confirm "Are you sure? You can always come back to onboarding later." Skip → Dashboard.
2. **Back from dashboard** — Onboarding accessible from Help/Getting Started. Does not replay automatically.
3. **Incomplete step 4** — Show "Please complete this step to continue." Highlight required field.
4. **Offline workspace creation** — Queue workspace creation. Sync when online.
5. **Existing data conflict** — If user already has data (invited before finishing onboarding), adjust steps.
6. **Role change mid-onboarding** — If admin changes user role during onboarding, reflect in step 4.
7. **Multiple devices** — Onboarding per device (first launch on each device). Progress saved per account.
8. **Slow illustration load** — Skeleton placeholder. Text content loads immediately.
9. **Very long names** — Truncate with ellipsis in workspace name field. Show character count.
10. **Accessibility skip** — Users who prefer to skip onboarding can check "Don't show again."

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `onboarding_started` | First step viewed |
| `step_viewed` | `{step: 1-5}` |
| `step_completed` | `{step: 1-5}` |
| `skip_clicked` | Skip link click |
| `onboarding_completed` | Last step "Get Started" |
| `onboarding_abandoned` | Navigate away mid-onboarding |
| `workspace_created` | Workspace name + role submitted (step 4) |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Step completion rate | Per step, drop-off analysis |
| Average completion time | Start to finish |
| Skip rate | Percentage skipping |
| Most common workspace name | Step 4 text analysis |
| Role distribution | Step 4 role selection |

---

## Future Improvements

1. Personalized onboarding based on role (Manager vs Mechanic)
2. Interactive tutorial (guided click-through of actual UI)
3. Video walkthrough options
4. Progress save — resume onboarding if interrupted
5. Team onboarding — invite team members during flow
6. Sample data import during onboarding
7. Integration setup (Slack, Teams, email) during onboarding
