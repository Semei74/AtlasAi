# 34 — Offline Mode

## Overview

**Purpose:** Handle network connectivity loss gracefully. Maintain usability when offline.

**Business Goal:** Ensure core functionality works offline. Prevent data loss. Enable productivity anywhere.

**User Goal:** I want to continue using Atlas AI even without internet and not lose my work.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Network disconnect, Airplane mode, Poor connectivity, Background/foreground transition | Offline state |
| **To** | Online state (automatic reconnect), Manual retry | Recovery |

---

## User Story

> As a mobile user, I want Atlas AI to work offline so that I can continue working in areas with poor connectivity.

---

## Layout

### Offline Banner

```
┌─────────────────────────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓  You're offline. Changes will sync when connected.  ▓  │
│  ▓  [Dismiss]                                      🟡    │  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────────────────────────────────────┘
```

### Full Offline State

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ┌──────────────────────┐                       │
│              │                      │                       │
│              │  Icon (64px)         │                       │
│              │  neutral-300         │                       │
│              │                      │                       │
│              └──────────────────────┘                       │
│                                                             │
│              You're offline (20px SemiBold)                  │
│              Some features are unavailable.                 │
│              Changes will be saved and synced               │
│              when you're back online.                       │
│                                                             │
│              [Retry Connection]                             │
│                                                             │
│              Last synced: 2 minutes ago                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Offline Behavior by Feature

| Feature | Online | Offline |
|---------|--------|---------|
| **Browse materials** | Live data | Cached data (last synced) |
| **Material detail** | Live data | Cached data |
| **Issue material** | Instant submit | Queue for sync |
| **Return material** | Instant submit | Queue for sync |
| **Create material** | Instant save | Queue for sync |
| **Search** | Server search | Local cache search |
| **QR scan** | Full lookup | Cache lookup + queue |
| **AI Chat** | Live AI responses | "Unavailable offline" |
| **Analytics** | Live charts | Cached snapshots |
| **Notifications** | Real-time | Queued on reconnect |
| **Settings** | Instant save | Queue for sync |
| **Profile** | Live | Cached |
| **Activity feed** | Live | Cached (last 50 items) |
| **Knowledge base** | Live articles | Cached articles |
| **Dashboard** | Live KPIs | Cached snapshot |

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Banner | Offline indicator | warning, persistent |
| Icon | Connection status | 64px (full), 16px (banner) |
| Button | Retry connection | primary, sm |
| Button | Dismiss banner | ghost, sm |
| Badge | Queue count | warning, sm |
| Toast | Sync complete | success |
| Progress | Sync progress | default |

---

## Information Hierarchy

```
Primary:   Offline banner, Queue indicator
Secondary: Retry button, Last synced time
Tertiary:  Dismiss, Queue count
```

---

## States

| State | Behavior |
|-------|----------|
| **Online** | Normal operation. No offline indicators. |
| **Offline (recent)** | Banner shown. Data from cache. Actions queued. |
| **Offline (extended)** | Full offline state after 5 min. Reduced UI. |
| **Reconnecting** | Banner changes to "Reconnecting..." with spinner. |
| **Online (reconnected)** | Banner "Back online!" for 3s. Sync queued actions. |
| **Sync in progress** | Progress bar showing sync status. |
| **Sync complete** | Toast "All changes synced." |
| **Sync error** | "Some changes failed to sync." with details. |

---

## Responsive

| Platform | Behavior |
|----------|----------|
| **Desktop** | Persistent banner below top bar. |
| **Tablet** | Same as desktop. |
| **Mobile** | Persistent banner at top. Compact. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-live="polite"` on connectivity changes. `role="alert"` on offline banner. |
| **Focus order** | Banner (if persistent) → Content → Retry |
| **Screen reader** | Announce "You're offline" immediately. Announce "Back online" on reconnect. |
| **Contrast** | Warning banner meets 4.5:1. |
| **Keyboard** | Dismiss banner. Retry connection. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Offline transition | Banner slides down | 300ms |
| Online transition | Banner slides up | 300ms |
| Sync progress | Progress bar fill | dynamic |
| Queue indicator | Badge count update | 200ms |
| Reconnecting | Spinner | loop |

---

## Validation

N/A — System state.

---

## Edge Cases

1. **Flaky connection** — Debounce connectivity changes. 2s delay before showing offline.
2. **Partial connectivity** — App is online but API is down. Show "Service unavailable" instead.
3. **Queue overflow** — Max 100 queued actions. Show warning "Queue is full. Complete pending actions."
4. **Conflict on sync** — If data changed while offline, show conflict resolution dialog.
5. **Large queue sync** — Prioritize order. Show progress. Allow cancel.
6. **Authentication while offline** — Can't authenticate offline. Show cached session if valid.
7. **File uploads offline** — Queue file metadata. Upload files when online.
8. **Offline cache limit** — Max 500MB cached data. Clear oldest when limit reached.
9. **Shared device** — Queue is per user. Clear queue on logout.
10. **Force offline mode** — Some users may want manual offline mode (airplane mode).

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `offline_mode_entered` | Connection lost |
| `offline_mode_exited` | Reconnected |
| `offline_action_queued` | `{action_type}` |
| `offline_queue_synced` | Queue processed |
| `offline_sync_conflict` | Conflict detected |
| `offline_cache_cleared` | Cache limit reached |
| `offline_duration` | Time spent offline |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Offline frequency | Per user per session |
| Average offline duration | Time without connection |
| Queue size distribution | Actions queued per session |
| Sync conflict rate | Conflicts per synced items |
| Feature usage offline | Most used offline features |

---

## Future Improvements

1. Full offline mode — Download entire workspace for offline use
2. Offline AI — On-device AI model for basic queries
3. Background sync — Sync in background even when app closed
4. Smart cache — Pre-fetch likely-needed data based on usage patterns
5. Offline analytics — Queue analytics events for later upload
6. Selective offline — User selects which data to keep offline
7. P2P sync — Direct device-to-device sync for team collaboration
