# 01 — Auth Login

## Overview

**Purpose:** Authenticate user identity and grant access to the Atlas AI platform.

**Business Goal:** Secure entry point. Minimize friction for legitimate users. Block unauthorized access. Collect authentication telemetry.

**User Goal:** Sign in quickly with email/password or SSO. Reset password if forgotten.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | App launch (no session), Session expired, 401 redirect, Logout, Deep link (auth-required) | Login form |
| **To** | Dashboard (role-based), Onboarding (first login), Permission denied screen | Post-auth destination |

---

## User Story

> As a user, I want to sign in to Atlas AI so that I can access my workspace and continue my work.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   Logo + App Name (centered, 24px)                  │    │
│  │   ─────────────────────────────────                 │    │
│  │                                                     │    │
│  │   Email _________________________                   │    │
│  │                                                     │    │
│  │   Password _______________________ [👁]             │    │
│  │                                                     │    │
│  │   [✓] Remember me          Forgot password?         │    │
│  │                                                     │    │
│  │   ┌─────────────────────────────────────┐           │    │
│  │   │          Sign In                     │           │    │
│  │   └─────────────────────────────────────┘           │    │
│  │                                                     │    │
│  │   ──────────── or continue with ────────────         │    │
│  │                                                     │    │
│  │   [Google] [Microsoft] [SSO]                        │    │
│  │                                                     │    │
│  │   Don't have an account? Sign up                    │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Footer: © Atlas AI | Terms | Privacy                       │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Logo + App Name (centered, 40px from top)
Form:      Email + Password + Remember + Forgot (max-width 400px, centered)
Actions:   Sign In button (primary, full width)
Divider:   OR divider with "or continue with"
SSO:       Social/SSO buttons
Footer:    Sign up link + legal (bottom, text-tertiary)
```

---

## Components

| Component | Usage | Variant/Size | States |
|-----------|-------|-------------|--------|
| Input | Email field | outlined, md | Default, Hover, Focus, Disabled, Error |
| Input | Password field | outlined, md | Default, Hover, Focus, Disabled, Error, with toggle visibility |
| Button | Sign In | primary, lg, full-width | Default, Hover, Active, Focus, Loading, Disabled |
| Button | Google SSO | outline, md, full-width | Default, Hover, Active, Focus |
| Button | Microsoft SSO | outline, md, full-width | Default, Hover, Active, Focus |
| Button | SSO | ghost, md, full-width | Default, Hover, Active, Focus |
| Checkbox | Remember me | md | Unchecked, Checked, Focus |
| Link | Forgot password | default | Default, Hover, Focus |
| Link | Sign up | default | Default, Hover, Focus |
| Spinner | Loading state | 20px | Rotating |
| Alert | Error banner | error | Visible on auth failure |

---

## Information Hierarchy

```
Primary:   Sign In button, Email input, Password input
Secondary: SSO options, Remember me, Forgot password
Tertiary:  Sign up link, Footer links, Logo
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Clean form. Cursor in email field. Submit disabled until both fields filled. |
| **Loading** | Button shows spinner + "Signing in...". All inputs disabled. SSO buttons disabled. |
| **Success** | Redirect to dashboard or post-auth destination. Toast "Welcome back, {name}". |
| **Error** | Inline error on invalid field. Banner "Invalid email or password" for mismatch. Banner "Network error" for connectivity. |
| **Offline** | Banner "No internet connection. Sign-in requires connectivity." Submit disabled. |
| **Empty** | Not applicable (form fields are always present). |
| **No permissions** | 403 redirect to Permission Denied screen after auth. |
| **No data** | Not applicable. |
| **Syncing** | Not applicable. |
| **Updating** | Not applicable. |
| **Read only** | Not applicable. |

---

## Responsive

