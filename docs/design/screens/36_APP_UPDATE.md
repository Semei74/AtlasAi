# 36 — App Update

## Overview

**Purpose:** Notify users about application updates and manage the update process.

**Business Goal:** Ensure users run the latest version. Communicate changes effectively.

**User Goal:** I want to know about updates and update the app when convenient.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | App launch (version check), Background update detection, Settings "Check for updates" | Update prompt |
| **To** | App store (mobile), Download page (desktop), Post-update changes | Update actions |

---

## User Story

> As a user, I want to be notified about updates so that I can get the latest features and fixes.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ┌──────────────────────┐                           │    │
│  │  │   Icon (64px)        │                           │    │
│  │  │   (download/refresh) │                           │    │
│  │  └──────────────────────┘                           │    │
│  │                                                     │    │
│  │  Update Available (20px SemiBold)                    │    │
│  │  Version 2.1.0 is now available.                    │    │
│  │                                                     │    │
│  │  ┌─ What's New ───────────────────────────────┐     │    │
│  │  │  ● AI-powered material recommendations      │     │    │
│  │  │  ● Improved QR scanner performance          │     │    │
│  │  │  ● Bug fixes and performance improvements   │     │    │
│  │  └────────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  Size: 24.5 MB                                      │    │
│  │                                                     │    │
│  │  [Remind Later] [Update Now]                       │    │
│  │  ──────────────────────────                        │    │
│  │  [Skip This Version]                               │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Downloading State ─────────────────────────────────┐    │
│  │  Downloading update... (14px Regular)                │    │
│  │  ████████████░░░░░░░  65%                            │    │
│  │  16.0 MB / 24.5 MB                                   │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Icon + Title
Changelog: What's new section
Actions:   Update Now, Remind Later, Skip
Download:  Progress during download
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Button | Update Now | primary, md |
| Button | Remind Later | outline, md |
| Button | Skip This Version | ghost, sm |
| Progress Bar | Download progress | default |
| Card | Changelog | default |
| Text | Version info, file size | 14px Regular |

---

## Information Hierarchy

```
Primary:   Update action, version info
Secondary: Changelog, progress
Tertiary:  Skip, Remind Later
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Update available. Actions visible. |
| **Downloading** | Progress bar. Pause/resume option. |
| **Downloaded** | "Ready to install" with Install button. |
| **Installing** | "Installing..." with spinner. App may restart. |
| **Success** | "Updated to v2.1.0" with "What's New" link. |
| **Error** | "Download failed. Check connection." Retry. |
| **Up to date** | "You're on the latest version." (from manual check) |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Centered modal or dialog. |
| **Tablet** | Modal. Full width. |
| **Mobile** | Full-screen or bottom sheet. App store redirect. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `role="dialog"`. `aria-label="Update available"`. `aria-live` on progress. |
| **Focus order** | Title → Changelog → Update → Remind → Skip |
| **Screen reader** | Announce update availability. Announce progress updates. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Enter to update. Esc to dismiss (Remind Later). |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Dialog enter | Modal slide up | 300ms |
| Progress | Bar fill | smooth |
| Download complete | Checkmark appear | 300ms |

---

## Validation

N/A.

---

## Edge Cases

1. **Forced update** — Critical security update cannot be skipped. "Update required to continue."
2. **Slow download** — Show estimated time remaining. Pause/resume support.
3. **Download interruption** — Resume on reconnect. Auto-retry 3 times.
4. **Storage full** — "Not enough storage. Free up space and try again."
5. **App store redirect (mobile)** — Open app store for download. Show "Open App Store" button.
6. **Silent update (web)** — Service worker update in background. Show toast "Updated to v2.1.0."
7. **Skipped version** — Skip this specific version. Next version will show again.
8. **Remind later timing** — Remind in 24 hours. Or next app launch.
9. **Beta vs production** — Beta users may have different update cadence.
10. **Multiple updates in queue** — Show latest version. Previous updates are inclusive.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `update_available` | Version check result |
| `update_now_clicked` | Update action |
| `update_downloaded` | Download complete |
| `update_installed` | Installation complete |
| `update_failed` | `{reason}` |
| `update_remind_later` | Remind action |
| `update_skipped` | `{version}` — Skip action |
| `update_forced` | Forced update shown |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Update adoption rate | Percentage updated within 7 days |
| Time to update | Available → installed |
| Download success rate | Completed vs failed |
| Version distribution | Active versions percentage |
| Skip rate | Skipped per version |

---

## Future Improvements

1. Background download — Download in background, prompt to install when ready
2. Delta updates — Download only changed files
3. Auto-update (desktop) — Silent update with restart
4. Feature flags — Gradual rollout with A/B testing
5. Update scheduling — Schedule update during idle time
6. Beta program — Opt-in to beta releases
7. Rollback support — Revert to previous version if issues
