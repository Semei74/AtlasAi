# 09 — Settings

## Overview

**Purpose:** Central configuration hub for user preferences, workspace settings, and application behavior.

**Business Goal:** Empower users to customize their experience. Reduce confusion through clear preference organization.

**User Goal:** Configure how Atlas AI looks, behaves, and communicates with me.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Top bar avatar dropdown, Sidebar "Settings", Profile "App Preferences" | Settings landing |
| **To** | Profile, Notifications, Workspace settings, API Keys | Section-level settings |

---

## User Story

> As a user, I want to configure my preferences so that Atlas AI works the way I need it to.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Settings (24px SemiBold)                          │
│ Side   │  ┌──────────┬────────────────────────────────────┐ │
│ Bar    │  │          │  ┌─ General ─────────────────────┐  │ │
│        │  │ General  │  │  Language ▾                   │  │ │
│        │  │──────────│  │  Theme        ○ Light ○ Dark  │  │ │
│        │  │ Notific. │  │  Timezone ▾                   │  │ │
│        │  │──────────│  │  Density  ○ Comf ○ Compact    │  │ │
│        │  │ Appear.  │  └───────────────────────────────┘  │ │
│        │  │──────────│                                      │ │
│        │  │ Workspce │  ┌─ Notifications ───────────────┐  │ │
│        │  │──────────│  │  Push notifications    ◉───○  │  │ │
│        │  │ Integrat.│  │  Email notifications    ◉───○  │  │ │
│        │  │──────────│  │  Low stock alerts       ◉───○  │  │ │
│        │  │ API Keys │  │  Issue confirmations    ○───◉  │  │ │
│        │  └──────────│  └────────────────────────────────┘  │ │
│        │             └──────────────────────────────────────┘ │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Nav:       Sidebar section navigation (vertical tabs)
Content:   Settings sections (scrollable, auto-save on change)
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Tabs (vertical) | Settings navigation | pill |
| Select | Language, Timezone | md |
| Toggle Group | Theme | md |
| Toggle Group | Density | md |
| Switch | Notification toggles | md |
| Input | API Key name | outlined, md |
| Button | Generate API Key | primary, sm |
| Button | Revoke API Key | destructive, sm |
| Toast | Saved confirmation | success |
| Card | Settings section | default |

---

## Information Hierarchy

```
Primary:   Active settings section, toggles, selects
Secondary: Section navigation, save indicator
Tertiary:  Section descriptions, help links
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Current settings displayed. Changes auto-save. |
| **Loading** | Skeleton for settings sections. |
| **Success** | Toast "Settings saved" on change. |
| **Error** | Inline error on failed save. Retry button. |
| **Offline** | Banner "Changes will be saved when back online." Queue changes. |
| **Empty** | Not applicable. |
| **No permissions** | Restricted sections hidden. "Contact admin." |
| **No data** | Not applicable. |
| **Syncing** | "Saving..." indicator. |
| **Updating** | Not applicable. |
| **Read only** | Settings displayed but controls disabled. "Managed by admin" note. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Two-column: nav (240px) + content. |
| **Tablet** | Two-column. Nav collapses to icons. |
| **Mobile** | Single column. Section nav as accordion at top. Settings stack. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `role="tablist"` on nav. `aria-selected` on active. `aria-live="polite"` on save. |
| **Focus order** | Nav → Active section → Save indicator |
| **Screen reader** | Announce section changes. Announce save status. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Arrow keys navigate sections. Enter activates. Tab through settings. |
| **Touch targets** | ≥ 44×44pt for switches, selects. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Section switch | Content cross-fade | 200ms |
| Toggle switch | Thumb slide | 150ms |
| Save indicator | Fade in/out | 500ms |
| Section nav | Active indicator slide | 200ms |

---

## Validation

| Field | Rule |
|-------|------|
| Language | Must be one of supported languages |
| Timezone | Must be valid IANA timezone |
| API Key name | Required, min 3 chars, alphanumeric + hyphens |

---

## Edge Cases

1. **Language change** — Apply immediately. Toast "Language changed. Some text may require app restart."
2. **Timezone changes** — All timestamps update immediately. Toast confirmation.
3. **Auto-save conflict** — If two changes are made rapidly, debounce save (500ms).
4. **Density change** — Apply immediately throughout app. Smooth transition.
5. **Disabled settings due to policy** — Show lock icon + tooltip "Managed by organization."
6. **API key generation** — Show key once with copy button + warning "Save this key. It won't be shown again."
7. **Settings reset** — "Reset to defaults" button with confirmation dialog.
8. **Workspace-wide settings vs personal** — Clearly label "Workspace setting" vs "Personal preference."
9. **Notification test** — "Send test notification" button to verify channel works.
10. **Nested settings** — Sub-sections with back navigation on mobile.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `section_viewed` | `{section: "general"\|"notifications"\|...}` |
| `setting_changed` | `{setting: "theme"\|"language"\|..., value}` |
| `api_key_generated` | API key create |
| `api_key_revoked` | API key revoke |
| `test_notification_sent` | Test notification |
| `settings_reset` | Reset to defaults |
| `save_failed` | Error on save |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Most accessed section | Section view count |
| Most changed setting | Setting change count |
| Save conflict rate | Rapid changes per session |
| API key generation rate | Per user per period |
| Settings session time | Time spent in settings |

---

## Future Improvements

1. Import/export settings as JSON
2. Keyboard shortcuts customization
3. Notification schedule (quiet hours)
4. Data retention preferences
5. Accessibility settings (font size, reduced motion)
6. Beta features toggle
7. Workspace-level settings with role-based access
