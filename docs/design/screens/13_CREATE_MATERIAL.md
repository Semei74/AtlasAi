# 13 — Create Material

## Overview

**Purpose:** Add a new material to the inventory.

**Business Goal:** Expand inventory catalog with accurate data. Standardize material entry.

**User Goal:** I want to add a new material with all its details so it becomes available in the system.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Materials List "Create" button, Quick action "Add material", Empty state CTA | Creation form |
| **To** | Material Card (detail view of created material) | Post-creation |

---

## User Story

> As a warehouse manager, I want to add a new material to the system so that it can be tracked, issued, and managed.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  ← Materials  /  New Material (20px SemiBold)     │
│ Side   │  ┌─ Basic Information ─────────────────────────┐   │
│ Bar    │  │  Name *          ___________________        │   │
│        │  │  SKU *           ___________________        │   │
│        │  │  Category *      ▾ ________________        │   │
│        │  │  Unit *          ▾ piece / kg / liter      │   │
│        │  └────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Stock Details ─────────────────────────────┐   │
│        │  │  Initial Qty *   ___245____                 │   │
│        │  │  Min Stock *     ___20_____                 │   │
│        │  │  Location *      ▾ Warehouse A › Aisle 12  │   │
│        │  └────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Additional ───────────────────────────────┐   │
│        │  │  Supplier       ▾ FastenerCo               │   │
│        │  │  Description    ───────────────────────    │   │
│        │  │  Photo          [Upload Image]             │   │
│        │  └────────────────────────────────────────────┘   │
│        │                                                     │
│        │  [Cancel] [Save as Draft] [Create Material]        │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Breadcrumb + Title
Basic:     Name, SKU, Category, Unit (required fields)
Stock:     Initial quantity, Min stock, Location
Additional: Supplier, Description, Photo (optional)
Actions:   Cancel, Save draft, Create
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Input | Name, SKU | outlined, md |
| Select | Category, Unit, Location, Supplier | md |
| Input (number) | Initial Qty, Min Stock | outlined, md |
| Textarea | Description | outlined |
| File Upload | Photo | default |
| Button | Cancel | ghost, md |
| Button | Save as Draft | outline, md |
| Button | Create Material | primary, md |
| Breadcrumb | Navigation | default |
| Alert | Validation errors | error |

---

## Information Hierarchy

```
Primary:   Name, SKU, Quantity, Location, Create button
Secondary: Category, Unit, Min Stock
Tertiary:  Supplier, Description, Photo
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Clean form. Required fields marked with *. Create disabled until required fields valid. |
| **Loading** | Button spinner + "Creating...". All inputs disabled. |
| **Success** | Toast "Material created!" Redirect to Material Card. |
| **Error** | Inline validation errors. Banner for server errors. |
| **Offline** | Banner "Saving will be queued." Allow draft creation locally. |
| **Empty** | Not applicable. |
| **No permissions** | Create button hidden. "You don't have permission to create materials." |
| **No data** | Not applicable. |
| **Syncing** | "Saving..." indicator on draft. |
| **Updating** | Not applicable (creation, not update). |
| **Read only** | Form not accessible. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Two-column form (basic + stock side by side). 640px max width. |
| **Tablet** | Single column. Sections stack. |
| **Mobile** | Single column. Full width. Sticky "Create" button at bottom. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-required="true"` on required fields. `aria-invalid` on errors. `aria-describedby` for help text. |
| **Focus order** | Name → SKU → Category → Unit → Qty → Min → Location → Supplier → Description → Photo → Cancel → Draft → Create |
| **Screen reader** | Announce field errors on blur. Announce success. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through fields. Enter submits. Esc cancels (with confirmation if dirty). |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Sections slide in staggered | 300ms total |
| Error | Input shake | 200ms |
| Success | Button checkmark animation | 400ms |
| Redirect | Slide to detail | 250ms |

---

## Validation

| Field | Rule | Error |
|-------|------|-------|
| Name | Required, min 2 chars, max 100 | "Enter a material name" |
| SKU | Required, unique, alphanumeric + hyphens | "Enter a unique SKU" / "SKU already exists" |
| Category | Required | "Select a category" |
| Unit | Required | "Select a unit" |
| Initial Qty | Required, ≥ 0, integer | "Enter a valid quantity" |
| Min Stock | Required, ≥ 0, integer | "Enter minimum stock level" |
| Location | Required | "Select a location" |
| Supplier | Optional | — |
| Description | Max 500 chars | "Description is too long" |
| Photo | Max 5MB, JPEG/PNG | "File too large. Max 5MB." |

---

## Edge Cases

1. **Duplicate SKU** — Async validation on blur. Show "SKU already exists" inline.
2. **Very long name** — Character counter. Max 100 chars enforced.
3. **Negative quantity** — Input min=0 prevents negative. Server validation as safeguard.
4. **Unsaved changes** — If navigating away, show "Discard changes?" confirmation.
5. **Draft recovery** — If browser crashes, recover last draft from local storage.
6. **Photo upload failure** — Show error. Allow retry without losing form data.
7. **Network timeout during create** — Banner "Could not connect. Save as draft?" with draft fallback.
8. **Special characters in name** — Allow Unicode. Strip HTML tags.
9. **Multiple rapid submissions** — Button disabled after first click. Prevent duplicates.
10. **Large batch of materials** — Not applicable (single creation). For bulk, show import option.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `field_interacted` | `{field: "name"\|"sku"\|...}` — First blur |
| `sku_check_started` | SKU async validation |
| `sku_check_completed` | `{unique: bool}` |
| `draft_saved` | Save as draft |
| `photo_uploaded` | Photo upload |
| `material_created` | `{material_id}` — Success |
| `creation_failed` | `{reason}` |
| `cancelled_with_changes` | Cancel with dirty form |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Creation completion rate | Started vs completed |
| Time to create | Form open → submit |
| Most commonly used category | Category selection distribution |
| Draft save rate | Percentage saved as draft |
| Most common validation error | Field + error type count |

---

## Future Improvements

1. Bulk material import via CSV/Excel
2. Duplicate material detection (by name similarity, not just SKU)
3. Material template — Prefill based on category
4. QR code generation on creation — Auto-generate and print
5. Supplier auto-complete from master list
6. AI-assisted description generation
7. Unit conversion presets (pieces → boxes, kg → g)
