# 19 — QR Scanner

## Overview

**Purpose:** Scan QR codes on materials to quickly identify them and take actions.

**Business Goal:** Accelerate material identification. Reduce manual data entry errors.

**User Goal:** I want to scan a material's QR code to instantly see its details or take action.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Dashboard QR button, Issue/Return QR icon, Sidebar "Scanner" | Camera view |
| **To** | Material Card (if material found), Issue prefilled, Return prefilled | Post-scan action |

---

## User Story

> As a mechanic, I want to scan a material's QR code so that I can quickly find it and issue or return it without typing.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (minimal)                              Close ×     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │                                                     │    │
│  │                 Camera View                         │    │
│  │                                                     │    │
│  │            ┌──────────────────┐                     │    │
│  │            │   Scan QR code   │                     │    │
│  │            │   on material    │                     │    │
│  │            └──────────────────┘                     │    │
│  │                                                     │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Flash      │ │  Gallery    │ │  Manual     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─ Recent Scans ──────────────────────────────────────┐   │
│  │  NUT-M12 — Nut M12                    2 min ago     │   │
│  │  BOLT-M8 — Bolt M8                    15 min ago    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Camera:    Full-screen camera preview with scan target overlay
Controls:  Flash toggle, Gallery import, Manual entry
Scans:     Recent scan history (quick re-select)
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Button | Flash toggle | ghost, icon-only, lg |
| Button | Gallery import | ghost, icon-only, lg |
| Button | Manual entry | ghost, icon-only, lg |
| Card | Recent scan item | interactive |
| Badge | Scan status | success (found) / error (not found) |
| Alert | Permission denied | warning |

---

## Information Hierarchy

```
Primary:   Camera viewfinder, scan target
Secondary: Flash, Gallery, Manual controls
Tertiary:  Recent scans list
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Camera active. Viewfinder displayed. |
| **Scanning** | Viewfinder highlights QR code. Haptic feedback. |
| **Success** | Material identified. Show material name + actions. |
| **Error** | "QR code not recognized" with retry option. |
| **Offline** | Scan works offline if material cached. Show "Cached result." |
| **No permission** | "Camera access required." with settings link. |
| **Empty** | Recent scans empty: "No recent scans." |
| **No permissions** | Camera permission denied. Show manual entry fallback. |
| **No data** | QR not in database. Show "Unknown QR code" with option to create. |
| **Syncing** | Not applicable. |
| **Updating** | Not applicable. |
| **Read only** | Actions disabled after scan. View-only. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Camera view centered, max 480px wide. |
| **Tablet** | Full camera view. Controls overlaid. |
| **Mobile** | Full-screen camera view. Native camera experience. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label="QR Scanner"`. `aria-live` on scan results. |
| **Focus order** | Camera view → Controls → Recent scans |
| **Screen reader** | Announce scan result. Announce manual entry option. |
| **Contrast** | Overlay text uses white with shadow for readability. |
| **Keyboard** | Not applicable (camera-based). Manual entry fallback is keyboard accessible. |
| **Touch targets** | All controls ≥ 48pt. |

---

## Animations

| Animation | Type | Duration |
|----------|------|----------|
| Camera start | Fade in | 200ms |
| QR detected | Bounding box highlight | 100ms |
| Scan success | Checkmark overlay | 300ms |
| Scan error | Red flash overlay | 200ms |
| Result transition | Slide up action sheet | 250ms |

---

## Validation

N/A — Scanner processes QR data. Validation happens on resolved material.

---

## Edge Cases

1. **Camera permission denied** — Show "Camera access required. Enable in Settings." with link to system settings.
2. **QR code not recognized** — "Could not read QR code. Try adjusting distance or lighting."
3. **QR not in database** — "Unknown material. Create new material or enter SKU manually."
4. **Multiple QR in frame** — Focus on nearest/largest. Show count "2 codes detected."
5. **Poor lighting** — Auto-enable flash. Suggest moving to brighter area.
6. **Gallery image scan** — User can import photo from gallery for scanning.
7. **Manual SKU entry** — Text field fallback for entering SKU directly.
8. **Very long scan session** — Battery optimization. Show battery indicator in scanner.
9. **Concurrent scan actions** — After scan, navigate to action (Issue/Return/View) or stay in scanner.
10. **App backgrounding during scan** — Resume camera on return. Reinitialize if needed.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `scan_started` | Camera active |
| `scan_succeeded` | `{material_id, scan_type: "qr"\|"gallery"\|"manual"}` |
| `scan_failed` | `{reason}` |
| `flash_toggled` | Flash on/off |
| `gallery_opened` | Gallery import |
| `manual_entry` | Manual SKU entry |
| `action_after_scan` | `{action: "issue"\|"return"\|"view"}` |
| `recent_scan_tapped` | Recent scan re-select |
| `permission_denied` | Camera permission denied |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Scan success rate | Successful vs failed scans |
| Scan method distribution | QR vs Gallery vs Manual |
| Average scan time | Camera open → successful scan |
| Post-scan action distribution | Issue/Return/View percentages |
| Recent scan reuse | Tapping recent scan vs scanning new |

---

## Future Improvements

1. Barcode support — Linear barcodes (Code 128, EAN-13) alongside QR
2. Batch scanning — Scan multiple materials sequentially without exiting
3. Scan sound — Configurable beep on successful scan
4. AR overlay — Show material info overlaid on camera view (iOS ARKit/Android ARCore)
5. Scan history sync — Recent scans sync across devices
6. Offline QR database — Cache common materials for offline scanning
7. Custom QR labels — Generate and print QR labels from within the app
