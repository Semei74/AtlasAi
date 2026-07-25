# Spacing System

> **Part of:** Atlas AI Enterprise Design System v1.0  
> **Status:** Production Ready

---

## Table of Contents

1. [Spacing Principles](#1-spacing-principles)
2. [Base Grid](#2-base-grid)
3. [Space Tokens](#3-space-tokens)
4. [Layout Grid](#4-layout-grid)
5. [Component Spacing Rules](#5-component-spacing-rules)
6. [Page Layout Templates](#6-page-layout-templates)
7. [Density](#7-density)
8. [Platform-Specific Adjustments](#8-platform-specific-adjustments)

---

## 1. Spacing Principles

1. **8px is the atomic unit.** All spacing is a multiple of 8px (exceptions: 4px for micro spacing).
2. **Consistent rhythm.** The same spacing value means the same relationship everywhere.
3. **Proximity communicates relationship.** Elements that belong together are closer. Elements that are separate have more space.
4. **Whitespace is a feature.** Generous padding improves scanability, comprehension, and perceived quality.
5. **Space tokens, not arbitrary values.** No magic numbers. Every space comes from the token set.

---

## 2. Base Grid

### 2.1 Grid Definitions

| Grid Type | Unit | Application |
|-----------|------|-------------|
| **Base unit** | 8px | All spacing decisions |
| **Micro unit** | 4px | Rare — icon gaps, compact layouts only |
| **Column grid** | 12 columns | Page-level layouts |
| **Gutter** | 24px (desktop), 16px (mobile) | Between columns |
| **Margin** | 24px (desktop), 16px (mobile) | Page edges |

### 2.2 Column System

| Breakpoint | Columns | Gutter | Margin | Container Max |
|------------|---------|--------|--------|---------------|
| xs (< 640px) | 4 | 16px | 16px | Fluid |
| sm (640px) | 8 | 16px | 24px | Fluid |
| md (768px) | 12 | 24px | 24px | Fluid |
| lg (1024px) | 12 | 24px | 24px | 1200px |
| xl (1280px) | 12 | 24px | 32px | 1440px |
| 2xl (1536px) | 12 | 24px | 32px | 1600px |

---

## 3. Space Tokens

### 3.1 Token Definitions

| Token | Value (px) | Value (rem) | Name | Usage |
|-------|------------|-------------|------|-------|
| `space-0` | 0 | 0 | None | No spacing |
| `space-0_5` | 2 | 0.125 | Micro | Stacked elements minimum |
| `space-1` | 4 | 0.25 | XSmall | Icon gaps, small badge padding |
| `space-1_5` | 6 | 0.375 | Small | Tight icon+text spacing |
| `space-2` | 8 | 0.5 | Small | Inline elements, avatar groups |
| `space-2_5` | 10 | 0.625 | Small-Med | Tabs, small button gaps |
| `space-3` | 12 | 0.75 | Medium | Related elements, list items |
| `space-4` | 16 | 1 | Base | Card padding, form rows |
| `space-5` | 20 | 1.25 | Large | Section padding, button groups |
| `space-6` | 24 | 1.5 | XLarge | Modal padding, page sections |
| `space-7` | 28 | 1.75 | XXSmall gap | Sidebar sections |
| `space-8` | 32 | 2 | XXLarge | Major sections, page spacing |
| `space-9` | 36 | 2.25 | XXXSmall section | Toolbar spacing |
| `space-10` | 40 | 2.5 | XXXLarge | Page section separation |
| `space-12` | 48 | 3 | Huge | Major page sections |
| `space-14` | 56 | 3.5 | Top bar height | Layout constants |
| `space-16` | 64 | 4 | Massive | Page-level spacing |
| `space-18` | 72 | 4.5 | Section hero | Feature section spacing |
| `space-20` | 80 | 5 | Max content padding | Wide screen constraints |
| `space-24` | 96 | 6 | Section max | Maximum meaningful spacing |
| `space-28` | 112 | 7 | L Section | Landing page hero |
| `space-32` | 128 | 8 | XXL Section | Only for marketing |

### 3.2 Semantic Token Map

```css
/* Spacing primitives mapped to usage */
--space-inset-xs:    space-2;    /* 8px  — tight button padding */
--space-inset-sm:    space-3;    /* 12px — small card padding */
--space-inset-md:    space-4;    /* 16px — card padding (default) */
--space-inset-lg:    space-6;    /* 24px — modal padding */
--space-inset-xl:    space-8;    /* 32px — dialog padding */

--space-stack-xs:    space-2;    /* 8px  — tight stacked elements */
--space-stack-sm:    space-3;    /* 12px — form field spacing */
--space-stack-md:    space-4;    /* 16px — section spacing */
--space-stack-lg:    space-6;    /* 24px — major section spacing */
--space-stack-xl:    space-8;    /* 32px — page section spacing */

--space-inline-xs:   space-2;    /* 8px  — inline element gap */
--space-inline-sm:   space-3;    /* 12px — button group gap */
--space-inline-md:   space-4;    /* 16px — form row gap */
--space-inline-lg:   space-6;    /* 24px — page element gap */

--space-gap-xs:      space-1;    /* 4px  — icon gap */
--space-gap-sm:      space-2;    /* 8px  — avatar group overlap */
--space-gap-md:      space-3;    /* 12px — tag group gap */
--space-gap-lg:      space-4;    /* 16px — card grid gap */
```

---

## 4. Layout Grid

### 4.1 Page Layout Structure

```
┌─────────────────────────────────────────────────┐
│  Top Bar (56px)                                 │
├────────┬────────────────────────────────────────┤
│        │  Page Header (56–96px)                 │
│ Side   │  ┌──────────────────────────────────┐  │
│ Bar    │  │  Content Area                     │  │
│ (240px)│  │  (grid, flex, or free-form)       │  │
│        │  │                                   │  │
│        │  └──────────────────────────────────┘  │
│        │  Footer area (optional)                │
├────────┴────────────────────────────────────────┤
│  Status Bar (32px, optional)                    │
└─────────────────────────────────────────────────┘
```

### 4.2 Fixed Layout Sizes

| Element | Height | Width | Z-index |
|---------|--------|-------|---------|
| Top bar | 56px | 100% | 100 |
| Sidebar (expanded) | 100% | 240px | 90 |
| Sidebar (collapsed) | 100% | 52px | 90 |
| Bottom tab bar (mobile) | 56px | 100% | 100 |
| Footer | Auto | 100% | 10 |
| Status bar | 32px | 100% | 50 |

### 4.3 Content Padding

| Screen Size | Content Padding |
|-------------|-----------------|
| Desktop ≥ 1280px | 32px (space-8) |
| Desktop 1024–1280px | 24px (space-6) |
| Tablet 768–1024px | 24px (space-6) |
| Mobile < 768px | 16px (space-4) |

---

## 5. Component Spacing Rules

### 5.1 Card Spacing

| Card Part | Padding |
|-----------|---------|
| Default card body | 16px (space-4) |
| Dense card body | 12px (space-3) |
| Card header | 16px + 12px bottom |
| Card footer | 12px top + 16px |
| Between card sections | 8px (space-2) |

### 5.2 Form Spacing

| Element | Spacing |
|---------|---------|
| Between form fields | 20px (space-5) |
| Label to input | 6px |
| Input to helper text | 4px |
| Helper text to next field | 8px |
| Between form sections | 32px (space-8) |
| Button group from form | 24px (space-6) |

### 5.3 Table Spacing

| Element | Comfortable | Compact |
|---------|-------------|---------|
| Cell padding (vertical) | 14px | 8px |
| Cell padding (horizontal) | 16px | 12px |
| Header to first row | 4px | 2px |
| Row height | 56px | 40px |
| Between tables | 32px | 24px |

### 5.4 Navigation Spacing

| Element | Value |
|---------|-------|
| Sidebar item padding (vertical) | 10px |
| Sidebar item padding (horizontal) | 16px |
| Sidebar section gap | 8px |
| Sidebar section header bottom | 8px |
| Top bar horizontal padding | 16px |
| Top bar item gap | 4px |
| Tab gap | 0px (adjacent with border separation) |

### 5.5 Dialog/Modal Spacing

| Element | Value |
|---------|-------|
| Modal padding | 24px (space-6) |
| Modal body to actions | 24px (space-6) |
| Modal header bottom | 16px (space-4) |
| Between modal sections | 16px (space-4) |
| Action button gap | 12px (space-3) |

### 5.6 List Spacing

| Element | Value |
|---------|-------|
| List item padding (vertical) | 12px |
| List item padding (horizontal) | 16px |
| Between list items | 0px (adjacent) |
| Between list sections | 16px |

### 5.7 Tooltip/Popover Spacing

| Element | Value |
|---------|-------|
| Tooltip padding | 6px 12px |
| Tooltip arrow offset | 8px from center |
| Popover padding | 16px |
| Popover arrow offset | 12px from edge |

---

## 6. Page Layout Templates

### 6.1 Dashboard Layout

```
┌────────────────────────────────────────────┐
│  Page Header (space-4 bottom)              │
│  Title + Actions ──────────────────────    │
├────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │  Row 1: KPI cards
│  │  KPI     │ │  KPI     │ │  KPI     │    │  Gap: space-4
│  └──────────┘ └──────────┘ └──────────┘    │
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  │  Row 2: Main chart
│  │  Chart / Graph (full width)          │  │  Space above: space-6
│  └──────────────────────────────────────┘  │
├────────────────────────────────────────────┤
│  ┌────────────────┐┌─────────────────────┐│  Row 3: Split panels
│  │  Recent Activity││  Quick Actions       ││  Gap: space-4
│  └────────────────┘└─────────────────────┘│
└────────────────────────────────────────────┘
Page bottom padding: space-8
```

### 6.2 Settings Layout

```
┌────────────────────────────────────────────┐
│  Page Header (space-6 bottom)              │
│  Title + Description                       │
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  │
│  │  Section Header (space-3 bottom)     │  │
│  │  ───────────────────────────────     │  │
│  │  Field row (space-5 bottom)          │  │
│  │  ───────────────────────────────     │  │
│  │  Field row (space-5 bottom)          │  │
│  └──────────────────────────────────────┘  │
│  ┌─ Divider (space-4 margin v) ─────────┐  │
│  │  Section Header (space-3 bottom)     │  │
│  │  ───────────────────────────────     │  │
│  │  Toggle row (space-4 bottom)         │  │
│  │  ───────────────────────────────     │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

---

## 7. Density

### 7.1 Density Modes

| Property | Comfortable | Compact | Touch |
|----------|-------------|---------|-------|
| Card padding | space-4 | space-3 | space-4 |
| Form field gap | space-5 | space-3 | space-6 |
| Table row height | 56px | 40px | 60px |
| List item padding | space-3 | space-2 | space-4 |
| Modal padding | space-6 | space-4 | space-6 |
| Section gap | space-8 | space-6 | space-8 |

### 7.2 When to Use Each Density

| Density | Platform | Screen Type | User Preference |
|---------|----------|-------------|-----------------|
| Comfortable | All | Default | Default |
| Compact | Desktop | Admin, data tables, logs | Power user setting |
| Touch | Mobile, Tablet | All touch surfaces | Default on mobile |

---

## 8. Platform-Specific Adjustments

### 8.1 Desktop

- Margins: 24–32px based on window width
- Card padding: 16px default, 20px for elevated cards
- Max content width: 1440px

### 8.2 Tablet

- Margins: 24px
- Card padding: 16px
- Touch target minimum: 44px

### 8.3 Mobile

- Margins: 16px (never less)
- Card padding: 16px (standard), 12px (dense)
- Touch target minimum: 44px (preferred 48px)
- Bottom sheet padding: 24px top, 16px sides
- Use full-width cards (no grid gaps on mobile)

### 8.4 Safe Areas

```
Mobile safe area insets:
- Top: env(safe-area-inset-top)     — default 44px
- Bottom: env(safe-area-inset-bottom) — default 34px
- Left: env(safe-area-inset-left)   — default 0px
- Right: env(safe-area-inset-right)  — default 0px

Apply safe areas to:
- Page content padding
- Fixed elements (top bar, bottom tab bar, FAB)
- Modal positioning
```
