# Form Standards

> **Part of:** Atlas AI Enterprise Design System v1.0  
> **Status:** Production Ready

---

## Table of Contents

1. [Form Principles](#1-form-principles)
2. [Form Layout](#2-form-layout)
3. [Field Types Reference](#3-field-types-reference)
4. [Validation](#4-validation)
5. [Error Handling](#5-error-handling)
6. [Input Masks & Formatting](#6-input-masks--formatting)
7. [Keyboard Types & Autocomplete](#7-keyboard-types--autocomplete)
8. [Required vs Optional](#8-required-vs-optional)
9. [Form Actions](#9-form-actions)
10. [Form Accessibility](#10-form-accessibility)
11. [Edge Cases](#11-edge-cases)

---

## 1. Form Principles

1. **Every field has a label.** Placeholder text is not a label. When the user types, the label remains visible (floating label or top label).
2. **Validation is immediate.** Inline validation fires on blur. Never on every keystroke. Submit validation checks everything.
3. **Errors explain what's wrong and how to fix.** Not just "Invalid input" but "Password must be at least 8 characters."
4. **Default values reduce friction.** Pre-select the most common option. Pre-fill known user data.
5. **Save is implicit.** Auto-save every 30 seconds. Discard confirmation only if changes are unsaved.
6. **One thing per page.** Complex operations are split into steps (wizard). A form does one job well.
7. **Mobile first.** Inputs are 16px minimum (prevents iOS zoom). Touch targets are 44pt minimum.

---

## 2. Form Layout

### 2.1 Layout Patterns

| Pattern | Field Count | Best For |
|---------|-------------|----------|
| **Single column** | 1–10 | Simple forms, settings, login |
| **Two column** | 10–20 | Profile, address, preferences |
| **Grouped sections** | 20+ | Settings, configuration wizards |
| **Wizard** | 5+ per step | Complex multi-step operations |

### 2.2 Field Spacing

```
Between fields:         20px (space-5)
Between sections:       32px (space-8)
Label to input:         6px
Input to helper text:   4px
Helper to next field:   8px
Section title bottom:   12px
Form to actions:        24px (space-6)
```

### 2.3 Width Constraints

```
Single column form:     480px max-width (desktop), 100% (mobile)
Two column form:        720px max-width, 288px per column (12px gap)
Full-width form:        960px max-width
Field width:            min 240px, max 480px (unless full-width input)
Short fields:           120px (zip code), 80px (age), 160px (currency)
```

### 2.4 Section Groups

```
Section container:
  Border: 1px neutral-200
  Radius: 8px
  Padding: 24px
  Title: 16px SemiBold
  Description: 14px Regular, text-secondary

Section (no border):
  Title: 16px SemiBold
  Divider: full-width below title
  Description: 14px Regular, text-secondary
```

---

## 3. Field Types Reference

### 3.1 Text Input

- **Use for:** Short text (name, email, username)
- **Standard height:** 40px
- **Max length:** Enforced by character count display
- **Pattern:** Optional regex validation (alphanumeric, email, etc.)

### 3.2 Email

- **Keyboard type:** `email-address`
- **Autocomplete:** `email`
- **Validation:** RFC 5322 simplified regex
- **Icon:** mail (16px, left)

### 3.3 Password

- **Keyboard type:** `default` (with autocorrect off)
- **Autocomplete:** `current-password` / `new-password`
- **Mask:** `•` by default, toggle eye icon to reveal
- **Requirements:** Show checklist when focused (length, case, number, symbol)
- **Strength indicator:** Visual bar below input (weak/medium/strong)

### 3.4 Search

- **Keyboard type:** `web` (with search key)
- **Autocomplete:** `off`
- **Icon:** search (16px, left)
- **Clear:** X button when value present
- **Debounce:** 300ms for live search

### 3.5 URL

- **Keyboard type:** `url`
- **Autocomplete:** `url`
- **Validation:** Must start with http:// or https://
- **Prefix:** "https://" pre-filled (optional)

### 3.6 Phone

- **Keyboard type:** `phone-pad`
- **Autocomplete:** `tel`
- **Mask:** (XXX) XXX-XXXX or international format
- **Country code:** Dropdown prefix for international

### 3.7 Number

- **Keyboard type:** `decimal-pad` (mobile) / number (desktop)
- **Autocomplete:** `off`
- **Min/Max:** Enforced
- **Step:** Configurable increment
- **Steppers:** +/- buttons (optional)
- **Format:** Commas for thousands (locale-aware)

### 3.8 Date

- **Keyboard type:** `default`
- **Autocomplete:** `bday`, `off`
- **Format:** YYYY-MM-DD (ISO) or locale format
- **Picker:** Calendar dropdown on click

### 3.9 Time

- **Format:** HH:MM (24h) or HH:MM AM/PM (12h)
- **Picker:** Scrollable dropdown

### 3.10 Textarea

- **Keyboard type:** `default`
- **Min height:** 80px
- **Auto grow:** Up to 320px
- **Character count:** Displayed bottom-right

### 3.11 Select

- **Use for:** 5+ options
- **Single:** One selection
- **Multiple:** Checkbox list

### 3.12 Radio Group

- **Use for:** 2–5 options, mutually exclusive
- **Layout:** Vertical (default), horizontal (2–3 options)

### 3.13 Checkbox Group

- **Use for:** Multiple selections from 2–8 options
- **Layout:** Vertical (always for 5+)

### 3.14 Toggle/Switch

- **Use for:** Binary setting, instant effect
- **Label:** Left side
- **Description:** Below, 12px Regular

### 3.15 Slider

- **Use for:** Range selection, continuous values
- **Min/Max:** Visible labels
- **Value:** Displayed above or right side

### 3.16 File Upload

- **Drop zone:** Dashed border
- **Multiple:** Optional
- **Accept:** File type filter
- **Max size:** Validation
- **Preview:** Image thumbnails

### 3.17 Combobox

- **Use for:** Search + select from large list
- **Create:** "Create new" option for unmatched input

### 3.18 Tag Input

- **Use for:** Multiple text entries (emails, skills)
- **Enter:** Creates new tag
- **Backspace:** Removes last tag (when input empty)
- **Paste:** Parses comma-separated values

### 3.19 OTP/Code

- **Use for:** Verification codes
- **Length:** 6 (default)
- **Auto-advance:** Focus next on digit
- **Paste:** Full code paste

### 3.20 Color

- **Use for:** Color selection
- **Presets:** 20 predefined
- **Custom:** HEX input + picker

### 3.21 Currency

- **Keyboard type:** `decimal-pad`
- **Prefix:** $, €, £ (locale-aware)
- **Format:** $1,234.56
- **Step:** 0.01

### 3.22 Rich Text

- **Use for:** Long-form content
- **Toolbar:** Bold, Italic, Underline, Link, List, Heading
- **Keyboard shortcuts:** Cmd+B, Cmd+I, Cmd+U

---

## 4. Validation

### 4.1 Validation Timing

| Event | Action |
|-------|--------|
| **Input** | No validation |
| **Blur** | Validate field, show inline error |
| **Change after blur** | Clear error on valid input |
| **Submit** | Validate all fields, show first error |

### 4.2 Validation Rules by Field Type

| Field | Rules |
|-------|-------|
| Email | Format, uniqueness (async) |
| Password | Length (8+), complexity, match confirm |
| Phone | Format, valid number |
| URL | Format, reachability (async) |
| Number | Min, max, integer/decimal |
| Date | Valid date, min/max range, not in past |
| Required | Not empty |
| Unique | Check server (async — debounced 500ms) |
| File | Type, size, count |

### 4.3 Real-time Validation

- **Password strength:** Re-evaluates on every keystroke (debounced 300ms)
- **Username availability:** Async check on blur (debounced 500ms)
- **Character count:** Updates in real-time (no debounce)
- **Pattern match:** On blur only (except password strength)

### 4.4 Submit Validation

```
On submit:
1. Validate all required fields
2. Validate format of each field
3. Validate async rules (unique, reachable)
4. Show first error with scroll-to-field
5. Focus first error field
6. Disable submit button during async validation
```

---

## 5. Error Handling

### 5.1 Inline Error Display

```
Error state:
  Border: 1px error
  Background: error-bg (very subtle)
  Icon: alert-circle, 16px, error (right of input)
  Message: 12px Regular, error, below input, 4px top margin
```

### 5.2 Error Message Content

| Situation | Error Message |
|-----------|---------------|
| Required empty | "This field is required" |
| Invalid email | "Enter a valid email address" |
| Password too short | "Password must be at least 8 characters" |
| Password mismatch | "Passwords must match" |
| Invalid format | "Enter a valid X format" (phone, URL, etc.) |
| Max length exceeded | "Maximum X characters" |
| Value too low | "Minimum value is X" |
| Value too high | "Maximum value is X" |
| Already exists | "This X is already in use" |
| File too large | "File must be smaller than X MB" |
| Invalid file type | "Accepted formats: X, Y, Z" |
| Network error | "Could not validate. Check your connection and try again." |

### 5.3 Form-Level Errors

```
Position: Above the submit button
Layout: Alert with error icon
Message: "X fields have errors. Review and try again."
Link: "Review errors" scrolls to first error
```

### 5.4 Server Errors

```
Server errors appear:
1. Inline on the specific field (if mapped)
2. In the form-level error area (if general)
3. As a toast for non-field errors

Server error message: Copy from server or human-readable fallback
Never show raw server error messages to users
```

---

## 6. Input Masks & Formatting

### 6.1 Mask Definitions

| Field | Mask | Example |
|-------|------|---------|
| Phone (US) | (XXX) XXX-XXXX | (555) 123-4567 |
| Phone (intl) | +X XXX XXX XXXX | +1 555 123 4567 |
| SSN | XXX-XX-XXXX | 123-45-6789 |
| ZIP (US) | XXXXX or XXXXX-XXXX | 94102 or 94102-1234 |
| Credit card | XXXX XXXX XXXX XXXX | 4242 4242 4242 4242 |
| Date | XX/XX/XXXX | 01/15/2024 |
| Time | XX:XX AM/PM | 02:30 PM |
| Currency | $X,XXX.XX | $1,234.56 |
| Percentage | XX.X% | 85.5% |

### 6.2 Formatting on Input

- **Auto-format:** As user types (don't wait for blur)
- **Cursor position:** Maintain cursor after format
- **Strip on submit:** Submit raw/unformatted value
- **Paste:** Strip formatting, then re-apply mask

---

## 7. Keyboard Types & Autocomplete

### 7.1 Keyboard Types (Mobile)

| Input Type | `inputmode` | Keyboard |
|------------|-------------|----------|
| Text | `text` | Default |
| Email | `email` | @ and .com keys |
| Password | `text` | Default (no suggestions) |
| Search | `search` | Search key (go) |
| URL | `url` | .com and / keys |
| Phone | `tel` | Numeric keypad |
| Number | `numeric` | Numeric keypad |
| Decimal | `decimal` | Numeric + decimal |
| Date | `text` | Default + date picker |

### 7.2 Autocomplete Attributes

| Field | `autocomplete` |
|-------|----------------|
| Full name | `name` |
| Given name | `given-name` |
| Family name | `family-name` |
| Email | `email` |
| Phone | `tel` |
| Address line 1 | `address-line1` |
| Address line 2 | `address-line2` |
| City | `address-level2` |
| State | `address-level1` |
| ZIP/Postal | `postal-code` |
| Country | `country-name` |
| Current password | `current-password` |
| New password | `new-password` |
| Credit card number | `cc-number` |
| Credit card expiry | `cc-exp` |
| Credit card CVC | `cc-csc` |
| Username | `username` |
| Search | `off` |

---

## 8. Required vs Optional

### 8.1 Indicator Rules

| Scenario | Indicator |
|----------|-----------|
| Most fields required | Mark optional fields with "(optional)" in text-tertiary |
| Most fields optional | Mark required fields with red "*" |
| All fields required | No indicators needed. Note at top: "All fields required." |

### 8.2 Visual Treatment

```
Required indicator:
  "*" character
  Color: error
  Size: 14px
  Position: Immediately after label text

Optional indicator:
  "(optional)" text
  Color: text-tertiary
  Font: 12px Regular
  Position: Immediately after label text
```

---

## 9. Form Actions

### 9.1 Button Positioning

```
Simple form:     Submit/Create left-aligned below form
Multi-section:   Submit bottom-right, Cancel ghost to left
Wizard:          Previous (left) + Next (right), Submit (right, last step)
Modal form:      Cancel (left/ghost) + Submit (right/primary)
Settings form:   Auto-save with "Saved" indicator
```

### 9.2 Submit Button States

| State | Button Text | Behavior |
|-------|-------------|----------|
| Default | "Submit" / "Save" / "Create" | Enabled |
| Loading | Spinner + "Saving..." | Disabled, show spinner |
| Success | Spinner + "Saved!" | 2s delay, then reset |
| Error | "Retry" | Re-enable, allow retry |
| Disabled | "Submit" | Disabled until form valid |

### 9.3 Save Strategies

| Strategy | When | Best For |
|----------|------|----------|
| **Manual save** | Explicit button | Simple forms, wizards |
| **Auto-save** | Every 30s or on change | Settings, rich content |
| **Save on blur** | When field loses focus | Inline editing |
| **Save on navigate** | Before leaving page | Draft content |

### 9.4 Discard Confirmation

```
Trigger: User tries to navigate away with unsaved changes
Prompt: "You have unsaved changes. Discard?"
Actions: "Keep editing" (primary) + "Discard" (destructive ghost)
Browser: beforeunload event as fallback
```

---

## 10. Form Accessibility

### 10.1 ARIA Requirements

| Element | ARIA Attribute |
|---------|----------------|
| Form | `role="form"` or native `<form>` |
| Field group | `<fieldset>` + `<legend>` |
| Required field | `aria-required="true"` |
| Invalid field | `aria-invalid="true"` |
| Error message | `aria-describedby="error-id"` |
| Help text | `aria-describedby="help-id"` |
| Field label | `<label>` with `for` attribute |
| Input group | `role="group"` + `aria-labelledby` |

### 10.2 Keyboard Navigation

```
Tab:     Sequential through fields (respects tabindex order)
Shift+Tab: Reverse sequential
Enter:   Submit form (when focused on input/button)
Esc:     Close modal/drawer form
Space:   Toggle checkbox, select dropdown
Arrow:   Navigate radio group, slider, dropdown
```

### 10.3 Focus Management

```
On page load:       Focus first field
On error:           Focus first error field, scroll into view
After submit:       Focus success message or next logical element
Modal open:         Focus first field or close button
Modal close:        Return focus to trigger element
```

### 10.4 Error Announcement

```
On validation error:
- Focus first error field
- Announce error via aria-live="polite"
- Screen reader reads error message
- Error summary at top of form (for submit errors)
```

---

## 11. Edge Cases

### 11.1 Slow Network

- Show loading state on submit (spinner in button)
- Disable submit button during submission
- Timeout after 30s with retry option
- Keep form state on error (don't clear inputs)

### 11.2 Concurrent Edits

- Detect conflicting saves
- Show "Another user changed this field" with merge option
- Last save wins by default (with notice)

### 11.3 Very Long Text

- Textarea: Auto-grow with max height (320px), scroll beyond
- Input: Show character count, enforce max length
- Name fields: No max length (some names are long)

### 11.4 Special Characters

- Strip control characters (0x00–0x1F) except \n in textarea
- Allow Unicode in name fields
- Sanitize HTML (strip tags, encode entities)
- Validate email per RFC 5321 (allows +, ., and international chars)

### 11.5 Paste Handling

- Strip formatting from pasted text
- Parse comma/tab-separated values for tag inputs
- Handle multi-line paste in single-line inputs (strip newlines)
- Validate pasted content immediately

### 11.6 Offline Submission

- Queue form submissions when offline
- Show "Saved offline" indicator
- Submit queue when connection restores
- Handle conflicts on sync

### 11.7 Mobile Considerations

- 16px font minimum (prevents iOS zoom on focus)
- 44pt minimum touch targets
- Native keyboard types (email, numeric, URL)
- No hover-dependent interactions
- Fixed submit button (bottom of viewport for long forms)
- Safe area insets for notched devices
