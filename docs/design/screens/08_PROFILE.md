# 08 — Profile

## Overview

**Purpose:** Display and manage user profile information, preferences, and account settings.

**Business Goal:** Allow users to maintain accurate personal information. Reduce profile-related support requests.

**User Goal:** View and update my personal details, change my avatar, and configure my preferences.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Top bar avatar dropdown "Profile", Sidebar "Profile" | Profile view |
| **To** | Settings, Edit Profile (inline), Change Password, Notifications | Profile sections |

---

## User Story

> As a user, I want to view and update my profile information so that my details are accurate and my preferences reflect how I want to use the platform.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  ┌────────────────────────────────────────────┐    │
│ Side   │  │  ┌──────┐  Name (24px SemiBold)            │    │
│ Bar    │  │  │Avatar│  Role: Warehouse Manager          │    │
│        │  │  │96px  │  Workspace: Main Warehouse       │    │
│        │  │  └──────┘  [Edit Profile]                  │    │
│        │  └────────────────────────────────────────────┘    │
│        │                                                     │
│        │  ┌─ About ─────────────────────────────────────┐   │
│        │  │  Email:           alex@example.com           │   │
│        │  │  Phone:           +1 (555) 123-4567          │   │
│        │  │  Department:      Maintenance                │   │
│        │  │  Location:        Building A, Floor 2        │   │
│        │  │  Timezone:        America/New_York (EST)     │   │
│        │  │  Member since:    Jan 15, 2024               │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Account ───────────────────────────────────┐   │
│        │  │  [Change Password]  [Two-Factor Auth]  ○    │   │
│        │  │  [Email Notifications]  [App Preferences]   │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Activity Stats ─────────────────────────────┐   │
│        │  │  Materials issued:      156                  │   │
│        │  │  Materials returned:    89                   │   │
│        │  │  QR scans performed:    234                  │   │
│        │  │  AI chats started:      45                   │   │
│        │  └──────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Danger Zone ───────────────────────────────┐   │
│        │  │  [Delete Account]                           │   │
│        │  └──────────────────────────────────────────────┘   │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Avatar + Name + Role (large, prominent)
About:     Contact details (description list)
Account:   Action links + toggles
Stats:     Usage statistics (read-only)
Danger:    Destructive actions (red section)
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Avatar | User photo | xl (96px) |
| Button | Edit Profile | outline, md |
| Description List | Contact info | — |
| Button | Change Password | ghost, md, with icon |
| Switch | Two-Factor Auth | md |
| Stat | Activity stats (4) | sm |
| Alert | Danger Zone | warning |
| Button | Delete Account | destructive, md |
| Badge | Role | info |

---

## Information Hierarchy

```
Primary:   Avatar, Name, Role, Edit Profile
Secondary: Contact info, Account actions, Activity stats
Tertiary:  Danger zone, Member since
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Profile data displayed. Read-only except action buttons. |
| **Loading** | Skeleton avatar + skeleton text lines. |
| **Success** | Data loaded. Animations complete. |
| **Error** | Error banner "Could not load profile." Retry. |
| **Offline** | Banner "Showing cached profile." Edit disabled. |
| **Empty** | Not applicable (profile always has data for logged-in user). |
| **No permissions** | Edit button hidden for restricted profiles. |
| **No data** | Not applicable. |
| **Syncing** | "Saving..." indicator on profile edit. |
| **Updating** | Inline save indicator. |
| **Read only** | Edit buttons hidden. "View only mode." |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full layout with sidebar. Profile sections in columns. |
| **Tablet** | Stacked layout. Sidebar collapsed. |
| **Mobile** | Single column. Avatar centered. Sections stack. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `img` role on avatar with `aria-label`. `aria-labelledby` on sections. |
| **Focus order** | Avatar → Name → Edit → About → Account → Stats → Danger |
| **Screen reader** | Announce profile data. Announce section headers. |
| **Contrast** | Per COLOR_SYSTEM.md. Danger zone uses error colors meeting WCAG. |
| **Keyboard** | Tab through sections. Enter activates buttons. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Sections fade in staggered | 300ms total |
| Avatar | Subtle scale on hover | 200ms |
| Edit transition | Slide to edit mode | 250ms |
| Stat count | Count-up animation | 500ms |

---

## Validation

| Action | Rule |
|--------|------|
| Edit name | Min 2 chars, max 100. Allow Unicode. |
| Edit phone | Valid phone format. Optional. |
| Change password | Min 8 chars. Must match confirm. Old password required. |
| Delete account | Must type "DELETE" to confirm. |

---

## Edge Cases

1. **No avatar uploaded** — Show initial fallback (first 2 letters of name).
2. **Very long name** — Truncate at 30 chars in header. Full name in tooltip.
3. **Multiple workspaces** — Show active workspace. Click changes workspace.
4. **Account locked** — If user's account is locked, show warning banner.
5. **Pending email change** — Show "Verification pending" with resend option.
6. **Profile edit conflict** — If admin changes profile simultaneously, show conflict resolution.
7. **Delete account with active subscriptions** — Warn "You have active subscriptions. Cancel first."
8. **Two-Factor enrollment** — If enabling 2FA, show QR code setup flow.
9. **Read-only profile (SSO-managed)** — Some fields locked (name, email from SSO). Show "Managed by SSO."
10. **Activity stats reset** — Show "Stats reset at beginning of period." Context in tooltip.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `edit_profile_clicked` | Edit button |
| `profile_updated` | Save changes |
| `change_password_clicked` | Change password link |
| `password_changed` | Password update success |
| `two_factor_toggled` | 2FA switch |
| `delete_account_clicked` | Delete button |
| `delete_account_confirmed` | Confirmation submit |
| `avatar_clicked` | Avatar click (view full size) |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Profile view duration | Screen open to navigate away |
| Edit rate | Percentage viewing vs editing |
| Most edited field | Field name + count |
| 2FA enablement rate | Percentage enabling |
| Account deletion rate | Per period |

---

## Future Improvements

1. Profile badges — Achievement badges (1000 scans, 1 year member)
2. Activity heatmap — GitHub-style contribution calendar
3. Public profile toggle — Share stats with team
4. Notification preferences per channel (email, push, in-app)
5. Language preference selector
6. Theme preference (Light/Dark/System)
7. Keyboard shortcut preferences
