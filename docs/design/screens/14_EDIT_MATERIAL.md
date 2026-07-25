# 14 — Edit Material

## Overview

**Purpose:** Modify an existing material's attributes.

**Business Goal:** Keep inventory data accurate and up-to-date. Track changes via audit log.

**User Goal:** I want to update material details when information changes.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Material Card "Edit" button | Edit form (prefilled) |
| **To** | Material Card (updated view) | Post-edit |

---

## User Story

> As a warehouse manager, I want to update material information so that the inventory records remain accurate.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  ← Material Card  /  Edit Material (20px SemiBold)│
│ Side   │  ┌─ Basic Information ─────────────────────────┐   │
│ Bar    │  │  Name *          Nut M12 ________           │   │
│        │  │  SKU *           NUT-M12 _______ (locked)   │   │
│        │  │  Category *      ▾ Fasteners > Nuts         │   │
│        │  │  Unit *          ▾ piece                    │   │
│        │  └────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Stock Details ─────────────────────────────┐   │
│        │  │  Min Stock *     ___20_____                  │   │
│        │  │  Location *      ▾ Warehouse A › Aisle 12   │   │
│        │  └────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Additional ───────────────────────────────┐   │
│        │  │  Supplier       ▾ FastenerCo               │   │
│        │  │  Description    M12 hex nut..._________    │   │
│        │  │  Photo          [Change Image] [Remove]    │   │
│        │  └────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Change History ───────────────────────────┐   │
│        │  │  Jan 15, 2024 — Min stock changed 10 → 20  │   │
│        │  │  Jan 10, 2024 — Location changed A-10→A-12 │   │
│        │  └────────────────────────────────────────────┘   │
│        │                                                     │
│        │  [Cancel] [Save Changes]                           │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Breadcrumb + Title
Basic:     Editable material attributes (SKU locked after creation)
Stock:     Editable stock thresholds
Additional: Supplier, Description, Photo (editable)
History:   Change log (read-only)
Actions:   Cancel + Save
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Input | Name, Min Stock | outlined, md |
| Select | Category, Unit, Location, Supplier | md |
| Textarea | Description | outlined |
| File Upload | Photo | with replace/remove |
| Button | Cancel | ghost, md |
| Button | Save Changes | primary, md |
| Timeline | Change history | compact |
| Alert | Validation errors | error |
| Toast | Success | "Changes saved" |

---

## Information Hierarchy

```
Primary:   Editable fields, Save button
Secondary: Change history
Tertiary:  Cancel, Photo
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Form prefilled with current values. Save disabled until change made. |
| **Loading** | Skeleton form. |
| **Success** | Toast "Changes saved." Redirect to Material Card. |
| **Error** | Inline errors. Banner for server errors. |
| **Offline** | Banner "Changes queued. Will sync when online." |
| **Empty** | Not applicable. |
| **No permissions** | Edit form not accessible. Redirect to Material Card. |
| **No data** | Not applicable. |
| **Syncing** | "Saving..." indicator. |
| **Updating** | Optimistic update. |
| **Read only** | Form fields disabled. "You don't have permission to edit." |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Single column, max 640px. |
| **Tablet** | Single column. |
| **Mobile** | Single column. Sticky save button at bottom. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-required`, `aria-invalid`, `aria-describedby`. |
| **Focus order** | Name → SKU (read-only) → Category → Unit → Min → Location → Supplier → Description → Photo → History → Cancel → Save |
| **Screen reader** | Announce dirty state. Announce saved confirmation. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through fields. Enter to save. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Enter | Sections fade in | 250ms |
| Field change | Highlight on changed field | 300ms then fade |
| Save | Button loading → checkmark | 500ms |
| Confetti (optional) | First edit celebration | 1s |

---

## Validation

| Field | Rule | Error |
|-------|------|-------|
| Name | Required, min 2 chars | "Enter a material name" |
| SKU | Read-only (locked after creation) | — |
| Category | Required | "Select a category" |
| Min Stock | Required, ≥ 0 | "Enter minimum stock level" |
| Location | Required | "Select a location" |
| Description | Max 500 chars | "Description too long" |

---

## Edge Cases

1. **SKU locked** — SKU cannot be changed after creation. Show lock icon + tooltip "SKU cannot be changed."
2. **No changes made** — Save disabled. "No changes to save" tooltip on button.
3. **Concurrent edit conflict** — If another user edited, show conflict dialog with diff.
4. **Min stock > current stock** — Warning banner "Min stock is higher than current quantity."
5. **Trying to set lower min stock** — Warning "Setting min stock lower will disable low-stock alerts."
6. **Photo replacement** — Replace upload shows new image preview. "Remove" reverts to no photo.
7. **Navigation away without saving** — "Discard changes?" confirmation if dirty.
8. **Field history not loading** — Graceful degradation. Show "Change history unavailable."
9. **Invalid location after restructuring** — If location was merged/deleted, prompt to select new location.
10. **Auto-save timer** — Auto-save draft every 30 seconds while editing.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | `{material_id}` — Screen mount |
| `field_changed` | `{field, old_value, new_value}` |
| `save_clicked` | Save button |
| `saved_successfully` | Update success |
| `save_failed` | `{reason}` |
| `cancelled_with_changes` | Discard confirmation |
| `change_history_viewed` | Scroll to history |
| `photo_changed` | Photo upload/remove |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| Edit rate | Detail views → Edit |
| Most changed field | Field change count |
| Save abandonment rate | Edit started but not saved |
| Edit duration | Form open to save |
| Conflict rate | Concurrent edit percentage |

---

## Future Improvements

1. Inline editing — Edit fields directly on Material Card without form navigation
2. Bulk edit — Change common fields across multiple materials
3. Edit approval workflow — Changes require manager approval
4. AI-suggested improvements — "This description could be more detailed"
5. Version comparison — Side-by-side view of old vs new values
6. Scheduled changes — Set future effective dates for changes
