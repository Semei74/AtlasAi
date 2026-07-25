# Typography System

> **Part of:** Atlas AI Enterprise Design System v1.0  
> **Status:** Production Ready

---

## Table of Contents

1. [Type Principles](#1-type-principles)
2. [Type Family Selection](#2-type-family-selection)
3. [Type Scale](#3-type-scale)
4. [Platform-Specific Scales](#4-platform-specific-scales)
5. [Type Roles](#5-type-roles)
6. [Line Height & Letter Spacing](#6-line-height--letter-spacing)
7. [Font Weight](#7-font-weight)
8. [Rich Text Styles](#8-rich-text-styles)
9. [Code & Data Typography](#9-code--data-typography)
10. [Accessibility & Readability](#10-accessibility--readability)

---

## 1. Type Principles

1. **Hierarchy through weight and size, not color.** Headings are bold and larger. Subtitles are medium weight. Body is regular weight. Never use color to indicate hierarchy.
2. **Maximum 3 sizes per screen.** A well-designed screen uses at most 3 distinct font sizes.
3. **Inter is the single UI font.** No fallback to system fonts except as technical fallback stack. No secondary fonts for UI.
4. **JetBrains Mono for code.** Code, data, and technical content use the monospace family.
5. **Line length control.** Body text lines should be 60–75 characters. Headings should break naturally.
6. **No letter-spacing for body.** Only use letter-spacing for uppercase labels and all-caps UI text.

---

## 2. Type Family Selection

### 2.1 Primary Font: Inter

**Why Inter:** Inter was chosen over SF Pro, Roboto, and System UI for the following reasons:

- Variable font support — single file covers all weights
- Excellent screen readability at small sizes (x-height is generous)
- Clear distinction between similar characters (1/l/I, O/0)
- Strong numeric character set — critical for enterprise data displays
- Well-tuned letter-spacing at every weight
- Open source, permissive license (SIL OFL)
- Strong vertical rhythm across all weights

**Stack:**
```
Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

### 2.2 Monospace Font: JetBrains Mono

**Stack:**
```
'JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace
```

### 2.3 Fallback Behavior

- If Inter fails to load, the system UI stack provides identical metrics.
- If JetBrains Mono fails to load, SF Mono (macOS) or Consolas (Windows) provides monospace.
- No significant layout shift occurs during font loading.
- `font-display: swap` for performance.

---

## 3. Type Scale

### 3.1 Modular Scale

The Atlas AI type scale uses a **1.25 minor third** ratio for display/headline sizes and a **1.125 major second** ratio for body/text sizes.

| Step | Size (px) | Size (rem) | Ratio |
|------|-----------|------------|-------|
| -2 | 10 | 0.625 | Caption, code |
| -1 | 12 | 0.75 | Small label, data |
| 0 | 14 | 0.875 | **Base body**, small UI |
| 1 | 16 | 1 | Body, paragraph |
| 2 | 18 | 1.125 | Lead body, large label |
| 3 | 20 | 1.25 | Subtitle, H6 |
| 4 | 24 | 1.5 | H5 |
| 5 | 30 | 1.875 | H4 |
| 6 | 36 | 2.25 | H3 |
| 7 | 48 | 3 | H2 |
| 8 | 60 | 3.75 | H1 |
| 9 | 72 | 4.5 | Display |

### 3.2 Full Scale Reference

```
Display:    72px / 4.5rem  —  Hero titles, marketing pages only
H1:         60px / 3.75rem —  Page titles, welcome screens
H2:         48px / 3rem    —  Section headers (major)
H3:         36px / 2.25rem —  Section headers
H4:         30px / 1.875rem — Card titles, modal headers
H5:         24px / 1.5rem  —  Subsection headers
H6:         20px / 1.25rem —  Group headers, sidebar items
Lead Body:  18px / 1.125rem — Intro paragraphs, feature descriptions
Body:       16px / 1rem    —  Default body text
Body Small: 14px / 0.875rem — UI labels, input text, table cells
Caption:    12px / 0.75rem —  Timestamps, metadata, helper text
Code:       13px / 0.8125rem — Inline code, code blocks
```

---

## 4. Platform-Specific Scales

### 4.1 Desktop (≥ 1024px)

Uses the full standard scale above.

### 4.2 Mobile (< 768px)

| Role | Desktop | Mobile | Ratio |
|------|---------|--------|-------|
| Display | 72px | 40px | 0.55× |
| H1 | 60px | 36px | 0.6× |
| H2 | 48px | 32px | 0.66× |
| H3 | 36px | 28px | 0.77× |
| H4 | 30px | 24px | 0.8× |
| H5 | 24px | 20px | 0.83× |
| H6 | 20px | 18px | 0.9× |
| Body | 16px | 16px | 1× |
| Body Small | 14px | 14px | 1× |
| Caption | 12px | 12px | 1× |

### 4.3 Tablet (768px–1024px)

Uses desktop scale for all sizes, with exception of Display and H1 which reduce by 0.75×.

---

## 5. Type Roles

### 5.1 Role Assignments

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `display` | 72px (40px mobile) | Bold 700 | 1.1 | Hero, empty states, welcome |
| `heading-1` | 60px (36px mobile) | Bold 700 | 1.15 | Page titles |
| `heading-2` | 48px (32px mobile) | Bold 700 | 1.2 | Major sections |
| `heading-3` | 36px (28px mobile) | SemiBold 600 | 1.25 | Sections |
| `heading-4` | 30px (24px mobile) | SemiBold 600 | 1.3 | Card titles, modals |
| `heading-5` | 24px (20px mobile) | Medium 500 | 1.35 | Subsections |
| `heading-6` | 20px (18px mobile) | Medium 500 | 1.4 | Group headers |
| `subtitle` | 18px | Medium 500 | 1.5 | Lead paragraphs |
| `body` | 16px | Regular 400 | 1.6 | Default text |
| `body-small` | 14px | Regular 400 | 1.5 | UI labels, table cells |
| `caption` | 12px | Regular 400 | 1.4 | Metadata, timestamps |
| `label` | 14px | Medium 500 | 1.4 | Form labels, tabs |
| `label-small` | 12px | Medium 500 | 1.4 | Small form labels |
| `button` | 14px | SemiBold 600 | 1 | Buttons, CTA |
| `button-large` | 16px | SemiBold 600 | 1 | Primary CTA |
| `link` | 16px | Medium 500 | inherit | Inline links |
| `code` | 13px | Regular 400 | 1.6 | Code blocks |
| `code-inline` | 13px | Regular 400 | 1.4 | Inline code |
| `data` | 14px | Tabular nums | 1.3 | Numbers, metrics |
| `data-large` | 24px | Bold 700 Tabular | 1.2 | KPIs, dashboard numbers |

---

## 6. Line Height & Letter Spacing

### 6.1 Line Height Rules

| Context | Line Height | Rule |
|---------|-------------|------|
| Display / H1–H2 | 1.1–1.2 | Tight — headings should be close vertically |
| H3–H6 | 1.25–1.4 | Medium — section headers need breathing room |
| Body text (16px) | 1.6 | Relaxed — maximum readability |
| Small body (14px) | 1.5 | Good readability at small size |
| Caption (12px) | 1.4 | Compact — metadata is scannable |
| Button text | 1.0 | No extra vertical space in buttons |
| Code blocks | 1.6 | Consistent with body |

### 6.2 Letter Spacing

| Context | Letter Spacing | When to Use |
|---------|---------------|-------------|
| Normal body | `normal` | Default for all body text |
| Uppercase labels | `0.05em` | Tab labels, badge text, all-caps UI |
| Code | `normal` | No letter-spacing in monospace |
| Display | `-0.02em` | Tight tracking for large headlines |
| H1–H2 | `-0.01em` | Slightly tight for large headings |
| Buttons | `0.01em` | Very subtle spacing for readability |

---

## 7. Font Weight

### 7.1 Weight Usage

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body text, descriptions, paragraphs |
| 450 | Regular (Inter only) | Optical balance for small text |
| 500 | Medium | Subtitles, labels, nav items, tabs |
| 600 | SemiBold | H3–H6, buttons, strong emphasis |
| 700 | Bold | H1–H2, display, KPI values |

### 7.2 Weight Combined with Size

```
Display/H1/H2:  Bold (700)
H3/H4:          SemiBold (600)
H5/H6:          Medium (500)
Body:           Regular (400)
Small Body:     Regular (400)
Button:         SemiBold (600)
Label:          Medium (500)
Caption:        Regular (400)
```

---

## 8. Rich Text Styles

### 8.1 Inline Text Styles

| Style | Implementation | Usage |
|-------|---------------|-------|
| **Bold** | `font-weight: 600` (SemiBold), not 700 | Emphasis in body text |
| *Italic* | `font-style: italic` | Foreign words, titles |
| ~~Strikethrough~~ | `text-decoration: line-through` | Completed tasks, deprecated |
| `Code` | `font-family: JetBrains Mono; font-size: 13px; background: neutral-100; padding: 1px 4px; border-radius: 4px` | Inline code references |
| Underline | `text-decoration: underline` | Links only |
| Highlight | `background: primary-100; padding: 0 4px` | Search results, selected text |

### 8.2 Text Alignment

| Alignment | Usage |
|-----------|-------|
| Left | Default for all body content |
| Center | Empty states, hero sections, single CTA, modal titles |
| Right | Numeric data in tables, action columns |

---

## 9. Code & Data Typography

### 9.1 Code Blocks

```
Container:   Rounded corners (8px), neutral-100 background (light) / neutral-300 background (dark)
Font:        JetBrains Mono, 13px
Padding:     24px (top/bottom) × 20px (left/right)
Line height: 1.6
Border:      1px neutral-200 (light) / neutral-400 (dark)
Max height:  480px (with scroll)
Title bar:   32px height, neutral-200 background, filename label
```

### 9.2 Inline Code

```
Font:        JetBrains Mono, 13px
Background:  neutral-100 (light) / neutral-300 (dark)
Padding:     1px 4px
Border radius: 4px
```

### 9.3 Data (Tabular Numerals)

For data-heavy displays (dashboards, tables, metrics):

```
Font:        Inter (default)
Feature:     tabular-nums enabled (fixed-width numerals)
Weight:      Bold (700) for KPIs, Regular (400) for table data
Size:        14px (table), 24px (KPI large), 30px (hero KPI)
```

**CSS for data typography:**
```css
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum" on;
```

---

## 10. Accessibility & Readability

### 10.1 Minimum Sizes

| Context | Minimum | Notes |
|---------|---------|-------|
| Body text | 16px (1rem) | Never smaller for paragraphs |
| UI controls | 14px (0.875rem) | Buttons, inputs, labels |
| Legal/copyright | 12px (0.75rem) | Only for non-critical content |
| Code | 12px (0.75rem) | Minimum for readability |
| Input text | 16px (1rem) | Required for mobile (prevents zoom) |

### 10.2 Line Length

| Context | Max Width | Characters |
|---------|-----------|------------|
| Body paragraphs | 720px | ~65–75 characters |
| UI text | Component width | — |
| Headings | 80% of container | — |
| Code blocks | Container width | Wrap at 120 characters |

### 10.3 Responsive Typography

```css
/* Fluid typography approach */
html {
  font-size: 16px;
}

@media (max-width: 767px) {
  html { font-size: 15px; }
}

/* Heading scale adjusts via clamp */
h1 {
  font-size: clamp(2.25rem, 5vw, 3.75rem);
}
```
