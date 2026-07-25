# 17 — Return Material

## Overview

**Purpose:** Record the return of unused or surplus materials back to inventory.

**Business Goal:** Track returned stock. Maintain accurate inventory levels. Reduce waste.

**User Goal:** I want to return unused materials so that they become available for others.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Dashboard quick action, Material Card "Return", Sidebar action, QR scan result | Return form |
| **To** | Success confirmation → Material Card, Movement History | Post-return |

---

## User Story

> As a mechanic, I want to return unused materials from my task so that they're available for others and inventory is updated.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (minimal)                              Close ×     │
├─────────────────────────────────────────────────────────────┤
│  Return Material (20px SemiBold)                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Material *    ▾ [Search or scan material]    [📷]   │    │
│  │  └── Nut M12 — Currently issued: 50 units ──────┘   │    │
│  │                                                     │    │
│  │  Return Quantity *   ___4___    Unit: piece         │    │
│  │                                                     │    │
│  │  Condition *    ▾ Select condition...               │    │
│  │                  New | Used - Good | Damaged        │    │
│  │                                                     │    │
│  │  Return From *  ▾ Select task...                    │    │
│  │                ─ or ─                               │    │
│  │                ▾ Select user...                     │    │
│  │                                                     │    │
│  │  Notes         Reason for return...                 │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────┐            │    │
│  │  │         Return to Stock             │            │    │
│  │  └─────────────────────────────────────┘            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Minimal bar with Close
Form:      Material, Quantity, Condition, Return From, Notes
Actions:   Return button
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Combobox | Material selector | md, with search |
| Button | QR scan | ghost, icon-only |
| Input (number) | Return quantity | outlined, md |
| Select | Condition | md (New/Used-Good/Damaged) |
| Select | Return From (Task) | md |
| Select | Return From (User) | md |
| Textarea | Notes | outlined |
| Button | Return to Stock | primary, lg, full-width |

---

## Information Hierarchy

```
Primary:   Material, Quantity, Condition, Return button
Secondary: Return From, QR scan
Tertiary:  Notes
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Clean form. Return disabled until required fields filled. |
| **Loading** | Button spinner + "Returning...". |
| **Success** | Toast "4x Nut M12 returned to stock." Option to "Return another" or "Done". |
| **Warning** | Damaged condition warning "Damaged items may be quarantined." |
| **Error** | Inline errors. Server error banner. |
| **Offline** | Banner "Return queued for sync." |
| **Empty** | Not applicable. |
| **No permissions** | Form disabled. |
| **No data** | Not applicable. |
| **Syncing** | Queue indicator. |
| **Updating** | Optimistic update. |
| **Read only** | Not applicable. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Centered card, max 480px. |
| **Tablet** | Full-screen centered. |
| **Mobile** | Full-screen. Sticky return button. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-required` on required fields. `aria-live` on condition warning. |
| **Focus order** | Material → Quantity → Condition → Return From → Notes → Return |
| **Screen reader** | Announce condition options. Announce return confirmation. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through fields. Enter submits. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Slide up | 300ms |
| Success | Checkmark | 400ms |
| Error | Shake | 200ms |

---

## Validation

| Field | Rule |
|-------|------|
| Material | Required, must exist |
| Quantity | Required, > 0, ≤ issued quantity, integer |
| Condition | Required |
| Return From | Required (task or user) |
| Notes | Max 500 chars |

---

## Edge Cases

1. **Damaged material** — Show quarantine warning. Flag for inspection.
2. **Quantity exceeds issued amount** — Cap at total issued. Show max available.
3. **No task association** — Return from user directly without task.
4. **QR scan prefills** — Material auto-selected from QR.
5. **Partial return** — Support returning portion of issued quantity.
6. **Condition change during return** — If condition differs from issue, log as remark.
7. **Return without issue record** — Allow direct return (manual adjustment) with manager approval.
8. **Batch return** — Return multiple materials in one transaction.
9. **Non-returnable material** — Some materials flagged as non-returnable. Show warning.
10. **Return approval workflow** — Damaged/expired returns require manager approval.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `material_selected` | Material selector |
| `condition_selected` | Condition dropdown |
| `return_submitted` | Return click |
| `return_succeeded` | Success |
| `return_failed` | Failure (reason) |
| `qr_scanned` | QR scan |
| `return_another` | "Return another" |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Return rate | Issues vs Returns ratio |
| Condition distribution | New/Used/Damaged percentage |
| Average return quantity | Per transaction |
| Time to return | Screen open → submit |

---

## Future Improvements

1. Return quality inspection — Photo capture of returned items
2. Automated restocking — Return triggers bin location update
3. Return deadline enforcement — Material must be returned within N days
4. Damaged goods workflow — Auto-create disposal/disposal record
5. Return receipt — Printable return confirmation
