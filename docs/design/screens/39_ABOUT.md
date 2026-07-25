# 39 — About

## Overview

**Purpose:** Display application information, version, licenses, and legal notices.

**Business Goal:** Provide transparency about the application. Fulfill legal requirements.

**User Goal:** I want to see the app version, check for updates, and read legal information.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Settings "About", Help "About Atlas AI", Sidebar bottom "About" | About screen |
| **To** | App Update, Licenses, Privacy Policy, Terms of Service, Open Source Licenses | Legal/documentation |

---

## User Story

> As a user, I want to see application information so that I know what version I'm running and can access legal documents.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  About (24px SemiBold)                             │
│ Side   │                                                     │
│ Bar    │  ┌────────────────────────────────────────────┐    │
│        │  │              ┌──────────┐                   │    │
│        │  │              │  Logo    │                   │    │
│        │  │              │  96px    │                   │    │
│        │  │              └──────────┘                   │    │
│        │  │              Atlas AI                       │    │
│        │  │         Enterprise Material Management      │    │
│        │  │                                             │    │
│        │  │         Version 2.0.0 (Build 2024.07)       │    │
│        │  │         [Check for Updates]                 │    │
│        │  └────────────────────────────────────────────┘    │
│        │                                                     │
│        │  ┌─ Information ───────────────────────────────┐   │
│        │  │  Version         2.0.0                      │   │
│        │  │  Build Number    2024.07.23                 │   │
│        │  │  Platform        Web / Mobile / Desktop     │   │
│        │  │  Environment     Production                  │   │
│        │  │  API Version     v1                         │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Legal ─────────────────────────────────────┐   │
│        │  │  Privacy Policy                              │   │
│        │  │  Terms of Service                            │   │
│        │  │  Open Source Licenses                        │   │
│        │  │  Cookie Policy                              │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ System ───────────────────────────────────┐   │
│        │  │  User ID: usr_abc123                        │   │
│        │  │  Workspace: wh_main                         │   │
│        │  │  Session ID: sess_xyz789                    │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  © 2024 Atlas AI. All rights reserved.              │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Logo + App name + Version
Info:      Version details (description list)
Legal:     Legal document links
System:    Debug info (expandable)
Footer:    Copyright
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Avatar (logo) | App icon | 2xl (96px) |
| Description List | Version info | — |
| Link | Legal documents | default |
| Button | Check for Updates | outline, sm |
| Alert | Environment indicator (dev/staging) | warning |
| Text | Copyright | caption (12px) |

---

## Information Hierarchy

```
Primary:   App name, version, logo
Secondary: Legal links, update check
Tertiary:  System info, copyright
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | App info displayed. |
| **Loading** | Skeleton for version info. |
| **Error** | "Failed to load version info." |
| **Offline** | Cached version info. |
| **Development** | Orange badge "Development Build" |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Centered card with sidebar. |
| **Tablet** | Single column. |
| **Mobile** | Single column. Centered logo. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label` on logo. `aria-labelledby` on sections. |
| **Focus order** | Logo → Info → Legal → System |
| **Screen reader** | Announce version. Announce environment. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through links. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Logo enter | Scale in | 400ms |
| Sections | Staggered fade | 300ms |

---

## Validation

N/A.

---

## Edge Cases

1. **Outdated version** — Show "Update available" badge on version number.
2. **Development environment** — Show prominent badge. Different color scheme.
3. **Expired license** — Show "License expired" warning with renewal link.
4. **Build metadata** — Show commit hash, build date for debugging.
5. **Regulatory info** — Different legal text based on user region (GDPR, CCPA).
6. **Copy version to clipboard** — Tap version number to copy for support.
7. **Session info** — Collapsible debug section. Not visible by default.
8. **Environment-specific info** — Show server region, data center.
9. **Third-party attributions** — Comprehensive list of open source licenses.
10. **App icon cache** — If logo fails to load, show text fallback.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `check_updates` | Check for updates |
| `legal_link_clicked` | `{document}` |
| `version_copied` | Tap version to copy |
| `debug_info_expanded` | System info toggle |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Version distribution | Active versions percentage |
| Environment access | Dev vs staging vs production |
| Legal document views | Per document |
| Update check rate | Manual checks per period |

---

## Future Improvements

1. System health status — Server status, API latency
2. Feature flag display — Show enabled/disabled features
3. Environment switcher — Switch between dev/staging/prod (admin only)
4. Diagnostics export — Export system info for support
5. Uptime display — Application uptime since last deploy
6. Support contact — Quick access to support with version pre-filled
