# Component Library

> **Part of:** Atlas AI Enterprise Design System v1.0  
> **Status:** Production Ready  
> **Component Count:** 94

---

## Table of Contents

1. [PRIMITIVES](#1-primitives)
   - 1.1 Avatar
   - 1.2 Badge
   - 1.3 Button
   - 1.4 Checkbox
   - 1.5 Icon
   - 1.6 Input
   - 1.7 Label
   - 1.8 Link
   - 1.9 Progress
   - 1.10 Radio
   - 1.11 Select
   - 1.12 Separator
   - 1.13 Slider
   - 1.14 Spinner
   - 1.15 Switch
   - 1.16 Textarea
2. [DATA DISPLAY](#2-data-display)
   - 2.1 Table
   - 2.2 Data Grid
   - 2.3 Card
   - 2.4 Stat
   - 2.5 Metric
   - 2.6 Timeline
   - 2.7 Avatar Group
   - 2.8 Tag
   - 2.9 Code Block
   - 2.10 KBD
   - 2.11 Description List
   - 2.12 Tree View
3. [FEEDBACK](#3-feedback)
   - 3.1 Alert
   - 3.2 Banner
   - 3.3 Toast
   - 3.4 Snackbar
   - 3.5 Progress Bar
   - 3.6 Skeleton
   - 3.7 Empty State
   - 3.8 Error State
   - 3.9 Loading State
4. [NAVIGATION](#4-navigation)
   - 4.1 Top Bar
   - 4.2 Sidebar
   - 4.3 Breadcrumb
   - 4.4 Tabs
   - 4.5 Stepper
   - 4.6 Pagination
   - 4.7 Bottom Tab Bar
   - 4.8 Command Palette
   - 4.9 Navigation Menu
   - 4.10 Dropdown Menu
5. [OVERLAYS](#5-overlays)
   - 5.1 Modal
   - 5.2 Dialog
   - 5.3 Bottom Sheet
   - 5.4 Drawer
   - 5.5 Tooltip
   - 5.6 Popover
   - 5.7 Hover Card
   - 5.8 Context Menu
6. [SURFACES](#6-surfaces)
   - 6.1 Card
   - 6.2 Collapsible
   - 6.3 Accordion
   - 6.4 Panel
   - 6.5 Section
   - 6.6 Divider
   - 6.7 Fieldset
7. [FORMS](#7-forms)
   - 7.1 Form
   - 7.2 Input Group
   - 7.3 Input Addon
   - 7.4 Combobox
   - 7.5 Multi Select
   - 7.6 Date Picker
   - 7.7 Time Picker
   - 7.8 Color Picker
   - 7.9 File Upload
   - 7.10 Rating
   - 7.11 Toggle Group
   - 7.12 Button Group
   - 7.13 OTP Input
8. [AI COMPONENTS](#8-ai-components)
   - 8.1 AI Chat
   - 8.2 AI Prompt Input
   - 8.3 AI Response Block
   - 8.4 Model Selector
   - 8.5 Token Counter
   - 8.6 Cost Indicator
   - 8.7 Confidence Indicator
   - 8.8 AI Suggestion
   - 8.9 Citation Block
   - 8.10 Workflow Canvas
   - 8.11 AI Trace
   - 8.12 Permission Gate
9. [DATA VIS](#9-data-vis)
   - 9.1 Line Chart
   - 9.2 Bar Chart
   - 9.3 Area Chart
   - 9.4 Pie Chart
   - 9.5 Donut Chart
   - 9.6 Heatmap
   - 9.7 KPI Card
   - 9.8 Gauge
   - 9.9 Sparkline
   - 9.10 Funnel
10. [COMPOSITE](#10-composite)
    - 10.1 Page Header
    - 10.2 Search Bar
    - 10.3 Filter Bar
    - 10.4 Action Bar
    - 10.5 Data Table
    - 10.6 CRUD Page
    - 10.7 Settings Page
    - 10.8 Onboarding Flow
    - 10.9 Wizard
    - 10.10 Kanban Board
    - 10.11 Notification Center
    - 10.12 Activity Feed
    - 10.13 Audit Log Viewer
    - 10.14 API Key Manager

---

## 1. PRIMITIVES

### 1.1 Avatar

**Purpose:** Represents a user or entity.

**Variants:**
| Variant | Size | Description |
|---------|------|-------------|
| `xs` | 24×24px | Inline with text |
| `sm` | 32×32px | List items |
| `md` | 40×40px | **Default** — comments, profiles |
| `lg` | 48×48px | Profile header |
| `xl` | 64×64px | Account page |
| `2xl` | 96×96px | Empty states, large profiles |

**States:** Default, Hover (cursor pointer), Focus (ring)

**Content:** Image, initials (2 letters max), or fallback icon (user)

**Behavior:**
- Image loads first, initials as fallback, icon as last resort
- If clickable, wraps in a button with aria-label
- Badge can be overlaid at bottom-right (status indicator)

**Specs:**
```
Shape: 100% rounded (circle)
Border: 2px solid surface (to overlap with backgrounds)
Font: 14px SemiBold for md, scales proportionally
Focus: 2px primary-500 ring with 2px offset
Badge: 12px circle, positioned bottom-right, 2px border matching surface
```

### 1.2 Badge

**Purpose:** Displays count, status, or label on another component.

**Variants:**
| Variant | Purpose | Color |
|---------|---------|-------|
| `default` | Generic count | primary-500 |
| `success` | Positive status | success |
| `warning` | Warning status | warning |
| `error` | Error/critical | error |
| `info` | Informational | info |
| `neutral` | Neutral count | neutral-500 |
| `outline` | Subtle indicator | border + text |

**Sizes:**
| Size | Height | Font | Padding |
|------|--------|------|---------|
| `sm` | 18px | 11px SemiBold | 0 6px |
| `md` | 20px | 12px SemiBold | 0 8px |
| `lg` | 24px | 14px SemiBold | 0 10px |

**States:** Default only (badges are non-interactive)

**Placement:**
```
Standalone:    inline with text
Dot:           8×8px circle, no text
Icon badge:    overlays top-right of icon (position absolute)
Count badge:   overlays top-right, shows number or "+N"
```

### 1.3 Button

**Purpose:** Triggers an action when clicked.

**Variants:**
| Variant | Background | Border | Text | Hover | Active | Usage |
|---------|------------|--------|------|-------|--------|-------|
| **Primary** | primary-500 | — | white | primary-600 | primary-700 | Main CTA |
| **Secondary** | transparent | neutral-300 | text-primary | bg-neutral-50 | bg-neutral-100 | Alternative action |
| **Ghost** | transparent | — | text-secondary | bg-neutral-100 | bg-neutral-200 | Minimal actions |
| **Destructive** | error | — | white | error-600 | error-700 | Delete, remove |
| **Outline** | transparent | primary-500 | primary-500 | bg-primary-50 | bg-primary-100 | Secondary CTA |
| **Link** | transparent | — | primary-500 | underline | — | Text link style |
| **Icon** | transparent | — | text-secondary | bg-neutral-100 | bg-neutral-200 | Icon-only action |

**Sizes:**
| Size | Height | Padding H | Font | Icon Size | Gap |
|------|--------|-----------|------|-----------|-----|
| `xs` | 28px | 10px | 12px SemiBold | 14px | 6px |
| `sm` | 32px | 12px | 13px SemiBold | 16px | 6px |
| `md` | 40px | 16px | 14px SemiBold | 18px | 8px |
| `lg` | 48px | 20px | 16px SemiBold | 20px | 10px |
| `xl` | 56px | 24px | 18px SemiBold | 22px | 12px |

**States:** Default, Hover, Active (scale 0.97), Focus (ring), Disabled (opacity 0.4), Loading (replace icon with spinner)

**Full width:** `width: 100%` prop available on all variants.

**Icon position:** left (default) or right (for chevron, external link).

### 1.4 Checkbox

**Purpose:** Binary selection — multiple choices.

**Variants:** `default`, `indeterminate`

**Sizes:**
| Size | Box | Indicator |
|------|-----|-----------|
| `sm` | 14×14px | 10px check |
| `md` | 18×18px | 14px check |

**States:**
```
Unchecked:   1px neutral-300 border, transparent bg
Checked:     primary-500 bg, white check icon
Indeterminate: primary-500 bg, white minus icon
Hover:       border neutral-400 (unchecked), primary-600 (checked)
Focus:       ring primary-500
Disabled:    opacity 0.4
Error:       border error
```

**Label:** Right of checkbox, 14px Regular, selectable on label click.

### 1.5 Icon

**Purpose:** Displays a Lucide icon with consistent sizing.

**Specification:** See [ICONOGRAPHY_SYSTEM.md](./ICONOGRAPHY_SYSTEM.md).

### 1.6 Input

**Purpose:** Text input field.

**Variants:**
| Variant | Border | Radius | Usage |
|---------|--------|--------|-------|
| `outlined` | 1px neutral-300 | 8px | Default |
| `filled` | 1px transparent, bg-neutral-100 | 8px | Alternate |

**Sizes:**
| Size | Height | Font | Padding H |
|------|--------|------|-----------|
| `sm` | 32px | 14px | 10px |
| `md` | 40px | 14px | 12px |
| `lg` | 48px | 16px | 14px |

**States:**
```
Default:     border neutral-300, bg white
Hover:       border neutral-400
Focus:       border primary-500, ring 2px primary-500/20
Filled:      14px Regular text-primary
Placeholder: 14px Regular text-tertiary
Disabled:    bg-neutral-50, opacity 0.4
Error:       border error, ring error/20
Read-only:   bg-neutral-50, no focus
Success:     border success
```

**Add-ons:** Left (icon, label, button), Right (icon, clear button, toggle visibility, button).

**Prefix/Suffix:** Text or icon inside input before/after cursor.

### 1.7 Label

**Purpose:** Describes a form field.

**Specs:**
```
Font: 14px Medium
Color: text-primary (default), text-secondary (optional)
Margin bottom: 6px
Required indicator: "*" in error color, 14px
Optional indicator: "(optional)" in text-secondary, 12px
Disabled: text-disabled
```

### 1.8 Link

**Purpose:** Navigates to a URL or triggers inline action.

**Variants:** `default` (primary-500), `muted` (text-secondary), `subtle` (inherit color, underline on hover)

**States:**
```
Default:     color primary-500, no underline
Hover:       underline, color primary-600
Focus:       ring primary-500
Visited:     primary-700 (optional)
Disabled:    opacity 0.4
```

**Inline link:** Inherits font size of surrounding text. Underline on hover. `Medium` weight.

### 1.9 Progress

**Purpose:** Shows indeterminate progress.

**Specs:**
```
Height: 4px
Background: neutral-200
Indicator: primary-500
Animation: linear infinite, left-to-right sweep
Duration: 1.5s per cycle
Border radius: 2px
```

### 1.10 Radio

**Purpose:** Single selection from multiple options.

**Sizes:**
| Size | Outer Circle | Inner Dot |
|------|-------------|-----------|
| `sm` | 14×14px | 6×6px |
| `md` | 18×18px | 8×8px |

**States:**
```
Unselected:  1px neutral-300 border
Selected:    1px primary-500 border, primary-500 dot
Hover:       border neutral-400 (unselected)
Focus:       ring primary-500
Disabled:    opacity 0.4
Error:       border error
```

**Group:** Vertical stack by default. Horizontal row for 2–3 options. 12px gap between items.

### 1.11 Select

**Purpose:** Choose one option from a dropdown list.

**Variants:** `default`, `multiple`

**Behavior:**
```
Trigger:     Click to open dropdown
Dropdown:    Max 320px height, scroll if overflow
Selection:   Shows selected value in trigger
Placeholder: "Select..." in text-tertiary
Search:      Type to filter options (for 10+ items)
Clear:       X button when value is selected
Keyboard:    Arrow keys to navigate, Enter to select, Esc to close
```

**States:** Same as Input (Default, Hover, Focus, Disabled, Error).

**Dropdown specs:**
```
Background: surface
Border: 1px neutral-300
Radius: 8px
Shadow: elevation-2
Padding: 4px
Item height: 36px
Item padding: 8px 12px
Item hover: bg-neutral-100
Item selected: bg-primary-50
Item active: bg-primary-50, text-primary-500
Max height: 280px (shows ~7 items)
Z-index: 100
```

### 1.12 Separator

**Purpose:** Separates content sections.

**Variants:** `horizontal`, `vertical`

**Specs:**
```
Horizontal: height 1px, width 100%, bg-neutral-200
Vertical:   width 1px, height 100%, bg-neutral-200
With label: text-secondary, 12px Medium, centered, 24px padding sides
```

### 1.13 Slider

**Purpose:** Select a value from a range.

**Specs:**
```
Track height: 4px
Thumb size: 18×18px
Thumb shape: circle
Thumb bg: white
Thumb border: 2px primary-500
Active track: primary-500
Inactive track: neutral-200
```

**States:**
```
Default:     track neutral-200, thumb primary-500
Hover:       thumb primary-600
Focus:       ring primary-500 on thumb
Disabled:    opacity 0.4
Dragging:    thumb primary-700, scale 1.1
```

**Variants:** `single` (one thumb), `range` (two thumbs), `step` (snap to values).

### 1.14 Spinner

**Purpose:** Indicates loading.

**Sizes:** 16px, 20px, 24px, 32px, 40px, 48px

**Specs:**
```
Shape: Circle with arc
Stroke: 2px (proportional to size)
Colors:
  - Primary: primary-500
  - White: white (on dark backgrounds)
  - Muted: neutral-300 (background track)
Animation: rotate 360° continuously, 0.8s per rotation
```

### 1.15 Switch

**Purpose:** Binary toggle.

**Specs:**
```
Width: 40px
Height: 22px
Track radius: 11px (full)
Thumb size: 18×18px
Thumb color: white
```

**States:**
```
Off:         track neutral-300
On:          track primary-500
Hover off:   track neutral-400
Hover on:    track primary-600
Focus:       ring primary-500
Disabled:    opacity 0.4
```

**Label:** Left of switch, 14px Regular. Optional description below.

### 1.16 Textarea

**Purpose:** Multi-line text input.

**Specs:**
```
Min height: 80px (2 lines)
Max height: 320px (grows automatically)
Padding: 12px
Resize: vertical only (or disabled)
Font: 14px Regular (input), 14px (text)
Line height: 1.5
```

**States:** Same as Input.

**Character count:** Bottom-right, 12px Regular, text-tertiary. Warning color at 80%, error color at 100%.

---

## 2. DATA DISPLAY

### 2.1 Table

**Purpose:** Structured data display.

**Specs:**
```
Header height: 44px
Row height: 56px (comfortable) / 40px (compact)
Font: 14px Regular
Header font: 12px SemiBold uppercase
Header color: text-secondary
Cell padding: 16px horizontal
Border: 1px neutral-200 bottom on rows
Radius: 8px (outer container)
```

**Variants:**
| Variant | Description |
|---------|-------------|
| `default` | Bordered rows, no stripe |
| `striped` | Alternating row bg |
| `bordered` | Full grid borders |
| `borderless` | Minimal rows |

**Features:**
```
Sort: Click header to sort. Sort icon appears on hover/active.
Selection: Checkbox column on left. Shift+click for range.
Expand: Row expansion for detail view.
Sticky header: Header sticks on scroll.
Column resize: Drag column edge to resize (min 80px).
Empty: Show empty state when no data.
Loading: Skeleton rows (3-5) during loading.
```

### 2.2 Data Grid

**Purpose:** High-density data display with advanced features.

**Extends Table with:**
```
Virtual scrolling: 10,000+ row support
Column grouping: Multi-level headers
Column pinning: Left/right pin columns
Row grouping: Group by column values
Inline editing: Click cell to edit
Cell formatting: Conditional, progress bars, badges
Export: CSV, Excel, JSON
Aggregation: Footer row with sums/counts
```

### 2.3 Card

**Purpose:** Container for grouped content.

**Variants:**
| Variant | Border | Shadow | Radius | Usage |
|---------|--------|--------|--------|-------|
| `default` | 1px neutral-200 | none | 8px | Standard card |
| `elevated` | none | elevation-1 | 8px | Hoverable, featured |
| `outline` | 1px neutral-200 | none | 8px | Form sections |
| `flat` | none | none | 0px | Nested sections |
| `interactive` | 1px neutral-200 | none | 8px | Clickable card |

**Specs:**
```
Padding: 16px (default), 24px (large)
Header: 16px padding, 16px bottom margin
Footer: 16px padding, 12px top border, 16px top margin
Image top: Full width, 200px height
Gap between sections: 8px
```

**States (interactive):**
```
Default:    border neutral-200
Hover:      border neutral-300, shadow elevation-1
Focus:      ring primary-500
Active:     bg-neutral-50
Selected:   border primary-500, bg-primary-50
Disabled:   opacity 0.5
```

### 2.4 Stat

**Purpose:** Displays a single statistic with label.

**Specs:**
```
Label: 14px Regular, text-secondary
Value: 30px Bold, text-primary
Trend: 12px Medium, up (success), down (error), flat (text-secondary)
Icon: 20px, above or left of value
Padding: 16px
```

### 2.5 Metric

**Purpose:** KPI display with trend and context.

**Extends Stat with:**
```
Trend indicator: up/down arrow + percentage
Subtitle: 12px Regular, text-tertiary
Sparkline: 64×24px inline mini chart
Comparison: "vs last period" label
```

### 2.6 Timeline

**Purpose:** Chronological event display.

**Specs:**
```
Line: 2px wide, neutral-200, vertical
Dot: 12px circle, primary-500 (active) / neutral-300 (inactive)
Item padding: 0 0 24px 16px (from line)
Title: 14px SemiBold
Description: 14px Regular, text-secondary
Time: 12px Regular, text-tertiary
```

### 2.7 Avatar Group

**Purpose:** Shows multiple related avatars.

**Specs:**
```
Overlap: -8px (avatars overlap by 8px)
Max visible: 5 (rest shown as +N)
Border: 2px white (cuts into overlap)
Tooltip: Hover shows names
Click: Expand to full list
```

### 2.8 Tag

**Purpose:** Labels, categories, metadata.

**Variants:**
| Variant | Background | Border | Usage |
|---------|------------|--------|-------|
| `default` | neutral-100 | — | Generic |
| `primary` | primary-50 | primary-200 | Status |
| `success` | success-bg | success-border | Positive |
| `warning` | warning-bg | warning-border | Pending |
| `error` | error-bg | error-border | Critical |
| `info` | info-bg | info-border | Informational |
| `outline` | transparent | neutral-300 | Subtle |

**Sizes:**
| Size | Height | Font | Padding | Icon Size |
|------|--------|------|---------|-----------|
| `sm` | 20px | 11px Medium | 0 6px | 12px |
| `md` | 24px | 12px Medium | 0 8px | 14px |
| `lg` | 28px | 13px Medium | 0 10px | 16px |

**States:** Default, Dismissible (X button), Removable (with transition).

### 2.9 Code Block

**Purpose:** Displays formatted code.

**See:** [TYPOGRAPHY_SYSTEM.md §9.1](./TYPOGRAPHY_SYSTEM.md)

**Features:**
```
Syntax highlighting: Supported for 20+ languages
Copy button: Top-right corner
Language label: Top-left corner
Line numbers: Optional left gutter
Wrap: Optional text wrapping
```

### 2.10 KBD

**Purpose:** Keyboard shortcut display.

**Specs:**
```
Font: 11px Medium (monospace preferred)
Padding: 2px 6px
Background: neutral-100
Border: 1px neutral-300 (bottom 2px for depth)
Radius: 4px
Color: text-secondary
```

### 2.11 Description List

**Purpose:** Key-value metadata display.

**Specs:**
```
Layout: Horizontal (dt/dd inline) or vertical (stacked)
Term: 12px Medium, text-secondary, uppercase
Value: 14px Regular, text-primary
Gap: 4px between term/value, 12px between items
```

### 2.12 Tree View

**Purpose:** Hierarchical data navigation.

**Specs:**
```
Indent: 16px per level
Item height: 32px
Expand icon: 12px chevron, rotates 90° on expand
Icon size: 16px
Font: 14px Regular
Hover: bg-neutral-100
Selected: bg-primary-50, text-primary-600
Drag: Drag handle on hover
```

---

## 3. FEEDBACK

### 3.1 Alert

**Purpose:** In-page status message.

**Variants:** `success`, `warning`, `error`, `info`, `neutral`

**Specs:**
```
Layout: Icon + Message + Optional action + Close
Padding: 12px 16px
Radius: 8px
Border: 1px (left-4px accent stripe)
Icon: 20px, left
Message: 14px Regular
Action: Link or ghost button
Close: 16px X button
```

**Dismiss:** Close button or programmatic. Optional auto-dismiss.

### 3.2 Banner

**Purpose:** System-wide announcement at top of page.

**Specs:**
```
Height: 40px (auto, with text)
Width: 100%
Background: primary-500 (or semantic)
Color: white
Font: 14px Medium
Action: Inline link, white underline
Close: Right side, white X, 16px
Z-index: 110
```

### 3.3 Toast

**Purpose:** Transient notification, auto-dismisses.

**Variants:** `success`, `error`, `warning`, `info`, `loading`

**Specs:**
```
Layout: Icon + Message + Action + Close
Width: 400px max
Padding: 12px 16px
Radius: 8px
Shadow: elevation-3
Position: Bottom-right (desktop), top (mobile)
Auto-dismiss: 4s (info, success) / 8s (warning, error)
Animation: Slide in from right, fade out
Stack: Vertical stack, 8px gap, max 3 visible
Z-index: 300
```

### 3.4 Snackbar

**Purpose:** Action confirmation with optional undo.

**Difference from Toast:** Persistent until action taken.

**Specs:**
```
Layout: Message + Action button
Width: 480px max
Position: Bottom-center
Padding: 12px 24px
Radius: 8px
Duration: 6s auto-dismiss (or until action)
Action: "Undo" or custom text, semi-bold white
```

### 3.5 Progress Bar

**Purpose:** Shows determinate progress.

**Specs:**
```
Height: 8px (default), 4px (thin), 12px (thick)
Background: neutral-200
Fill: primary-500 (default), success (positive), error (negative)
Radius: 4px (match height/2)
Label: Optional percentage text, right of bar, 12px SemiBold
Animation: Smooth transition on value change (300ms ease)
Indeterminate: Stripe animation when value unknown
```

### 3.6 Skeleton

**Purpose:** Placeholder loading state.

**Specs:**
```
Background: neutral-200
Highlight: neutral-100
Animation: Shimmer (left-to-right sweep, 1.5s)
Radius: 4px (text), 8px (card), 100% (avatar)
```

**Templates:**
```
Text line: height 14px, width varies (100%, 75%, 60%)
Avatar: circle, 40×40px
Card: 200×280px rectangle
Table row: 40px height, full width
Chart: 200×120px with wave pattern
```

### 3.7 Empty State

**Purpose:** Guides user when no content exists.

**Specs:**
```
Layout: Center aligned, vertical stack
Icon: 64px, neutral-300
Title: 20px SemiBold, text-primary
Description: 14px Regular, text-secondary, max 360px wide
Action: Primary button (optional)
Padding: 80px top/bottom (desktop), 48px (mobile)
```

### 3.8 Error State

**Purpose:** Communicates errors gracefully.

**Specs:**
```
Layout: Center aligned
Icon: 48px, error
Title: 18px SemiBold, text-primary
Description: 14px Regular, text-secondary
Actions: "Try Again" (primary) + "Contact Support" (ghost)
Error ID: 12px Regular, text-tertiary (bottom)
```

### 3.9 Loading State

**Purpose:** Indicates content loading.

**Specs:**
```
Layout: Centered spinner + optional text
Spinner: 32px (default), 24px (inline)
Text: 14px Regular, text-secondary
Delay: Show after 300ms (instant response within 300ms = no loader)
Overlay: Semi-transparent overlay for full-page loading
```

---

## 4. NAVIGATION

### 4.1 Top Bar

**Purpose:** Primary navigation header.

**Specs:**
```
Height: 56px (desktop), 48px (tablet), 44px (mobile)
Background: surface
Border bottom: 1px neutral-200
Padding: 0 16px
Z-index: 100
```

**Sections (left to right):**
```
Left:   Menu toggle (mobile) / Logo + Breadcrumb (desktop)
Center: Search bar (desktop, max 480px)
Right:  Icon buttons (Help, Notifications, Settings) + User avatar
```

### 4.2 Sidebar

**Purpose:** Persistent navigation panel.

**Specs (expanded):**
```
Width: 240px
Background: bg-secondary
Border right: 1px neutral-200
Padding: 8px
Overflow: auto (scroll internal)
Z-index: 90
```

**Specs (collapsed):**
```
Width: 52px
Icons only, centered
Tooltip on hover
```

**Sections:**
```
Top:    Logo + App name (expanded) / Icon (collapsed)
Middle: Navigation items (grouped)
Bottom: User section + Settings + Help
```

### 4.3 Breadcrumb

**Purpose:** Shows current page location in hierarchy.

**Specs:**
```
Font: 14px Regular
Separator: chevron-right icon, 14px, text-tertiary
Links: text-secondary on default, text-primary on hover
Active: text-primary (last item)
Padding: 12px 0
```

### 4.4 Tabs

**Purpose:** Switch between related content sections.

**Variants:**
| Variant | Indicator | Usage |
|---------|-----------|-------|
| `underline` | 2px bottom border | Default |
| `pill` | Filled background | Settings |
| `icon` | Icon only | Mobile |
| `segment` | Segmented control | Toolbar |

**Specs (underline default):**
```
Height: 40px
Font: 14px Medium
Gap: 0px (adjacent)
Padding: 0 16px
Active: text-primary, 2px primary-500 bottom border
Inactive: text-secondary
Hover: bg-neutral-100
Focus: ring primary-500
Scroll: horizontal scroll on overflow
```

### 4.5 Stepper

**Purpose:** Multi-step process progress.

**Specs:**
```
Step indicator: 32px circle, 14px SemiBold
Completed: primary-500 bg, white checkmark
Active: primary-500 border, primary-500 text
Pending: neutral-300 border, text-tertiary
Error: error border, error text
Connector: 2px line, neutral-200 (pending), primary-500 (completed)
Label: 12px Medium below step
Layout: Horizontal (desktop), Vertical (mobile)
```

### 4.6 Pagination

**Purpose:** Navigate through pages of content.

**Specs:**
```
Item size: 36×36px
Radius: 8px
Font: 14px SemiBold
Gap: 2px
Active: primary-500 bg, white text
Inactive: transparent, text-secondary
Hover: bg-neutral-100
Disabled: opacity 0.4
```

**Variants:**
```
Default: 1 2 3 ... 8 9 10
Simple: Previous | Next
Compact: Page 1 of 10 (with arrows)
```

### 4.7 Bottom Tab Bar

**Purpose:** Mobile primary navigation.

**Specs:**
```
Height: 56px (including safe area)
Background: surface
Border top: 1px neutral-200
Max tabs: 5
Z-index: 100
```

**Tab item:**
```
Icon: 24px (outlined default, filled active)
Label: 10px Medium
Active: primary-500 color
Inactive: text-tertiary
Padding: 4px top
```

### 4.8 Command Palette

**Purpose:** Universal search and command execution.

**Specs:**
```
Width: 640px (desktop), 90vw (mobile)
Max height: 480px
Position: Center of screen, top 20%
Trigger: Cmd+K (Mac), Ctrl+K (Windows/Linux)
Background: surface-elevated
Border: 1px neutral-200
Shadow: elevation-4
Radius: 12px
Z-index: 300
```

**Sections:**
```
Search input: 48px height, 16px padding, search icon
Results list: Scrollable, grouped by category
Item height: 40px
Item padding: 8px 16px
Shortcut hint: Right side, KBD component
No results: Empty state
```

### 4.9 Navigation Menu

**Purpose:** Dropdown navigation from a nav item.

**Specs:**
```
Width: 240px
Padding: 4px
Item height: 36px
Item padding: 8px 12px
Font: 14px Regular
Icon: 16px left
Shortcut: 12px right, text-tertiary
Group header: 12px Medium uppercase, text-tertiary, 8px padding
Divider: 4px margin
```

### 4.10 Dropdown Menu

**Purpose:** Action menu from a trigger.

**Specs:** Same as Navigation Menu.

**Variants:**
```
Default: Click to open, click outside to close
Hover: Hover to open (desktop only)
Context: Right-click to open
```

---

## 5. OVERLAYS

### 5.1 Modal

**Purpose:** Critical content that requires attention.

**Specs:**
```
Width: 480px (default), 640px (large), 400px (small)
Max height: 80vh
Radius: 12px
Background: surface-elevated
Shadow: elevation-2
Overlay: rgba(0,0,0,0.4), z-index 200
Padding: 24px
Animation: Fade in (200ms) + Scale from 0.95
Close: Esc key, X button, click outside (if dismissable)
```

**Sections:**
```
Header: 18px SemiBold + Description 14px Regular
Body: Scrollable if content overflows
Footer: Right-aligned buttons, 12px gap
```

### 5.2 Dialog

**Purpose:** Confirmation or simple action.

**Similar to Modal but:**
```
Smaller: 400px width
Simpler: No scroll, minimal content
Dismiss: Must click action button (Esc optional)
```

### 5.3 Bottom Sheet

**Purpose:** Mobile action sheet or selection.

**Specs:**
```
Max height: 70vh
Min height: 100px
Radius: 16px top
Background: surface-elevated
Drag: Drag handle (32px wide, 4px tall, neutral-300)
Animation: Slide up from bottom (300ms ease-out)
Overlay: rgba(0,0,0,0.4)
```

### 5.4 Drawer

**Purpose:** Side panel with additional content.

**Specs:**
```
Width: 400px (default), 320px (narrow), 640px (wide)
Position: Right (default), Left
Background: surface-elevated
Shadow: elevation-2 left side
Overlay: rgba(0,0,0,0.3)
Animation: Slide from side (250ms ease-out)
Padding: 24px
```

### 5.5 Tooltip

**Purpose:** Short contextual help text.

**Specs:**
```
Font: 12px Regular
Padding: 6px 10px
Background: neutral-800 (light) / neutral-100 (dark)
Color: white (light) / text-primary (dark)
Radius: 6px
Shadow: elevation-1
Max width: 240px
Arrow: 6px triangle, pointing to trigger
Trigger: Hover (300ms delay) or Focus
Dismiss: 1s after cursor leaves
```

### 5.6 Popover

**Purpose:** Rich contextual content.

**Specs:**
```
Width: 320px (default), 240px (small), 400px (large)
Background: surface-elevated
Border: 1px neutral-200
Shadow: elevation-2
Radius: 8px
Padding: 16px
Arrow: 12px triangle, pointing to trigger
Trigger: Click
Dismiss: Click outside, Esc
```

### 5.7 Hover Card

**Purpose:** Preview content on hover.

**Specs:**
```
Width: 320px
Delay show: 500ms
Delay hide: 300ms
Content: Preview, summary, actions
Similar to Popover but hover-triggered
```

### 5.8 Context Menu

**Purpose:** Right-click action menu.

**Specs:**
```
Same as Dropdown Menu
Trigger: Right-click (contextmenu event)
Position: At cursor position
Max visible items: 15 (scroll beyond)
```

---

## 6. SURFACES

### 6.1 Card (repeated reference)

**Already specified in §2.3.**

### 6.2 Collapsible

**Purpose:** Expandable/collapsible content section.

**Specs:**
```
Trigger: 14px Medium, chevron icon rotates 180°
Padding: 12px 16px
Content padding: 0 16px 16px
Animation: Height transition (200ms ease)
```

### 6.3 Accordion

**Purpose:** Multiple collapsible sections, only one open.

**Specs:**
```
Same as Collapsible but single-open behavior
Connected: Sections touch (no gap)
Border between: 1px neutral-200
```

### 6.4 Panel

**Purpose:** Resizable content panel (split view).

**Specs:**
```
Divider: 4px wide, neutral-200, hover primary-500
Cursor: col-resize (horizontal), row-resize (vertical)
Min size: 200px
Max size: 80% of container
Collapse: Double-click divider to collapse
```

### 6.5 Section

**Purpose:** Visual grouping of related form controls.

**Specs:**
```
Title: 16px SemiBold, 12px bottom margin
Description: 14px Regular, text-secondary, 16px bottom margin
Padding: 24px
Border: 1px neutral-200
Radius: 8px
Background: surface
```

### 6.6 Divider

**Same as Separator (§1.12).**

### 6.7 Fieldset

**Purpose:** Groups related form fields.

**Specs:**
```
Border: 1px neutral-200
Radius: 8px
Padding: 24px (top: 16px for legend)
Legend: 14px SemiBold, text-primary, padding 0 8px
Background: transparent
```

---

## 7. FORMS

### 7.1 Form

**Purpose:** Data collection container.

**Specs:**
```
Layout: Vertical stack
Field gap: 20px
Section gap: 32px
Max width: 640px (single column), 960px (two column)
Submit button: Left-aligned (not centered)
```

### 7.2 Input Group

**Purpose:** Groups label, input, and helper text.

**Specs:**
```
Label: top, 14px Medium, 6px margin bottom
Input: 40px height (default)
Helper text: bottom, 12px Regular, text-tertiary, 4px margin top
Error text: bottom, 12px Regular, error, 4px margin top
```

### 7.3 Input Addon

**Purpose:** Side content in input (icon, button, text).

**Specs:**
```
Left addon: icon or text, 40px width, neutral-100 bg
Right addon: icon or button, 32px width (icon) or auto
Border radius: Input has radius on outer edges, addon merges seamlessly
```

### 7.4 Combobox

**Purpose:** Autocomplete input with dropdown options.

**Specs:**
```
Input: Standard input with dropdown toggle
Dropdown: Same as Select dropdown
Filter: Type to filter options (case-insensitive)
Create: Option to "Create new" when no match found
Keyboard: Arrow keys, Enter to select
```

### 7.5 Multi Select

**Purpose:** Select multiple options.

**Specs:**
```
Trigger: Shows selected items as tags (or "N selected")
Dropdown: Checkboxes next to each option
Clear all: X icon on trigger
Max tags visible: 3 (expand to "+N" overflow)
```

### 7.6 Date Picker

**Purpose:** Date selection.

**Specs:**
```
Trigger: Input with calendar icon
Dropdown: Calendar grid
Navigation: Month arrows, year dropdown
Today: Highlighted
Selected: Primary-500 bg
Range: Start/end with range highlight
Keyboard: Arrow keys to navigate, Enter to select
Min/max: Configurable date range
```

### 7.7 Time Picker

**Purpose:** Time selection.

**Specs:**
```
Trigger: Input with clock icon
Dropdown: Scrollable hour/min/AM-PM
Format: 12h or 24h (configurable)
Step: 1 min (default), 5 min, 15 min, 30 min
```

### 7.8 Color Picker

**Purpose:** Color selection.

**Specs:**
```
Trigger: Color swatch button (32×32px)
Dropdown: Color grid (presets) + custom picker
Presets: 20 predefined colors
Custom: Hue/saturation picker + hex input
```

### 7.9 File Upload

**Purpose:** File selection and upload.

**Specs:**
```
Drop zone: Dashed border, neutral-300, 120px height
Drag active: primary-500 border, primary-50 background
File list: Name + size + progress + remove
Max size: Configurable with validation
Multiple: Configurable
Accept: MIME type filter
Progress: Per-file progress bar
```

### 7.10 Rating

**Purpose:** Star rating input.

**Specs:**
```
Item size: 20px (default), 24px (large)
Icon: star (filled) or star (outlined)
Colors: accent-400 (filled), neutral-300 (empty)
Hover: accent-400 highlight
Keyboard: Arrow keys to adjust
```

### 7.11 Toggle Group

**Purpose:** Exclusive selection from button-like options.

**Specs:**
```
Layout: Inline row, no gap (merged borders)
Item height: 32px (sm) / 40px (md)
Item padding: 0 12px
Selected: primary-500 bg, white text
Unselected: transparent, text-secondary
Border: 1px neutral-300 (outer group) / 1px neutral-200 (items)
Radius: 8px (outer edges only)
```

### 7.12 Button Group

**Purpose:** Grouped action buttons.

**Specs:**
```
Layout: Inline row, 0 gap
Radius: Outer edges 8px, inner edges 0
Border: Shared borders (no double borders)
Divider: 1px neutral-300 between buttons
```

### 7.13 OTP Input

**Purpose:** One-time password entry.

**Specs:**
```
Item size: 48×48px (desktop), 44×44pt (mobile)
Count: 6 (default), configurable
Gap: 8px
Font: 24px Bold, tabular-nums
States: Same as Input
Auto-advance: Auto-focus next on digit entry
Paste: Full paste from clipboard
```

---

## 8. AI COMPONENTS

### 8.1 AI Chat

**Purpose:** Conversational AI interface.

**Specs:**
```
Layout: Full height, flex column
Header: Model name + clear conversation
Message list: Scrollable, flex-1
Input area: Bottom-fixed
```

**Message bubble:**
```
User: Right-aligned, primary-500 bg, white text, 16px Regular
AI: Left-aligned, neutral-100 bg, text-primary, 16px Regular
Max width: 70% of container
Padding: 12px 16px
Radius: 12px (user), 12px (AI)
Gap: 12px
Typing indicator: 3 animated dots
```

### 8.2 AI Prompt Input

**Purpose:** Input for AI prompts.

**Specs:**
```
Min height: 44px
Max height: 200px (auto-grow)
Padding: 12px 16px
Font: 16px Regular
Placeholder: "Ask Atlas AI..."
Submit: Send button (right), 20px icon
Attach: Paperclip button (left)
Expand: Full-screen mode button
```

### 8.3 AI Response Block

**Purpose:** Structured AI response.

**Sections:**
```
Content: Markdown-rendered AI response
Sources: Expandable source citations
Actions: Copy, Regenerate, Feedback (thumb up/down)
Metadata: Token count, model, time
```

### 8.4 Model Selector

**Purpose:** Choose AI model.

**Specs:**
```
Trigger: Current model name + chevron
Dropdown: Model list with badges (Recommended, Fast, Powerful)
Item: Model name + description + speed indicator
```

### 8.5 Token Counter

**Purpose:** Shows token usage.

**Specs:**
```
Layout: text-tertiary, 12px Regular
Position: Bottom-right of prompt input
Display: "X / Y tokens" or percentage bar
Warning: Yellow at 80%, Red at 100%
```

### 8.6 Cost Indicator

**Purpose:** Shows cost before execution.

**Specs:**
```
Layout: Inline with token counter
Display: "$0.00X" format
Color: text-tertiary
Visible: Before expensive operations
```

### 8.7 Confidence Indicator

**Purpose:** Shows AI confidence in response.

**Specs:**
```
Layout: Progress bar or percentage
Levels: High (green), Medium (amber), Low (red)
Display: "80% confident" with icon
```

### 8.8 AI Suggestion

**Purpose:** Contextual AI suggestions.

**Specs:**
```
Position: Below input or inline
Layout: Horizontal scrollable chips
Item: "Suggestion text" in pill shape
Action: Click to apply, dismiss to remove
```

### 8.9 Citation Block

**Purpose:** Shows source citations.

**Specs:**
```
Layout: Expandable section
Item: Source title + snippet + link
Number: Inline superscript [1] in response
Footer: "Sources: 3 citations"
```

### 8.10 Workflow Canvas

**Purpose:** Visual AI workflow builder.

**Specs:**
```
Canvas: Infinite pan/zoom (ctrl+scroll)
Node: 240×120px card, rounded 12px
Edge: Bezier curves, 2px, primary-500
Node types: Input, Process, Decision, Output
Connection: Drag from output port to input port
Mini-map: Bottom-right thumbnail
```

### 8.11 AI Trace

**Purpose:** Debug trace of AI chain.

**Specs:**
```
Layout: Vertical timeline
Step: Model call, prompt, response, tool use
Duration: Per-step timing label
Expand: Click to see full prompt/response
```

### 8.12 Permission Gate

**Purpose:** Shows permission requirements.

**Specs:**
```
Layout: Alert-style banner
Icon: Lock
Message: "You need X permission to perform this action"
Action: "Request Access" button
```

---

## 9. DATA VIS

### 9.1 Line Chart

**See:** [DATA_VISUALIZATION.md](./DATA_VISUALIZATION.md)

### 9.2 Bar Chart

**Specs:**
```
Orientation: Vertical (default), Horizontal
Bar radius: 4px top (vertical), 4px right (horizontal)
Bar gap: 4px
Group gap: 16px
Bar width: Auto (fit container), min 8px, max 48px
Stacked: Full-height with color segments
Colors: Chart palette (defined in data viz doc)
```

### 9.3 Area Chart

**Specs:**
```
Line: 2px solid
Fill: Gradient to transparent (opacity 0.1 at bottom)
Stacked: Cumulative area stacking
```

### 9.4 Pie Chart

**Specs:**
```
Donut: Hole in center (60% radius)
Arc gap: 2px
Min arc: 3° (merge smaller values into "Other")
Label: Outside arc with connector line
Center text: Total value
```

### 9.5 Donut Chart

**Same as Pie Chart §9.4 with center hole.**

### 9.6 Heatmap

**Specs:**
```
Cell size: 16×16px (default), 12×12px (compact)
Gap: 2px
Colors: Single-hue gradient (light → dark)
Label: Row (left) + Column (top)
Tooltip: Exact value on hover
```

### 9.7 KPI Card

**Specs:**
```
Layout: Stat card with chart
Padding: 16px
Chart: Mini sparkline (optional)
Value: 30px Bold
Label: 14px Regular, text-secondary
Trend: 12px Medium
```

### 9.8 Gauge

**Specs:**
```
Arc: 270° (starting at 135°, ending at 405°)
Width: 24px
Background: neutral-200
Fill: primary-500 (gradient optional)
Value: Center text, 24px Bold
Label: Below value, 12px Regular
Range: Min/max configurable
```

### 9.9 Sparkline

**Specs:**
```
Width: 64px (default), 96px (large)
Height: 24px (default), 32px (large)
Line: 1.5px, primary-500
Area: Optional fill
```

### 9.10 Funnel

**Specs:**
```
Step width: Decreasing proportionally
Step height: 40px
Gap: 4px
Label: Step name + value
Color: Single-hue gradient
```

---

## 10. COMPOSITE

### 10.1 Page Header

**Purpose:** Standard page heading area.

**Specs:**
```
Padding: 24px bottom
Layout: Title (left) + Actions (right)
Title: 30px SemiBold (H4)
Description: 14px Regular, text-secondary, 4px top margin
Breadcrumb: Above title, 12px bottom margin
Actions: Button group, right-aligned
Tabs: Below header, 16px bottom margin
```

### 10.2 Search Bar

**Purpose:** Global or contextual search.

**Specs:**
```
Height: 40px
Width: 480px max (desktop), full (mobile)
Icon: 16px search left
Placeholder: "Search..."
Clear: X button when has value
Shortcut: KBD "⌘K" (right)
Radius: 8px
```

### 10.3 Filter Bar

**Purpose:** Data filtering controls.

**Specs:**
```
Layout: Horizontal row of filter chips + "Add filter" button
Gap: 8px
Chip: Tag with value, removable
Presets: Saved filter dropdown
Clear all: Button, text-tertiary
Responsive: Wraps to multiple rows on mobile
```

### 10.4 Action Bar

**Purpose:** Bulk action toolbar.

**Specs:**
```
Layout: Selection count (left) + Actions (right)
Height: 44px
Background: primary-50
Border: 1px primary-200
Radius: 8px
Padding: 0 16px
Animation: Slide down from top (200ms)
```

### 10.5 Data Table

**Composite of Table + Search + Filter + Pagination + Action Bar.**

### 10.6 CRUD Page

**Purpose:** Standard create/read/update/delete page.

**Template:**
```
Page Header (title + "Create" button)
Search + Filter bar
Action bar (shown when items selected)
Data table
Pagination
---

Create/Edit: Modal or drawer with form
Delete: Confirmation dialog
```

### 10.7 Settings Page

**Purpose:** Application settings.

**Template:**
```
Left sidebar: Category navigation (vertical tabs)
Right content: Settings form sections
Save: Button at bottom of each section (auto-save preferred)
```

### 10.8 Onboarding Flow

**Purpose:** First-time user setup.

**Template:**
```
Progress stepper (top)
Content card (center, max 640px)
Navigation buttons: Back + Next/Finish (bottom-right)
Skip link (top-right, text-tertiary)
```

### 10.9 Wizard

**Purpose:** Multi-step complex form.

**Template:**
```
Same as Onboarding Flow but with:
- Side panel: Summary of completed steps
- Save draft: Auto-save every step
- Review step: Summary before final submit
```

### 10.10 Kanban Board

**Purpose:** Visual workflow management.

**Specs:**
```
Column width: 280px
Column gap: 16px
Card width: 280px
Card padding: 12px
Horizontal scroll: Overflow scroll
Drag: Drag card between columns
Column header: Title + count
```

### 10.11 Notification Center

**Purpose:** Centralized notification display.

**Specs:**
```
Trigger: Bell icon with badge
Dropdown: 360×480px
List: Notification items with timestamp
Group: "Today", "Yesterday", "Older"
Item: Icon + Title + Description + Time
Actions: Mark read, dismiss
Empty state: "No notifications"
```

### 10.12 Activity Feed

**Purpose:** Chronological activity log.

**Specs:**
```
Layout: Timeline-style
Item: Avatar + Actor + Action + Target + Time
Filter: By action type, actor, date range
Load more: Pagination at bottom
```

### 10.13 Audit Log Viewer

**Purpose:** Security audit trail.

**Specs:**
```
Table layout with advanced search
Columns: Timestamp, Actor, Action, Resource, IP, Status
Filters: Date range, actor, action type
Export: CSV download
Retention: Configurable display range
```

### 10.14 API Key Manager

**Purpose:** Create and manage API keys.

**Specs:**
```
List: Table of keys with name, prefix, created, last used, status
Create: Modal with permissions selector
Show key once: Copy + warning to save
Revoke: Confirmation dialog
Permissions: Checkbox list of scopes
```

---

## Component Summary

| Category | Count |
|----------|-------|
| Primitives | 16 |
| Data Display | 12 |
| Feedback | 9 |
| Navigation | 10 |
| Overlays | 8 |
| Surfaces | 6 |
| Forms | 13 |
| AI Components | 12 |
| Data Vis | 10 |
| Composite | 14 |
| **Total** | **110** |
