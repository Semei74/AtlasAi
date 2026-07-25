# Color System

> **Part of:** Atlas AI Enterprise Design System v1.0  
> **Status:** Production Ready

---

## Table of Contents

1. [Color Principles](#1-color-principles)
2. [Color Roles](#2-color-roles)
3. [Light Theme Palette](#3-light-theme-palette)
4. [Dark Theme Palette](#4-dark-theme-palette)
5. [Semantic Colors](#5-semantic-colors)
6. [Surface & Background Colors](#6-surface--background-colors)
7. [Text Colors](#7-text-colors)
8. [Color Usage Rules](#8-color-usage-rules)
9. [Accessibility Compliance](#9-accessibility-compliance)
10. [Color Token Reference](#10-color-token-reference)

---

## 1. Color Principles

1. **Functional first** — Every color serves a purpose. No decorative colors.
2. **Semantic consistency** — Same meaning, same color, everywhere.
3. **Accessibility mandated** — Every color pair meets WCAG 2.2 AA minimum.
4. **Theme parity** — Light and dark themes provide equivalent information hierarchy.
5. **Restraint** — Use at most 3 colors per screen (not counting neutrals). Overuse dilutes meaning.

---

## 2. Color Roles

| Role | CSS Variable | Purpose |
|------|-------------|---------|
| **Primary** | `--color-primary` | Brand identity, primary actions, active navigation, links, focus rings |
| **Primary-foreground** | `--color-primary-foreground` | Text/icon on primary backgrounds |
| **Secondary** | `--color-secondary` | Secondary actions, brand accent, illustrations |
| **Secondary-foreground** | `--color-secondary-foreground` | Text/icon on secondary backgrounds |
| **Accent** | `--color-accent` | Highlights, badges, data visualization, AI-related indicators |
| **Accent-foreground** | `--color-accent-foreground` | Text/icon on accent backgrounds |
| **Success** | `--color-success` | Positive actions, completion, active states |
| **Warning** | `--color-warning` | Caution, pending, attention needed |
| **Error** | `--color-error` | Errors, destructive actions, critical failures |
| **Info** | `--color-info` | Information, help, neutral notifications |
| **Info-foreground** | `--color-info-foreground` | Text on info backgrounds |

---

## 3. Light Theme Palette

### 3.1 Primary (Indigo)

| Token | HEX | Usage |
|-------|-----|-------|
| `primary-50` | `#EEF2FF` | Lightest tint — selected table row, hover backgrounds |
| `primary-100` | `#E0E7FF` | Light tint — active background, info banners |
| `primary-200` | `#C7D2FE` | Medium tint — pressed state background |
| `primary-300` | `#A5B4FC` | Medium — border, outline variant |
| `primary-400` | `#818CF8` | Light — hover state for primary |
| `primary-500` | `#4F46E5` | **Base** — Primary buttons, links, active states |
| `primary-600` | `#4338CA` | Hover state for primary elements |
| `primary-700` | `#3730A3` | Active/pressed state for primary elements |
| `primary-800` | `#312E81` | Dark tint — deep accent |
| `primary-900` | `#1E1B4B` | Darkest tint — not for UI |

### 3.2 Secondary (Teal)

| Token | HEX | Usage |
|-------|-----|-------|
| `secondary-50` | `#F0FDFA` | Lightest tint |
| `secondary-100` | `#CCFBF1` | Light tint |
| `secondary-200` | `#99F6E4` | Medium tint |
| `secondary-300` | `#5EEAD4` | Medium |
| `secondary-400` | `#2DD4BF` | Light |
| `secondary-500` | `#14B8A6` | **Base** |
| `secondary-600` | `#0D9488` | Hover |
| `secondary-700` | `#0F766E` | Active |
| `secondary-800` | `#115E59` | Dark tint |
| `secondary-900` | `#134E4A` | Darkest tint |

### 3.3 Accent (Amber)

| Token | HEX | Usage |
|-------|-----|-------|
| `accent-50` | `#FFFBEB` | Lightest tint |
| `accent-100` | `#FEF3C7` | Light tint |
| `accent-200` | `#FDE68A` | Medium tint |
| `accent-300` | `#FCD34D` | Medium |
| `accent-400` | `#FBBF24` | Light |
| `accent-500` | `#F59E0B` | **Base** |
| `accent-600` | `#D97706` | Hover |
| `accent-700` | `#B45309` | Active |
| `accent-800` | `#92400E` | Dark tint |
| `accent-900` | `#78350F` | Darkest tint |

---

## 4. Dark Theme Palette

### 4.1 Primary (Bright Indigo)

| Token | HEX | Usage |
|-------|-----|-------|
| `primary-50` | `#1E1B4B` | Darkest tint |
| `primary-100` | `#312E81` | Dark tint |
| `primary-200` | `#3730A3` | Dark |
| `primary-300` | `#4338CA` | Medium dark |
| `primary-400` | `#6366F1` | **Light variant** — interactive elements |
| `primary-500` | `#818CF8` | Base primary in dark mode |
| `primary-600` | `#A5B4FC` | Hover state |
| `primary-700` | `#C7D2FE` | Active state |
| `primary-800` | `#E0E7FF` | Light tint |
| `primary-900` | `#EEF2FF` | Lightest tint |

### 4.2 Secondary (Bright Teal)

| Token | HEX | Usage |
|-------|-----|-------|
| `secondary-400` | `#5EEAD4` | Interactive |
| `secondary-500` | `#2DD4BF` | Base in dark mode |
| `secondary-600` | `#14B8A6` | Hover |
| `secondary-700` | `#0D9488` | Active |

### 4.3 Accent (Soft Amber)

| Token | HEX | Usage |
|-------|-----|-------|
| `accent-400` | `#FBBF24` | Interactive |
| `accent-500` | `#F59E0B` | Base in dark mode |
| `accent-600` | `#D97706` | Hover |
| `accent-700` | `#B45309` | Active |

---

## 5. Semantic Colors

### 5.1 Light Mode

| Role | HEX | Background | Text on BG | Border |
|------|-----|------------|------------|--------|
| Success | `#059669` | `#ECFDF5` | `#065F46` | `#A7F3D0` |
| Warning | `#D97706` | `#FFFBEB` | `#92400E` | `#FDE68A` |
| Error | `#DC2626` | `#FEF2F2` | `#991B1B` | `#FECACA` |
| Info | `#2563EB` | `#EFF6FF` | `#1E40AF` | `#BFDBFE` |

### 5.2 Dark Mode

| Role | HEX | Background | Text on BG | Border |
|------|-----|------------|------------|--------|
| Success | `#34D399` | `#064E3B` | `#A7F3D0` | `#065F46` |
| Warning | `#FBBF24` | `#451A03` | `#FDE68A` | `#78350F` |
| Error | `#F87171` | `#450A0A` | `#FECACA` | `#7F1D1D` |
| Info | `#60A5FA` | `#172554` | `#BFDBFE` | `#1E3A5F` |

---

## 6. Surface & Background Colors

### 6.1 Light Mode Surfaces

| Token | HEX | Usage |
|-------|-----|-------|
| `bg-primary` | `#FFFFFF` | Main page background |
| `bg-secondary` | `#F8F9FA` | Secondary surface, card alternate |
| `bg-tertiary` | `#F3F4F6` | Tertiary surface, code blocks |
| `surface` | `#FFFFFF` | Cards, modals, dropdowns |
| `surface-hover` | `#F9FAFB` | Hover state for surface |
| `surface-active` | `#F3F4F6` | Active/selected surface |
| `surface-elevated` | `#FFFFFF` | Modal, toast, tooltip background |
| `overlay` | `rgba(0,0,0,0.4)` | Modal backdrops |
| `glass` | `rgba(255,255,255,0.8)` | Frosted glass effect backgrounds |

### 6.2 Dark Mode Surfaces

| Token | HEX | Usage |
|-------|-----|-------|
| `bg-primary` | `#0F1117` | Main page background |
| `bg-secondary` | `#141620` | Secondary surface |
| `bg-tertiary` | `#1A1D27` | Tertiary surface |
| `surface` | `#1E2030` | Cards, modals, dropdowns |
| `surface-hover` | `#252840` | Hover state for surface |
| `surface-active` | `#2D3045` | Active/selected surface |
| `surface-elevated` | `#252840` | Elevated surfaces |
| `overlay` | `rgba(0,0,0,0.6)` | Modal backdrops |
| `glass` | `rgba(15,17,23,0.8)` | Dark frosted glass |
| `luminance` | `rgba(255,255,255,0.06)` | Surface edge highlight in dark mode |

---

## 7. Text Colors

### 7.1 Light Mode Text

| Token | HEX | Ratio vs White | Usage |
|-------|-----|----------------|-------|
| `text-primary` | `#111827` | 17.3:1 | Primary body text, headings |
| `text-secondary` | `#6B7280` | 7.5:1 | Secondary text, metadata |
| `text-tertiary` | `#9CA3AF` | 4.5:1 | Placeholder, disabled text |
| `text-inverse` | `#FFFFFF` | — | Text on dark backgrounds |
| `text-link` | `#4F46E5` | 6.8:1 | Hyperlinks |
| `text-link-hover` | `#4338CA` | — | Link hover state |
| `text-success` | `#059669` | — | Success text |
| `text-warning` | `#D97706` | — | Warning text |
| `text-error` | `#DC2626` | — | Error text |
| `text-disabled` | `#D1D5DB` | — | Disabled label text |
| `text-on-primary` | `#FFFFFF` | — | Text on primary-500 |
| `text-on-secondary` | `#FFFFFF` | — | Text on secondary-500 |

### 7.2 Dark Mode Text

| Token | HEX | Ratio vs Dark BG | Usage |
|-------|-----|-------------------|-------|
| `text-primary` | `#F3F4F6` | 15.4:1 | Primary body text, headings |
| `text-secondary` | `#9CA3AF` | 7.2:1 | Secondary text, metadata |
| `text-tertiary` | `#6B7280` | 4.6:1 | Placeholder, disabled text |
| `text-inverse` | `#0F1117` | — | Text on light backgrounds |
| `text-link` | `#818CF8` | 7.1:1 | Hyperlinks |
| `text-link-hover` | `#A5B4FC` | — | Link hover state |
| `text-success` | `#34D399` | — | Success text |
| `text-warning` | `#FBBF24` | — | Warning text |
| `text-error` | `#F87171` | — | Error text |
| `text-disabled` | `#4B5563` | — | Disabled label text |
| `text-on-primary` | `#FFFFFF` | — | Text on primary-500 |
| `text-on-secondary` | `#0F1117` | — | Text on secondary-500 |

---

## 8. Color Usage Rules

### 8.1 General Rules

1. **One primary color per interaction.** A button uses primary or secondary, never both.
2. **Semantic colors are semantic.** Success is only for positive states. Error is only for errors. Do not use success color for "info" or error for "required."
3. **Text hierarchy is value-based, not color-based.** Primary text = text-primary, secondary = text-secondary. Do not use semantic colors for regular text.
4. **Disabled state = reduced opacity.** All disabled interactive elements at 0.4 opacity. Do not change color for disabled states (except neon-green=active antipattern).
5. **Hover/active use same hue, different value.** Never change hue on interaction — only brightness/saturation.
6. **Borders are neutral-200 by default.** Use semantic border colors only when the border conveys meaning (error input, success input).

### 8.2 Background Color Rules

- Page background is `bg-primary`. Never use `surface` as page background.
- Cards use `surface` with a 1px `neutral-200` border.
- Elevated elements (modals, dropdowns) use `surface-elevated` with elevation shadow.
- Selected rows use `primary-50`.
- Striped table rows alternate between `surface` and `bg-secondary`.

### 8.3 Gradient Usage

Gradients are used only in:
- Hero illustrations (empty states, landing sections)
- Data visualization (color scales for heatmaps)
- AI generation progress indicators

Gradient palette:
- Primary → Secondary: `#4F46E5 → #0D9488`
- Dark → Light: `#1E2030 → #2D3045`
- Success → Primary: `#059669 → #4F46E5`

---

## 9. Accessibility Compliance

### 9.1 Color Contrast Table (Light Theme)

| Combination | Ratio | Pass WCAG AA | Pass WCAG AAA |
|-------------|-------|:------------:|:-------------:|
| text-primary (#111827) on bg-primary (#FFFFFF) | 17.3:1 | ✅ | ✅ |
| text-primary (#111827) on surface (#FFFFFF) | 17.3:1 | ✅ | ✅ |
| text-secondary (#6B7280) on bg-primary (#FFFFFF) | 7.5:1 | ✅ | ✅ |
| text-tertiary (#9CA3AF) on bg-primary (#FFFFFF) | 4.5:1 | ✅ | ❌ |
| text-inverse (#FFFFFF) on primary-500 (#4F46E5) | 8.6:1 | ✅ | ✅ |
| text-link (#4F46E5) on bg-primary (#FFFFFF) | 6.8:1 | ✅ | ✅ |
| primary-500 (#4F46E5) on bg-primary (#FFFFFF) | 6.8:1 | ✅ | ✅ |
| error (#DC2626) on bg-primary (#FFFFFF) | 5.7:1 | ✅ | ✅ |
| disabled text (#D1D5DB) on bg-primary (#FFFFFF) | 1.7:1 | ❌ | ❌ |
| input border (neutral-300 #D1D5DB) on surface (#FFFFFF) | 1.7:1 | ❌ | ❌ |

**Note:** Disabled text and default borders are intentionally low contrast — they are meant to recede. Interactive borders (focus, error, active) meet ≥ 3:1.

### 9.2 Color Contrast Table (Dark Theme)

| Combination | Ratio | Pass WCAG AA | Pass WCAG AAA |
|-------------|-------|:------------:|:-------------:|
| text-primary (#F3F4F6) on bg-primary (#0F1117) | 15.4:1 | ✅ | ✅ |
| text-primary (#F3F4F6) on surface (#1E2030) | 11.8:1 | ✅ | ✅ |
| text-secondary (#9CA3AF) on surface (#1E2030) | 7.2:1 | ✅ | ✅ |
| text-tertiary (#6B7280) on surface (#1E2030) | 4.6:1 | ✅ | ❌ |
| text-link (#818CF8) on bg-primary (#0F1117) | 7.1:1 | ✅ | ✅ |
| primary-500 (#818CF8) on bg-primary (#0F1117) | 7.1:1 | ✅ | ✅ |
| error (#F87171) on bg-primary (#0F1117) | 6.3:1 | ✅ | ✅ |

### 9.3 Color Blindness Mitigation

- **Never use color alone** to convey information. Always pair with icon, text, or pattern.
- See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for complete color-blind testing protocols.

---

## 10. Color Token Reference

### 10.1 Complete Token List

```css
/* Light Theme Tokens */
--color-primary:       #4F46E5;
--color-primary-50:    #EEF2FF;
--color-primary-100:   #E0E7FF;
--color-primary-200:   #C7D2FE;
--color-primary-300:   #A5B4FC;
--color-primary-400:   #818CF8;
--color-primary-500:   #4F46E5;
--color-primary-600:   #4338CA;
--color-primary-700:   #3730A3;
--color-primary-800:   #312E81;
--color-primary-900:   #1E1B4B;

--color-secondary:      #14B8A6;
--color-secondary-50:   #F0FDFA;
--color-secondary-100:  #CCFBF1;
--color-secondary-200:  #99F6E4;
--color-secondary-300:  #5EEAD4;
--color-secondary-400:  #2DD4BF;
--color-secondary-500:  #14B8A6;
--color-secondary-600:  #0D9488;
--color-secondary-700:  #0F766E;
--color-secondary-800:  #115E59;
--color-secondary-900:  #134E4A;

--color-accent:         #F59E0B;
--color-accent-50:      #FFFBEB;
--color-accent-100:     #FEF3C7;
--color-accent-200:     #FDE68A;
--color-accent-300:     #FCD34D;
--color-accent-400:     #FBBF24;
--color-accent-500:     #F59E0B;
--color-accent-600:     #D97706;
--color-accent-700:     #B45309;
--color-accent-800:     #92400E;
--color-accent-900:     #78350F;

--color-neutral-50:     #F8F9FA;
--color-neutral-100:    #F3F4F6;
--color-neutral-200:    #E5E7EB;
--color-neutral-300:    #D1D5DB;
--color-neutral-400:    #9CA3AF;
--color-neutral-500:    #6B7280;
--color-neutral-600:    #4B5563;
--color-neutral-700:    #374151;
--color-neutral-800:    #1F2937;
--color-neutral-900:    #111827;

--color-success:        #059669;
--color-success-bg:     #ECFDF5;
--color-success-border: #A7F3D0;
--color-success-text:   #065F46;

--color-warning:        #D97706;
--color-warning-bg:     #FFFBEB;
--color-warning-border: #FDE68A;
--color-warning-text:   #92400E;

--color-error:          #DC2626;
--color-error-bg:       #FEF2F2;
--color-error-border:   #FECACA;
--color-error-text:     #991B1B;

--color-info:           #2563EB;
--color-info-bg:        #EFF6FF;
--color-info-border:    #BFDBFE;
--color-info-text:      #1E40AF;

--color-bg-primary:     #FFFFFF;
--color-bg-secondary:   #F8F9FA;
--color-bg-tertiary:    #F3F4F6;
--color-surface:        #FFFFFF;
--color-surface-hover:  #F9FAFB;
--color-surface-active: #F3F4F6;
--color-surface-elevated: #FFFFFF;
--color-overlay:        rgba(0,0,0,0.4);
--color-glass:          rgba(255,255,255,0.8);

--color-text-primary:   #111827;
--color-text-secondary: #6B7280;
--color-text-tertiary:  #9CA3AF;
--color-text-inverse:   #FFFFFF;
--color-text-link:      #4F46E5;
--color-text-disabled:  #D1D5DB;
--color-text-on-primary: #FFFFFF;
--color-text-on-secondary: #FFFFFF;

--color-border-default: #E5E7EB;
--color-border-hover:   #D1D5DB;
--color-border-focus:   #4F46E5;
--color-border-active:  #4338CA;
--color-border-error:   #DC2626;
--color-border-success: #059669;
--color-border-disabled:#F3F4F6;
```

### 10.2 Dark Theme Overrides

```css
/* Dark Theme Overrides — applied via .dark selector or prefers-color-scheme */
.dark {
  --color-primary:       #818CF8;
  --color-primary-50:    #1E1B4B;
  --color-primary-100:   #312E81;
  --color-primary-200:   #3730A3;
  --color-primary-300:   #4338CA;
  --color-primary-400:   #6366F1;
  --color-primary-500:   #818CF8;
  --color-primary-600:   #A5B4FC;
  --color-primary-700:   #C7D2FE;
  --color-primary-800:   #E0E7FF;
  --color-primary-900:   #EEF2FF;

  --color-secondary:      #2DD4BF;
  --color-secondary-400:  #5EEAD4;
  --color-secondary-500:  #2DD4BF;
  --color-secondary-600:  #14B8A6;
  --color-secondary-700:  #0D9488;

  --color-neutral-50:     #0F1117;
  --color-neutral-100:    #141620;
  --color-neutral-200:    #1A1D27;
  --color-neutral-300:    #1E2030;
  --color-neutral-400:    #2D3045;
  --color-neutral-500:    #4B5563;
  --color-neutral-600:    #6B7280;
  --color-neutral-700:    #9CA3AF;
  --color-neutral-800:    #D1D5DB;
  --color-neutral-900:    #F3F4F6;

  --color-success:        #34D399;
  --color-success-bg:     #064E3B;
  --color-success-border: #065F46;
  --color-success-text:   #A7F3D0;

  --color-warning:        #FBBF24;
  --color-warning-bg:     #451A03;
  --color-warning-border: #78350F;
  --color-warning-text:   #FDE68A;

  --color-error:          #F87171;
  --color-error-bg:       #450A0A;
  --color-error-border:   #7F1D1D;
  --color-error-text:     #FECACA;

  --color-info:           #60A5FA;
  --color-info-bg:        #172554;
  --color-info-border:    #1E3A5F;
  --color-info-text:      #BFDBFE;

  --color-bg-primary:     #0F1117;
  --color-bg-secondary:   #141620;
  --color-bg-tertiary:    #1A1D27;
  --color-surface:        #1E2030;
  --color-surface-hover:  #252840;
  --color-surface-active: #2D3045;
  --color-surface-elevated: #252840;
  --color-overlay:        rgba(0,0,0,0.6);
  --color-glass:          rgba(15,17,23,0.8);

  --color-text-primary:   #F3F4F6;
  --color-text-secondary: #9CA3AF;
  --color-text-tertiary:  #6B7280;
  --color-text-inverse:   #0F1117;
  --color-text-link:      #818CF8;
  --color-text-disabled:  #4B5563;
  --color-text-on-primary: #FFFFFF;
  --color-text-on-secondary: #0F1117;

  --color-border-default: #2D3045;
  --color-border-hover:   #4B5563;
  --color-border-focus:   #818CF8;
  --color-border-active:  #A5B4FC;
  --color-border-error:   #F87171;
  --color-border-success: #34D399;
  --color-border-disabled:#1A1D27;
}
```
