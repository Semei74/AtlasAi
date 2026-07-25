# 16 — Issue Material

## Overview

**Purpose:** Record the issuance of materials from inventory to a task or user.

**Business Goal:** Track material consumption. Maintain accurate inventory levels. Generate audit trail.

**User Goal:** I want to record that I'm taking materials from stock so that inventory is updated.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Dashboard quick action, Material Card "Issue", Sidebar action, QR scan result | Issue form |
| **To** | Success confirmation → Movement History, Material Card | Post-issue |

---

## User Story

> As a mechanic, I want to issue materials from inventory to my task so that the system tracks what I've used.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (minimal)                              Close ×     │
├─────────────────────────────────────────────────────────────┤
│  Issue Material (20px SemiBold)                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Material *    ▾ [Search or scan material]    [📷]   │    │
│  │  └── Nut M12 — In stock: 245 units ─────────────┘    │    │
│  │                                                     │    │
│  │  Quantity *    ___12___    Unit: piece              │    │
│  │                                                     │    │
│  │  Issue To *    ▾ Select task...                     │    │
│  │                ─ or ─                               │    │
│  │                ▾ Select user...                     │    │
│  │                                                     │    │
│  │  Notes         Optional reason...                   │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────┐            │    │
│  │  │         Issue Stock                 │            │    │
│  │  └─────────────────────────────────────┘            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Minimal bar with Close
Form:      Material selector, Quantity, Issue To (task/user), Notes
Actions:   Issue button (primary, full-width)
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Combobox | Material selector | md, with search |
| Button | QR scan | ghost, icon-only |
| Input (number) | Quantity | outlined, md |
| Select | Issue To (Task) | md |
| Select | Issue To (User) | md |
| Textarea | Notes | outlined |
| Button | Issue Stock | primary, lg, full-width |
| Alert | Insufficient stock | warning |

---

## Information Hierarchy

```
Primary:   Material, Quantity, Issue To, Issue button
Secondary: QR scan, Notes
Tertiary:  Unit display, Stock remaining
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Clean form. Issue disabled until required fields filled. |
| **Loading** | Button spinner + "Issuing...". Fields disabled. |
| **Success** | Toast "12x Nut M12 issued to Task A." Option to "Issue another" or "Done". |
| **Warning** | Warning if quantity > available stock. Block submission. |
| **Error** | Inline errors. Banner for server failure. |
| **Offline** | Banner "Issue will be synced when online." Queue action. |
| **Empty** | Not applicable. |
| **No permissions** | Form disabled. "You don't have permission to issue materials." |
| **No data** | Not applicable. |
| **Syncing** | Queue indicator. |
| **Updating** | Optimistic stock update. |
| **Read only** | Not applicable. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Card centered, max 480px. Sidebar context preserved. |
| **Tablet** | Full-screen form, centered. |
| **Mobile** | Full-screen form. Sticky issue button at bottom. Keyboard avoids overlap. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-required` on Material, Quantity, Issue To. `aria-live` on stock warning. |
| **Focus order** | Material → Quantity → Issue To → Notes → Issue |
| **Screen reader** | Announce stock level when material selected. Announce success. |
| **Contrast** | Per COLOR_SYSTEM.md. Insufficient stock warning meets WCAG. |
| **Keyboard** | Tab through fields. Enter submits. Esc closes. |
| **Touch targets** | ≥ 44×44pt. QR scan button ≥ 48pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Slide up from bottom (modal-style) | 300ms |
| Material selected | Stock info appears with fade | 200ms |
| Error | Shake + highlight | 200ms |
| Success | Button checkmark | 400ms |

---

## Validation

| Field | Rule | Error |
|-------|------|-------|
| Material | Required, must exist and be in stock | "Select a material" / "Material not found" |
| Quantity | Required, > 0, ≤ available stock, integer | "Enter a valid quantity" / "Not enough stock" |
| Issue To | Required (task or user) | "Select a task or user" |
| Notes | Max 500 chars | "Notes too long" |

---

## Edge Cases

1. **Insufficient stock** — Warning "Only 10 units available. Requested: 12." Block issue.
2. **Material not found** — Combobox shows "No results. Try a different search or scan QR."
3. **QR scan prefills** — Scanning QR automatically selects material. Bypasses combobox.
4. **Issue to task vs user** — Radio toggle between task and user selection. Task is default.
5. **Negative quantity entered** — Prevent with min=1. Show "Quantity must be at least 1."
6. **Rapid multiple issues** — Each issue creates separate record. No batching.
7. **Partial issue allowed** — Option to issue available stock and backorder the rest.
8. **Issue confirmation** — Show summary before final submit: "12x Nut M12 → Task A".
9. **Network failure during issue** — Save to queue. Show "Queued for sync" with timestamp.
10. **Issue with zero stock warning override** — Manager role can override insufficient stock with reason.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `material_selected` | `{material_id}` |
| `qr_scanned` | QR scan button |
| `quantity_entered` | Quantity blur |
| `issue_submitted` | Issue click |
| `issue_succeeded` | `{material_id, quantity, task_id}` |
| `issue_failed` | `{reason}` |
| `insufficient_stock_warning` | Quantity > stock |
| `issue_another` | "Issue another" after success |
| `cancelled` | Close without issue |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Issue completion rate | Started → Completed |
| Average issue quantity | Quantity distribution |
| Time to issue | Screen open → submit |
| QR scan usage | Percentage using QR vs search |
| Most issued material | Material rank |

---

## Future Improvements

1. Batch issue — Issue multiple materials in one transaction
2. Recurring issue — Schedule regular material issues
3. Voice issue — "Issue 5 bolts to Task A" via voice
4. Issue template — Save common issue combinations
5. Material suggestion — "Based on Task A, you might need: Nut M12, Bolt M8"
6. Auto-issue from task — Pre-fill materials defined in task requirements
7. NFC tag scan — Tap phone to NFC tag for material selection