| Platform | Layout Changes |
|----------|---------------|
| **Desktop (≥1024px)** | Card centered. Max width 480px. Background may show brand illustration on left. |
| **Tablet (768–1024px)** | Full-screen form. No illustration. Max width 400px centered. |
| **Mobile (<768px)** | Full-screen form. 16px padding. Keyboard pushes form up. Touch targets 44pt minimum. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `form` role, `aria-label="Sign in form"`, `aria-required="true"` on email/password, `aria-describedby` for errors, `aria-live="polite"` for error banner |
| **Focus order** | Email → Password → Remember → Sign In → Google → Microsoft → SSO → Forgot → Sign up |
| **Screen reader** | Announce errors on validation. Announce "Loading" state. Announce success redirect. |
| **Contrast** | All text ≥ 4.5:1 against background. Focus ring ≥ 3:1. Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through fields. Enter submits. Esc clears focus. |
| **Touch targets** | All interactive elements ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration | Easing |
|-----------|------|----------|--------|
| **Enter** | Form slides up + fade in | 300ms | ease-out |
| **Exit** | Fade out + scale | 200ms | ease-in |
| **Transitions** | Redirect to dashboard (slide left) | 250ms | ease-out |
| **Micro interactions** | Input focus border color shift, button press scale(0.97), password toggle icon swap | 150ms | ease-out |

---

## Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Required, valid email format (RFC 5322) | "Enter a valid email address" |
| Password | Required, min 1 character | "Enter your password" |
| Rate limit | Max 5 attempts per minute | "Too many attempts. Try again in {time}." |

---

## Edge Cases

1. **Empty email + submit** — Show inline error "Email is required". Focus email field.
2. **Invalid email format** — Show inline error "Enter a valid email address".
3. **Wrong password** — Banner "Invalid email or password". Increment attempt counter.
4. **Account locked** — Banner "Account locked. Contact your administrator. [Learn more]".
5. **Session already active** — Redirect to dashboard. Toast "Already signed in".
6. **Expired password** — Redirect to password reset flow with notice "Your password has expired. Please reset it."
7. **SSO provider timeout** — Banner "SSO provider not responding. Try again or use email sign-in."
8. **Network disconnect during submit** — Banner "Connection lost. Check your connection and try again."
9. **Browser autofill interference** — Form detects autofill, validates on submit.
10. **Keyboard dismissal on mobile** — Form remains visible. No content hidden behind keyboard.
11. **Deep link with redirect** — After auth, redirect to original deep link target.
12. **Multiple rapid submits** — Button disabled after first click. Prevent duplicate requests.

---

## Analytics Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `screen_viewed` | `{screen: "auth_login"}` | Screen mount |
| `email_entered` | `{has_value: bool}` | Email field blur (first time) |
| `sign_in_attempted` | `{method: "email"|"sso"}` | Submit click |
| `sign_in_succeeded` | `{method, user_id, role}` | Auth success |
| `sign_in_failed` | `{method, reason, attempt_count}` | Auth failure |
| `password_reset_requested` | — | "Forgot password?" click |
| `sign_up_clicked` | — | "Sign up" link click |
| `sso_clicked` | `{provider: "google"|"microsoft"|"sso"}` | SSO button click |
| `remember_me_toggled` | `{value: bool}` | Checkbox change |
| `session_expired_redirect` | — | 401 redirect to login |
| `error_displayed` | `{error_type, message}` | Error banner shown |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Screen load time | `performance.now()` from mount to interactive |
| Sign-in duration | Time from submit to success/failure response |
| SSO vs email ratio | Percentage of users per method |
| Login attempt count | Number of attempts before success |
| Average session time | Time from login to logout/expiry |

---

## Future Improvements

1. **Biometric authentication** — Face ID / Touch ID for mobile app
2. **Magic link** — Passwordless email link sign-in
3. **Passkeys** — WebAuthn support for passwordless auth
4. **Multi-factor authentication** — TOTP or SMS code after password
5. **Adaptive MFA** — Step up auth based on risk score (new device, new location)
6. **QR code login** — Scan QR with mobile app to authenticate web session
7. **Tenant detection** — Auto-detect workspace/tenant from email domain
