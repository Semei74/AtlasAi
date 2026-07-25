# 37 — Permission Requests

## Overview

**Purpose:** Handle permission requests from the app (camera, notifications, storage, location).

**Business Goal:** Request permissions contextually. Minimize denial rates. Provide fallback for denied permissions.

**User Goal:** I want to understand why a permission is needed and grant or deny it.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | QR scanner (camera), Notifications (push), File upload (storage), QR/GPS (location) | Permission prompt |
| **To** | Feature (granted), Settings/fallback (denied) | Post-permission |

---

## User Story

> As a user, I want to understand why Atlas AI needs each permission so that I can make an informed decision.

---

## Layout

### System Permission Dialog

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ┌──────┐                                           │    │
│  │  │Icon  │  "Atlas AI" Would Like to Access          │    │
│  │  │48px  │  the Camera                               │    │
│  │  └──────┘                                           │    │
│  │                                                     │    │
│  │  Atlas AI uses the camera to scan QR codes          │    │
│  │  on materials for quick identification.             │    │
│  │                                                     │    │
│  │            [Don't Allow]    [Allow]                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Custom Permission Prompt (for re-request)

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ┌──────┐                                           │    │
│  │  │ 48px │  Camera Access Required (18px SemiBold)   │    │
│  │  │ icon │                                           │    │
│  │  └──────┘                                           │    │
│  │                                                     │    │
│  │  QR scanning needs camera access to scan            │    │
│  │  material QR codes.                                │    │
│  │                                                     │    │
│  │  You previously denied this permission.             │    │
│  │                                                     │    │
│  │  [Not Now] [Open Settings]                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Permission Types

| Permission | Feature | Rationale | System Prompt | Custom Prompt |
|------------|---------|-----------|---------------|---------------|
| **Camera** | QR Scanner | Scan QR codes on materials | "Camera Access" | "Camera access is needed to scan QR codes. Without it, you'll need to type SKU manually." |
| **Notifications** | Alerts | Low stock, task assignments | "Send Notifications" | "Get notified about low stock, task assignments, and important updates." |
| **Storage/Photos** | File Upload | Upload material photos | "Photo Library Access" | "Access photos to upload material images and attach files." |
| **Location** | (Future) | Warehouse navigation, geo-tagging | "Location Access" | "Location helps tag materials to specific warehouse areas." |

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Dialog | Permission prompt | dialog |
| Button | Allow/Grant | primary, md |
| Button | Don't Allow/Deny | ghost, md |
| Button | Open Settings | outline, md |
| Icon | Permission icon | 48px |

---

## Information Hierarchy

```
Primary:   Permission name, Grant button
Secondary: Rationale explanation
Tertiary:  Don't Allow, Settings link
```

---

## States

| State | Behavior |
|-------|----------|
| **First request** | System dialog (native). Custom rationale shown before system dialog if available. |
| **Denied (can re-request)** | Custom dialog explaining why. "Open Settings" button. |
| **Denied (permanent)** | "Permission denied. Enable in Settings." with direct settings link. |
| **Granted** | Proceed to feature. No dialog shown. |
| **Not applicable** | Feature unavailable on device (no camera on desktop). Show alternative. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Centered dialog. Camera permission may not apply. |
| **Tablet** | Centered dialog. |
| **Mobile** | Full-screen overlay or native OS dialog. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `role="alertdialog"`. `aria-describedby` for rationale. |
| **Focus order** | Rationale → Grant → Deny → Settings |
| **Screen reader** | Announce permission request. Announce rationale. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab to Allow/Deny. Enter to select. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Dialog enter | Slide up | 300ms |
| Denied state | Gentle shake | 200ms |

---

## Validation

N/A.

---

## Edge Cases

1. **Permission permanently denied** — "Open Settings" deep link to app permission screen.
2. **Permission not available** — Device has no camera. Show "QR Scanner is not available on this device."
3. **Permission request during feature** — Request at point of use, not at app launch.
4. **Multiple permissions** — Request one at a time. Don't batch.
5. **Permission revoked during use** — Show "Permission lost" toast. Degrade gracefully.
6. **Child/restricted profiles** — Some permissions may be locked by device policy.
7. **After app update** — Permissions persist. May need re-grant for new features.
8. **Permission denial tracking** — Track denied permissions. Don't re-request immediately.
9. **OS-level permission changes** — Handle return from settings (app becomes active).
10. **Temporary permissions (iOS)** — Handle "Allow Once" vs "Allow While Using."

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `permission_requested` | `{permission}` |
| `permission_granted` | `{permission}` |
| `permission_denied` | `{permission}` |
| `permission_settings_opened` | Settings deep link |
| `permission_not_available` | Device doesn't support |
| `feature_without_permission` | User attempts feature without permission |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Grant rate | Per permission type |
| Denial rate | Per permission type |
| Settings recovery rate | Users who go to settings and grant |
| Re-request timing | Days between first denial and re-request |
| Feature usage without permission | Users using fallback |

---

## Future Improvements

1. Gradual permission requests — Request at natural points, not all at launch
2. Permission education screen — Animated explanation before system dialog
3. Permission status indicator — Show in Settings which permissions are granted
4. Permission audit — Regularly remind users of granted permissions
5. Temporary grants — "Just this once" option
