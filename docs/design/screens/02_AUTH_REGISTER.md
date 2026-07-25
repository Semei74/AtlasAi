# 02 — Auth Register

## Overview

**Purpose:** Create a new user account in Atlas AI.

**Business Goal:** Convert visitors into active users. Capture essential registration data. Verify identity via email.

**User Goal:** Create an account quickly with minimal friction. Get started with the platform.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Login screen "Sign up" link, Invitation email link, Public registration page | Registration form |
| **To** | Email verification (OTP), Onboarding flow, Dashboard | Post-registration |

---

## User Story

> As a new user, I want to create an account so that I can start using Atlas AI.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   Back arrow | Create Account (18px SemiBold)       │    │
│  │   ─────────────────────────────────                 │    │
│  │                                                     │    │
│  │   Full Name _________________________               │    │
│  │                                                     │    │
│  │   Work Email _______________________                │    │
│  │                                                     │    │
│  │   Password ___________________________ [👁]         │    │
│  │   └── Strength: ●●●○○○ ───────────────┘            │    │
│  │                                                     │    │
│  │   Confirm Password ___________________              │    │
│  │                                                     │    │
│  │   [ ] I agree to Terms of Service and Privacy Policy│    │
│  │                                                     │    │
│  │   ┌─────────────────────────────────────┐           │    │
│  │   │          Create Account              │           │    │
│  │   └─────────────────────────────────────┘           │    │
│  │                                                     │    │
│  │   Already have an account? Sign in                  │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Back button + Title
Form:      Name, Email, Password (with strength), Confirm, Terms
Actions:   Submit button (disabled until valid)
Footer:    Sign in link
```

---

## Components

| Component | Usage | Variant/Size | States |
|-----------|-------|-------------|--------|
| Button | Back | ghost, icon-only, sm | Default, Hover, Focus |
| Input | Full Name | outlined, md | Default, Hover, Focus, Error, Success |
| Input | Work Email | outlined, md | Default, Hover, Focus, Error, Success |
| Input | Password | outlined, md | Default, Hover, Focus, Error, Success, with toggle |
| Input | Confirm Password | outlined, md | Default, Hover, Focus, Error, Success |
| Progress | Password strength | — | Weak (25%), Medium (50%), Strong (75%), Very Strong (100%) |
| Checkbox | Terms agreement | md | Unchecked, Checked, Focus, Error |
| Button | Create Account | primary, lg, full-width | Default, Hover, Active, Focus, Loading, Disabled |
| Alert | Error | error | Visible on registration failure |
| Toast | Success | success | "Account created! Verify your email." |

---

## Information Hierarchy

```
Primary:   Create Account button, Email, Password
Secondary: Name, Confirm Password, Password strength
Tertiary:  Terms checkbox, Sign in link, Back button
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Clean form. Submit disabled until all valid. |
| **Loading** | Button spinner + "Creating account...". All inputs disabled. |
| **Success** | Toast "Account created! Check your email to verify." Redirect to Verify OTP or onboarding. |
| **Error** | Inline errors on fields. Banner for server errors (email taken, network). |
| **Offline** | Banner "Registration requires internet." Submit disabled. |
| **Empty** | Not applicable. |
| **No permissions** | Not applicable (public page). |
| **No data** | Not applicable. |
| **Syncing** | Not applicable. |
| **Updating** | Not applicable. |
| **Read only** | Not applicable. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Centered card, max 480px. |
| **Tablet** | Full width, max 400px centered. |
| **Mobile** | Full width, 16px padding. Password strength below field. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-required` on all fields. `aria-invalid` on error. `aria-describedby` for strength and errors. |
| **Focus order** | Name → Email → Password → Confirm → Terms → Submit → Sign in |
| **Screen reader** | Announce password strength changes. Announce field errors on blur. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Enter submits. Tab through fields. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Fade + slide up | 300ms ease-out |
| Password strength | Bar fill transition | 200ms ease-out |
| Error show | Shake input + fade in message | 200ms |

---

## Validation

| Field | Rule | Error |
|-------|------|-------|
| Full Name | Required, min 2 chars, max 100 | "Enter your full name" |
| Email | Required, valid format, unique | "Enter a valid email" / "Email already registered" |
| Password | Min 8 chars, 1 uppercase, 1 number | "Password must be at least 8 characters with 1 uppercase letter and 1 number" |
| Confirm | Must match password | "Passwords must match" |
| Terms | Must be checked | "You must agree to the terms" |

---

## Edge Cases

1. **Email already registered** — Inline error "An account with this email already exists. Sign in instead."
2. **Weak password** — Strength bar shows "Weak". Button enabled but strength indicator warns.
3. **Password paste mismatch** — On blur after paste, validate match immediately.
4. **Name with special characters** — Allow Unicode. Strip HTML. Max 100 chars.
5. **Bot submission** — Honeypot field + rate limiting (3 attempts per IP per minute).
6. **Invitation code required** — Field appears if registration requires code. Validate code.
7. **Domain-restricted registration** — If email domain not in allowed list, show "Use your work email. Contact admin for access."
8. **Browser back after submit** — Prevent resubmission. Show "Account already being created."
9. **Terms link clicked** — Open in new tab or modal. Don't navigate away from form.
10. **Network timeout during validation** — Fall back to server validation on submit. Show error.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `registration_started` | First field interaction |
| `password_entered` | Password field blur |
| `terms_accepted` | Terms checkbox check |
| `registration_attempted` | Submit click |
| `registration_succeeded` | Auth success |
| `registration_failed` | Auth failure (reason) |
| `sign_in_clicked` | "Sign in" link |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Registration completion rate | Started vs completed |
| Time to complete registration | Form open to submit |
| Password strength distribution | Weak/Medium/Strong/Very Strong % |
| Most common validation failure | Field + error type count |

---

## Future Improvements

1. Social/SSO registration with auto-fill profile data
2. Invitation-only registration with auto-accept
3. Workspace selection during registration
4. Role selection during registration (with admin approval)
5. Progressive profiling (collect more data after first use)
