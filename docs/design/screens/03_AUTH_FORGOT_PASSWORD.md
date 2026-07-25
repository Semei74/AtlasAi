# 03 — Auth Forgot Password

## Overview

**Purpose:** Allow users to reset their password when forgotten.

**Business Goal:** Reduce support tickets. Maintain security via email verification. Minimize account lockout friction.

**User Goal:** Regain access to account quickly and securely.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Login screen "Forgot password?" link | Email input step |
| **To** | Email sent confirmation → Verify OTP → Reset password → Login | Post-reset |

---

## User Story

> As a user who forgot my password, I want to reset it so that I can regain access to my account.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   ← Back to Login                                    │    │
│  │                                                     │    │
│  │   ┌──────┐                                          │    │
│  │   │ 48px │  Icon (lock, neutral-300)                │    │
│  │   └──────┘                                          │    │
│  │                                                     │    │
│  │   Reset Password (24px SemiBold)                    │    │
│  │   Enter your email and we'll send you a reset link.  │    │
│  │                                                     │    │
│  │   Email ________________________                    │    │
│  │                                                     │    │
│  │   ┌─────────────────────────────────────┐           │    │
│  │   │       Send Reset Link               │           │    │
│  │   └─────────────────────────────────────┘           │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Success State ─────────────────────────────────────┐    │
│  │   ┌──────┐                                          │    │
│  │   │ 48px │  Icon (check-circle, success)            │    │
│  │   └──────┘                                          │    │
│  │                                                     │    │
│  │   Check your email (20px SemiBold)                  │    │
│  │   We sent a reset link to {email}.                  │    │
│  │   Didn't receive it? [Resend]                       │    │
│  │                                                     │    │
│  │   ┌─────────────────────────────────────┐           │    │
│  │   │       Back to Login                 │           │    │
│  │   └─────────────────────────────────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Back link
Icon:      Lock icon (centered)
Title:     Reset Password (centered)
Form:      Email input + Submit button
Success:   Email sent confirmation (replaces form on success)
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Button | Back | ghost, sm |
| Input | Email | outlined, md |
| Button | Send Reset Link | primary, lg, full-width |
| Button | Back to Login | outline, md, full-width |
| Button | Resend | link, sm |
| Icon | Lock | 48px, neutral-300 |
| Icon | Check Circle | 48px, success |

---

## Information Hierarchy

```
Primary:   Email input, Send Reset Link button
Secondary: Back link, Resend link
Tertiary:  Icon, description text
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Clean email input. Submit enabled when email valid. |
| **Loading** | Button spinner + "Sending...". Input disabled. |
| **Success** | Form replaced by success state. "Check your email" message visible. Resend link available after 60s. |
| **Error** | Inline error on email (not found). Banner for rate limit. |
| **Offline** | Banner "Requires internet connection." Submit disabled. |
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
| **Desktop** | Centered card, max 400px. |
| **Tablet** | Max 400px centered. |
| **Mobile** | Full width, 16px padding. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-live="polite"` on success/error. `aria-label` on icon-only buttons. |
| **Focus order** | Email → Send → Back to Login |
| **Screen reader** | Announce state transitions (success/error). |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Enter submits. Tab navigates. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Fade in + slide up | 300ms |
| Success transition | Form fades out, success fades in (cross-fade) | 300ms |
| Error | Shake input | 200ms |

---

## Validation

| Field | Rule | Error |
|-------|------|-------|
| Email | Required, valid format | "Enter a valid email address" |
| Email existence | Must exist in system | "No account found with this email" |
| Rate limit | Max 3 requests per 15 min | "Too many requests. Try again later." |

---

## Edge Cases

1. **Email not found** — Inline error "No account found with this email" (don't reveal if email exists — return generic success, but log internally).
2. **Rate limited** — Banner "Too many reset requests. Try again in 15 minutes."
3. **Resend cooldown** — Resend link disabled for 60s. Countdown shown.
4. **Link expired** — If user clicks expired reset link, show "Link expired. Request a new one." redirect to forgot password.
5. **Already reset** — If password already changed, link is invalid. Show "This link has already been used."
6. **Multiple tabs** — If user opens forgot password in multiple tabs, each request resets the cooldown.
7. **Network failure during send** — Inline error "Could not send email. Check your connection."
8. **Account locked** — Even after password reset, if account is locked, show "Account is locked. Contact administrator."
9. **Email in spam folder** — Hint "Can't find the email? Check your spam folder."
10. **Non-existent email in locked state** — Always return success to prevent email enumeration. Log internally.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `reset_requested` | Submit click |
| `reset_sent` | Email sent successfully |
| `reset_failed` | Send failure |
| `resend_clicked` | Resend link click |
| `back_to_login` | Back link click |
| `rate_limited` | Rate limit hit |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Reset request rate | Per user / per IP |
| Email delivery time | Server to SMTP acknowledgment |
| Reset completion rate | Requests → successful resets |
| Support ticket deflection | Percentage of users who reset vs submit ticket |

---

## Future Improvements

1. Security questions as alternative verification
2. Phone-based reset via SMS
3. Admin-initiated password reset (for managed accounts)
4. Passwordless reset via authenticator app
5. Expiring reset link with configurable duration
