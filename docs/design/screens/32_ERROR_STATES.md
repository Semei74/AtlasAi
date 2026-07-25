# 32 — Error States

## Overview

**Purpose:** Unified error handling for all error conditions across the platform.

**Business Goal:** Provide clear, actionable error messages. Reduce user frustration.

**User Goal:** I want to understand what went wrong and how to fix it.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Any failed API call, Network failure, Permission denied, 404/403/500 | Error state |
| **To** | Retry attempt, Home, Login, Support, Settings | Recovery action |

---

## User Story

> As a user, I want clear error messages so that I can understand what happened and fix it.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Standard screen layout if partial error]                   │
│  [Full screen if critical error]                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌──────────────────────┐                       │
│              │                      │                       │
│              │    Icon (48px)       │                       │
│              │    error color       │                       │
│              │                      │                       │
│              └──────────────────────┘                       │
│                                                             │
│              Title (18px SemiBold, centered)                 │
│              Description (14px Regular, text-secondary)      │
│              Max width 400px, centered                       │
│                                                             │
│              ┌─────────────────────────────┐                 │
│              │      Try Again              │                 │
│              └─────────────────────────────┘                 │
│                                                             │
│              [Contact Support]                               │
│                                                             │
│              Error ID: ERR-ABC-123 (12px text-tertiary)     │
│                                                             │
│              Padding top: 120px (desktop)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Templates

| Error Type | Icon | Title | Description | Action |
|------------|------|-------|-------------|--------|
| **404 Not Found** | file-x | "Page not found" | "The page you're looking for doesn't exist or has been moved." | "Go Home" |
| **403 Forbidden** | lock | "Access denied" | "You don't have permission to view this page." | "Request Access" |
| **401 Unauthorized** | log-out | "Session expired" | "Your session has expired. Please sign in again." | "Sign In" |
| **500 Server Error** | alert-triangle | "Something went wrong" | "Our team has been notified. Please try again." | "Try Again" |
| **Network Error** | wifi-off | "Connection lost" | "Check your internet connection and try again." | "Retry" |
| **Timeout** | clock | "Request timed out" | "The server is taking too long to respond." | "Try Again" |
| **Service Unavailable** | cloud-off | "Service unavailable" | "This service is temporarily down for maintenance." | "Check Status" |
| **Rate Limited** | slash | "Too many requests" | "Please slow down and try again in a moment." | "Try Again" |
| **Feature Unavailable** | ban | "Feature unavailable" | "This feature is not available in your current plan." | "Upgrade Plan" |
| **Data Load Failed** | database | "Could not load data" | "We couldn't load this data. Please try again." | "Retry" |
| **Save Failed** | save | "Could not save" | "Your changes couldn't be saved. Try again." | "Retry" |
| **Action Failed** | x-circle | "Action failed" | "We couldn't complete this action. Please try again." | "Try Again" |

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Icon | Error illustration | 48px, error/destructive |
| Button | Primary action (Try Again, Go Home, etc.) | primary, md |
| Button | Secondary (Contact Support) | ghost, sm |
| Text | Error ID | 12px, text-tertiary |
| Card | Error container | default (no border) |

---

## Information Hierarchy

```
Primary:   Title, Description
Secondary: Action buttons
Tertiary:  Error ID (for support)
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Error message with recovery actions. |
| **Loading (retry)** | Retry button shows spinner. |
| **Success (retry)** | Error state replaced with content. |
| **Error (retry failed)** | "Still having trouble." Alternative actions offered. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Centered. 120px top padding. |
| **Tablet** | Centered. 80px top padding. |
| **Mobile** | Centered. 48px top padding. Full width. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `role="alert"`. `aria-live="assertive"`. `aria-label` on action buttons. |
| **Focus order** | Icon → Title → Description → Action → Support → Error ID |
| **Screen reader** | Announce error immediately. Announce recovery options. |
| **Contrast** | Error icons meet 4.5:1. Title meets 7:1. |
| **Keyboard** | Tab to action. Enter activates. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Fade in + slight scale | 300ms |
| Icon | Pulse/beat animation | 500ms once |
| Action buttons | Staggered fade | 200ms |

---

## Validation

N/A — Error states are reactive.

---

## Edge Cases

1. **Multiple errors** — Show first critical error. Banner for secondary errors.
2. **Error recovery** — After retry succeeds, transition smoothly to content.
3. **Persistent errors** — After 3 retry failures, show "Persistent issue. Contact support."
4. **Network offline** — Different message than server error. Offline indicator persistent.
5. **Error with partial data** — Show partial content with error banner for failed section.
6. **Error during form submission** — Keep form data. Show inline errors. Don't navigate away.
7. **Error ID generation** — Unique error ID for support reference. Log server-side.
8. **Auto-retry** — For transient errors, auto-retry 3 times with exponential backoff.
9. **Error boundary** — Catch React rendering errors. Show fallback UI without breaking app.
10. **WebSocket disconnection** — Show reconnecting indicator. Don't show full error.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `error_displayed` | `{error_type, error_id, screen}` |
| `error_retry_clicked` | `{error_type, attempt}` |
| `error_retry_succeeded` | Retry success |
| `error_retry_failed` | Retry failure |
| `error_contact_support` | Support link click |
| `error_navigate_home` | Go Home click |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Error rate | Per type, per screen |
| Retry success rate | Recoveries vs total errors |
| Time to recovery | Error display → successful retry |
| Most common error | Error type rank |
| Error per user session | Average count |

---

## Future Improvements

1. AI-powered error explanations — "This usually happens when..."
2. Error reporting — User can report error with screenshot
3. Error status page — System status dashboard
4. Offline queue recovery — Show pending actions that will retry
5. Error prediction — Warn users before rate limits or timeouts
