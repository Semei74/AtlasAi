# Atlas AI Design Tokens

> **Status:** Placeholder — Phase 2  
> **Version:** 1.0.0  
> **Purpose:** Define the complete design token system for the Atlas AI platform

---

## Overview

Design tokens are the atomic values that drive the visual appearance of the platform. They ensure consistency across web, mobile, and desktop surfaces by providing a single source of truth for colors, typography, spacing, shadows, and motion.

This document will be populated in Phase 2 (Design Token System) as part of the product design implementation.

---

## Token Categories

### 1. Color Tokens

Planned categories:
- **Brand Colors** — Primary, secondary, accent
- **Neutral Colors** — Background, surface, text (light/dark modes)
- **Semantic Colors** — Success, warning, error, info
- **Chart Colors** — Data visualization palette
- **Status Colors** — Online, offline, away, busy
- **Role Colors** — Owner, admin, manager, member, viewer

### 2. Typography Tokens

Planned categories:
- **Font Family** — Primary, mono
- **Font Size** — 10 levels (xs to 4xl)
- **Font Weight** — Regular, medium, semibold, bold
- **Line Height** — Tight, normal, relaxed
- **Letter Spacing** — Default, wide, wider

### 3. Spacing Tokens

Based on 4px grid with 8px step (defined in Design Bible §6.6)

### 4. Shadow Tokens

- **Elevation 0** — No shadow (flat)
- **Elevation 1** — Card, dropdown
- **Elevation 2** — Modal, dialog
- **Elevation 3** — Toast, tooltip
- **Elevation 4** — Command palette

### 5. Border Radius Tokens

- None (0px)
- XS (2px)
- S (4px)
- M (8px)
- L (12px)
- XL (16px)
- Full (9999px) — pills, avatars

### 6. Motion Tokens

- **Duration** — Fast (100ms), Normal (200ms), Slow (300ms), XL (500ms)
- **Easing** — Ease-in-out, Ease-out, Ease-in, Linear, Spring
- **Animation Types** — Fade, Slide, Scale, Rotate

### 7. Opacity Tokens

- 0%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90%, 100%

### 8. Z-Index Tokens

- Dropdown (100)
- Sticky (200)
- Sidebar (300)
- Modal Backdrop (400)
- Modal (500)
- Toast (600)
- Tooltip (700)
- Command Palette (800)

---

## Token Format

Tokens follow the naming convention:

```
{category}-{property}-{variant}-{state?}
```

Examples:
- `color-primary-default`
- `color-semantic-error`
- `typography-size-lg`
- `spacing-padding-lg`
- `shadow-elevation-2`
- `motion-duration-normal`

---

## Implementation

Design tokens will be implemented as:

1. **CSS Custom Properties** — For web platform
2. **Tamagui Tokens** — For cross-platform (React Native + Web)
3. **Style Dictionary** — For platform-agnostic token management

---

## Next Steps (Phase 2)

1. Define complete color palette (light + dark modes)
2. Select and configure typography system
3. Build spacing system from Design Bible spec
4. Define shadow and elevation system
5. Configure motion tokens
6. Implement in Tamagui theme
7. Document with visual examples
8. Review with engineering team
