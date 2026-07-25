# 04 — Auth Verify OTP

## Overview

**Purpose:** Verify user identity via one-time password (email or authenticator).

**Business Goal:** Prevent unauthorized account access. Verify email ownership. Enable step-up authentication.

**User Goal:** Enter the code I received to prove my identity and proceed.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Registration (email verification), Password reset (OTP step), MFA challenge, Login with new device | OTP input |
| **To** | Onboarding flow, Password reset form, Dashboard | Post-verification |

---

## User Story

> As a user verifying my identity, I want to enter the code I received so that I can proceed with my action.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   ← Back                                            │    │
│  │                                                     │    │
│  │   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │    │
│  │   │   _  │  │   _  │  │   _  │  │   _  │  │   _  │ │    │
│  │   └──────┘  └──────┘  └──────┘  └──────┘  └──────┘ │    │
│  │   ┌──────┐                                           │    │
│  │   │   _  │                                           │    │
│  │   └──────┘                                           │    │
│  │                                                     │    │
│  │   Enter the 6-digit code sent to {email/phone}       │    │
│  │                                                     │    │
│  │   Didn't receive it? [Resend in 0:45]               │    │
│  │                                                     │    │
│  │   ┌─────────────────────────────────────┐           │    │
│  │   │          Verify Code                │           │    │
│  │   └─────────────────────────────────────┘           │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Back button + Title
Code:      6 OTP input boxes (inline, centered)
Description: Helper text with masked destination
Actions:   Resend link (with cooldown) + Verify button
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Button | Back | ghost, icon-only, sm |
| OTP Input | 6-digit code | 6 × 48×48px, 8px gap |
| Button | Verify Code | primary, lg, full-width |
| Button | Resend | link, sm |
| Toast | Error | error |
| Progress | Timer | Countdown on resend |

---

## Information Hierarchy

```
Primary:   OTP input boxes, Verify button
Secondary: Resend link, timer
Tertiary:  Description, Back button
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Empty OTP boxes. First box focused. Verify disabled until 6 digits entered. |
| **Loading** | Verify button spinner + "Verifying...". OTP inputs disabled. |
| **Success** | Toast "Verified!" Redirect to destination. |
| **Error** | Inline error "Invalid code. Try again." Shake animation on boxes. Clear all. |
| **Expired** | Error "Code expired. Request a new one." Clear boxes. |
| **Offline** | Banner "Verification requires internet." |
| **Empty** | Not applicable. |
| **No permissions** | Not applicable. |
| **No data** | Not applicable. |
| **Syncing** | Not applicable. |
| **Updating** | Not applicable. |
| **Read only** | Not applicable. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Centered card, max 400px. 6 boxes inline. |
| **Tablet** | Max 400px centered. 6 boxes inline. |
| **Mobile** | Full width. 6 boxes inline (compact if needed). 16px padding. Keyboard shows number pad. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label="Verification code input {position} of 6"` per box. `aria-live="polite"` on error. `aria-describedby` on timer. |
| **Focus order** | Box 1 → 2 → 3 → 4 → 5 → 6 → Verify |
| **Screen reader** | Announce "Enter digit {N} of 6". Announce auto-advance. Announce code complete. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Auto-advance to next box on digit entry. Backspace goes to previous. Enter submits when complete. |
| **Touch targets** | Each box ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Inputs slide up staggered (50ms each) | 300ms |
| Auto-advance | Focus shifts to next box | 100ms |
| Error | Shake all boxes | 400ms |
| Success | Boxes turn green sequentially | 300ms total |
| Resend timer | Countdown number update | 1s interval |

---

## Validation

| Field | Rule | Error |
|-------|------|-------|
| Code | Required, exactly 6 digits | "Enter the 6-digit code" |
| Code | Numeric only | Non-digit input ignored |
| Code expiry | Within 10 minutes | "Code expired. Request a new one." |
| Attempt limit | Max 5 attempts | "Too many attempts. Request a new code." |

---

## Edge Cases

1. **Auto-fill from SMS** — On mobile, detect OTP in SMS and auto-fill boxes (Android SMS Retriever API / iOS auto-fill).
2. **Paste full code** — User can paste "123456" into first box. Auto-fills all 6 boxes.
3. **Non-numeric paste** — Strip non-digits from paste. If result is 6 digits, fill boxes.
4. **Timer expiry** — When resend timer hits 0, enable resend link. Show "Code expired" if user hasn't submitted.
5. **Multiple resends** — Each resend resets the 10min expiry. Track total resends (max 5).
6. **Navigation away** — If user navigates back, code remains but timer continues. Resend if expired.
7. **Wrong code multiple times** — After 5 attempts, invalidate code. Show "Too many attempts. Request a new code."
8. **App backgrounding (mobile)** — Timer continues in background. On return, check expiry.
9. **Switch apps to check email** — User can switch to email app. On return, code entered can be pasted.
10. **Device does not support auto-fill** — Manual entry. Show hint "Check your email/messages for the code."

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `otp_entered` | Each digit entry |
| `otp_completed` | 6 digits entered |
| `otp_verified` | Successful verification |
| `otp_failed` | Invalid code (attempt count) |
| `otp_expired` | Code expiry |
| `resend_requested` | Resend clicked |
| `back_clicked` | Back navigation |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Code entry time | Screen open to submit |
| Auto-fill success rate | SMS auto-fill vs manual entry |
| Average attempts | Codes entered per verification |
| Resend rate | Percentage requiring resend |
| Expiry rate | Percentage expired before submission |

---

## Future Improvements

1. QR code scan for authenticator apps (TOTP)
2. Push notification approval (tap "Yes" on phone)
3. Voice call with spoken code (for accessibility)
4. Security key (WebAuthn/FIDO2) as MFA method
5. Trusted device flagging (skip MFA for 30 days)
