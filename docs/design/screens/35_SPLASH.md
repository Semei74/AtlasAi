# 35 — Splash

## Overview

**Purpose:** Application launch screen shown during initial load.

**Business Goal:** Provide branded experience during startup. Indicate loading progress.

**User Goal:** I want to see that the app is launching and know it's working.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | App launch, Cold start, Reboot | Splash screen |
| **To** | Login (unauthenticated), Dashboard (authenticated), Onboarding (first launch) | Post-load |

---

## User Story

> As a user, I want a quick branded launch experience so that I know the app is starting.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│              ┌──────────────────────┐                       │
│              │                      │                       │
│              │    Logo (96px)       │                       │
│              │    full color        │                       │
│              │                      │                       │
│              └──────────────────────┘                       │
│                                                             │
│              Atlas AI (24px SemiBold)                       │
│              Enterprise Material Management                 │
│                                                             │
│                                                             │
│              ┌──────────────────────┐                       │
│              │  ████████████░░░░░░  │  (progress bar)      │
│              └──────────────────────┘                       │
│                                                             │
│              Loading resources... (12px Regular)            │
│                                                             │
│                                                             │
│                                                             │
│              Version 2.0.0 (12px text-tertiary, bottom)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Logo:      Centered, 96px
Title:     App name below logo
Tagline:   Subtitle (Enterprise Material Management)
Progress:  Indeterminate or determinate progress bar
Status:    Loading message (changes during phases)
Version:   Version number at bottom
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Icon | Logo | 96×96px |
| Progress | Loading bar | 240px width, indeterminate |
| Text | Version | 12px, text-tertiary |

---

## Information Hierarchy

```
Primary:   Logo, app name
Secondary: Loading indicator
Tertiary:  Version, tagline
```

---

## States

| State | Behavior |
|-------|----------|
| **Cold start** | Full splash. All assets load. |
| **Warm start** | Brief splash or skip (cached). |
| **Loading** | Progress bar animates. Status messages cycle. |
| **Error** | If load fails, show error with retry on splash. |
| **Time-out** | After 10s, show "Taking longer than expected." Continue loading. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Centered. Max 400px width. |
| **Tablet** | Centered. Same layout. |
| **Mobile** | Centered. Full screen. Adapts to safe areas. |
| **Web** | Brief splash (2s max). Skip if app loads faster. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label="Atlas AI loading"`. `role="progressbar"` on progress. |
| **Focus order** | No interactive elements. Focus moves to post-splash screen. |
| **Screen reader** | Announce "Atlas AI loading. Please wait." |
| **Contrast** | Logo has sufficient contrast against background. |
| **Keyboard** | No interaction on splash. |
| **Touch targets** | Not applicable. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Logo enter | Scale in + fade | 500ms |
| Progress bar | Indeterminate sweep | 1.5s loop |
| Status text | Cycle every 2s | cross-fade |
| Splash exit | Fade out | 300ms |

**Status messages (cycle):**
```
"Loading resources..."
"Connecting to server..."
"Preparing your workspace..."
"Almost ready..."
```

---

## Validation

N/A.

---

## Edge Cases

1. **Splash timeout** — After 15s, show "Still loading..." with retry option.
2. **Auth token check** — During splash, validate stored session. Redirect accordingly.
3. **Network required for auth** — If offline and no cached session, show "Internet required to sign in."
4. **App update detected** — Show "Update available" during splash with update prompt.
5. **First launch** — Show "Welcome!" variant with slightly different messaging.
6. **Crash on previous session** — Show "Restoring session..." if recovering from crash.
7. **Very fast load** — Minimum splash display time of 500ms to prevent flash.
8. **Accessibility mode** — Respect reduced motion. No logo animation.
9. **Branding variant** — Different splash for white-label customers.
10. **Environment indicator** — Show "Development" or "Staging" badge for non-production.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `app_launched` | Splash start |
| `splash_completed` | Splash end (time) |
| `splash_timeout` | Exceeded 15s |
| `session_restored` | Cached session found |
| `first_launch` | First ever launch |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| App launch time | Splash start → content rendered |
| Cold vs warm start | Percentage |
| Average splash duration | Time on splash screen |
| Launch failure rate | Crashes during splash |
| First launch rate | New users per period |

---

## Future Improvements

1. Animated logo — Subtle motion in logo (on supported devices)
2. Personalized splash — "Good morning, {name}" for returning users
3. Dynamic branding — Themed splash based on time of day
4. Quick actions from splash — Tap logo to access recent items
5. Offline splash — Different treatment for offline launch
