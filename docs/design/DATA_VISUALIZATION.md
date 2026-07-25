# Data Visualization Standards

> **Part of:** Atlas AI Enterprise Design System v1.0  
> **Status:** Production Ready

---

## Table of Contents

1. [Principles](#1-principles)
2. [Chart Types & Usage](#2-chart-types--usage)
3. [Chart Colors](#3-chart-colors)
4. [Chart Anatomy](#4-chart-anatomy)
5. [KPI Dashboards](#5-kpi-dashboards)
6. [Interaction & Animation](#6-interaction--animation)
7. [Responsive Behavior](#7-responsive-behavior)
8. [Accessibility](#8-accessibility)

---

## 1. Principles

1. **Context over quantity.** Every chart answers a specific question. Don't show data that doesn't inform a decision.
2. **Direct labeling > legends.** Labels next to data points are faster to read than scanning a legend.
3. **Zero baseline.** Bar charts always start at zero. Line charts can start at lowest value (but consider misleading).
4. **Data-ink ratio maximize.** Remove non-data elements. Gridlines are light or absent. Backgrounds are clean.
5. **Sort matters.** Time-series: chronological. Categories: by value (descending), alphabetical, or natural order.
6. **Color is semantic.** Same color = same category across all charts. Semantic colors only for special data points.
7. **Details on demand.** Show summary at first glance. Provide tooltips for detailed values.

---

## 2. Chart Types & Usage

### 2.1 Line Chart

**Purpose:** Show trends over time.

**When to use:**
- Continuous data over time (days, weeks, months)
- Comparing multiple trends
- Showing patterns, seasonality, or anomalies

**Specs:**
```
Line width: 2px
Point size: 6px (on hover/interaction)
Point shape: Circle
Line smooth: Monotone (not curved) for time series
Multiple lines: Max 4 per chart
Gridlines: Horizontal only, neutral-200, dashed
X-axis: Time labels, rotated 45° if dense
Y-axis: Value labels with commas
Area fill: Optional gradient below line
```

**Colors for multiple lines:**
```
Line 1: primary-500     (#4F46E5)
Line 2: secondary-500   (#14B8A6)
Line 3: accent-500      (#F59E0B)
Line 4: primary-300     (#A5B4FC)
```

**Tooltip:**
```
Background: surface-elevated
Border: 1px neutral-200
Radius: 8px
Padding: 12px
Font: 14px Regular
Value: SemiBold
Series indicator: Color dot + name
```

### 2.2 Area Chart

**Purpose:** Show magnitude of change over time.

**Variants:**
- **Standard:** Area below line (single series)
- **Stacked:** Multiple series stacked to show total
- **Percent:** Shows % contribution over time (total = 100%)

**Specs:**
```
Fill: Gradient from line color to transparent (opacity 0.3 → 0)
Stacked: Series on top of each other
Order: Largest → smallest (bottom → top)
```

### 2.3 Bar Chart

**Purpose:** Compare values across categories.

**Variants:**
- **Vertical:** Default for time or categories
- **Horizontal:** Many categories (15+), or long category names
- **Stacked:** Show total + composition
- **Grouped:** Compare sub-categories

**Specs:**
```
Bar radius: 4px (top corners only for vertical)
Bar max width: 48px
Bar min width: 8px
Gap (vertical): 4px between bars, 16px between groups
Gap (horizontal): 8px between bars, 20px between groups
Zero baseline: Always enforced
Negative values: Below baseline, error color
```

### 2.4 Pie / Donut Chart

**Purpose:** Show proportion of a whole.

**When to use:**
- 2–5 categories
- Showing percentage of total
- Donut (preferred over pie) for readability

**When NOT to use:**
- Comparing values across charts (use bar)
- Many small categories (use bar)
- Precise comparisons (use table)

**Specs:**
```
Donut hole: 60% of radius
Arc gap: 2px
Min arc size: 3° (merge smaller into "Other")
Label: Outside with connector line (or legend for 5+ items)
Center text: Total value or "Total"
Order: Largest → smallest, clockwise from top
```

### 2.5 Heatmap

**Purpose:** Show density, patterns, or intensity.

**When to use:**
- Activity patterns (day × hour)
- Correlation matrices
- Geographic density

**Specs:**
```
Cell size: 16×16px (default), 12×12px (compact)
Cell gap: 2px
Color scale: Single-hue gradient (light → dark)
  Low: neutral-100
  High: primary-600
Alternative: Diverging (negative → neutral → positive)
Label: Row labels (left), Column labels (top)
Tooltip: Exact value on hover
```

### 2.6 Funnel Chart

**Purpose:** Show sequential conversion.

**When to use:**
- Sales pipeline stages
- User onboarding completion
- Process step drop-off

**Specs:**
```
Width: Progressively narrowing (proportional to value)
Segment height: 40px
Gap: 4px
Label: Step name + value + conversion %
Color: Graduated single hue (darkest = widest)
```

### 2.7 Gauge

**Purpose:** Show progress toward a target.

**When to use:**
- Single metric vs target
- Status indicators (good/warning/critical)
- KPIs in dashboards

**Specs:**
```
Arc: 270° (start 135°, end 405°)
Arc width: 24px
Background arc: neutral-200
Fill: primary-500 (or semantic color)
Threshold markers: Warning (yellow), Critical (red)
Center value: 24px Bold
Center label: 12px Regular
```

### 2.8 Sparkline

**Purpose:** Inline mini chart for context.

**When to use:**
- Next to KPI values
- In table cells
- In list items

**Specs:**
```
Width: 80px (default), 120px (large)
Height: 24px (default), 32px (large)
Line: 1.5px, primary-500
Fill: None (optimal) or gradient (subtle)
No axes, no labels, no gridlines
```

### 2.9 Timeline Chart

**Purpose:** Show events over time.

**When to use:**
- Project milestones
- Event sequences
- Process durations

**Specs:**
```
Horizontal: Time-based X-axis
Events: Dots on timeline
Duration: Bars spanning time range
Grouping: Rows for different tracks
```

### 2.10 Comparison Chart

**Purpose:** Side-by-side metric comparison.

**Variants:**
- Bullet chart: Value vs target vs range
- Radar chart: Multi-dimensional comparison (use sparingly, hard to read)

---

## 3. Chart Colors

### 3.1 Categorical Color Palette

For datasets with multiple series, use this 10-color palette:

```
Color 1:  #4F46E5  (primary-500)
Color 2:  #14B8A6  (secondary-500)
Color 3:  #F59E0B  (accent-500)
Color 4:  #8B5CF6  (violet-500)
Color 5:  #EC4899  (pink-500)
Color 6:  #06B6D4  (cyan-500)
Color 7:  #84CC16  (lime-500)
Color 8:  #F97316  (orange-500)
Color 9:  #6366F1  (indigo-400)
Color 10: #22D3EE  (cyan-400)
```

### 3.2 Diverging Palette

For data with a meaningful midpoint (e.g., sentiment, change):

```
Negative: #DC2626  (error)
Neutral:  #9CA3AF  (neutral-400)
Positive: #059669  (success)
```

### 3.3 Sequential (Single Hue) Palette

For density, intensity, or gradient data:

```
Light:  #EEF2FF  (primary-50)
Medium: #818CF8  (primary-400)
Dark:   #4338CA  (primary-600)
```

### 3.4 Semantic Mapping

| Data Context | Color |
|--------------|-------|
| Positive trend | success (#059669) |
| Negative trend | error (#DC2626) |
| Neutral | neutral-500 (#6B7280) |
| AI-generated | accent (#F59E0B) |
| User data | primary (#4F46E5) |
| System data | secondary (#14B8A6) |

### 3.5 Dark Theme Adjustments

- Same hue, lightened by 2–3 stops
- Background text (axis labels) adjusted to maintain contrast
- Gridlines: neutral-400
- No white backgrounds on charts

---

## 4. Chart Anatomy

### 4.1 Standard Layout

```
┌─────────────────────────────────────────────┐
│  Title (16px SemiBold)                      │
│  Subtitle (12px Regular, text-secondary)    │
│  ┌─────────────────────────────────────────┐│
│  │   Legend (optional, top or right)       ││
│  │   ┌─────────────────────────────────┐   ││
│  │   │                                 │   ││
│  │   │           Chart Area            │   ││
│  │   │                                 │   ││
│  │   └─────────────────────────────────┘   ││
│  │   X-axis label (12px Regular)           ││
│  └─────────────────────────────────────────┘│
│  Source (11px Regular, text-tertiary)       │
└─────────────────────────────────────────────┘
Padding: 16px all sides
```

### 4.2 Axis Specifications

```
Axis line: 1px solid neutral-200
Tick marks: 4px length, neutral-300
Tick label: 12px Regular, text-tertiary
Gridline (horizontal): 1px dashed neutral-200
Gridline (vertical): None (except for precision charts)

Y-axis label: 12px Regular, text-secondary, rotated -90°
X-axis label: 12px Regular, text-secondary
```

### 4.3 Tooltip Specifications

```
Trigger: Hover (desktop), Tap (mobile)
Delay: 100ms show, 100ms hide
Background: surface-elevated
Border: 1px neutral-200
Shadow: elevation-2
Radius: 8px
Padding: 12px
Arrow: 8px triangle pointing to data point
Font: 14px Regular
Values: SemiBold
Series indicator: 8px circle + series name
Max width: 240px
Z-index: 150
```

### 4.4 Legend Specifications

```
Position: Top-right (default), Top-center, Right
Layout: Horizontal (default), Vertical (if many items)
Item: 8px color circle + 12px Regular label
Gap: 16px horizontal, 8px vertical
Click: Toggle series visibility
Interactive: Cursor pointer on items
```

### 4.5 Empty State (No Data)

```
Layout: Center of chart area
Icon: 48px, neutral-300
Message: "No data available for this period"
Action: "Adjust filters" or "Load data"
```

### 4.6 Loading State

```
Skeleton: Waveform pattern matching chart shape
Duration: Show for loading > 500ms
Transition: Fade to actual data (200ms)
```

---

## 5. KPI Dashboards

### 5.1 Dashboard Grid

```
Layout: CSS Grid
Columns: 4 (desktop), 3 (tablet), 2 (mobile), 1 (small mobile)
Gap: 16px
Card padding: 16px
```

### 5.2 KPI Card Specification

```
┌──────────────────────────────┐
│  ┌────────────┐              │  Title row
│  │ Icon 20px  │  Title       │
│  └────────────┘              │
├──────────────────────────────┤
│  Value (30px Bold)           │
│  Trend (12px Medium) ▲ 12.5% │
├──────────────────────────────┤
│  ┌─ Sparkline (optional) ──┐ │
│  │     ╱╲    ╱╲            │ │
│  │    ╱  ╲  ╱  ╲           │ │
│  │   ╱    ╲╱    ╲          │ │
│  └──────────────────────────┘ │
├──────────────────────────────┤
│  Comparison (12px Regular)   │
│  vs last period: 5.3%        │
└──────────────────────────────┘
```

### 5.3 KPI Value Formatting

| Type | Format | Example |
|------|--------|---------|
| Currency | $X,XXX.XX | $12,345.67 |
| Large currency | $X.XM / $X.XB | $1.2M |
| Percentage | XX.X% | 85.3% |
| Count | XXX | 1,234 |
| Large count | X.XK / X.XM | 12.3K |
| Duration | Xh Xm | 3h 45m |
| Decimal | X.XX | 4.56 |
| Ratio | X:Y | 3:1 |

---

## 6. Interaction & Animation

### 6.1 Chart Interactions

| Interaction | Behavior |
|-------------|----------|
| **Hover (data point)** | Show tooltip, highlight point |
| **Hover (series)** | Highlight series, dim others |
| **Click (data point)** | Drill down to detail |
| **Click (legend)** | Toggle series visibility |
| **Brush/zoom** | Select time range to zoom |
| **Pan (after zoom)** | Drag to pan time window |
| **Reset zoom** | Double-click or button |
| **Export** | Download as PNG, CSV |

### 6.2 Chart Animations

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Chart appear | 500ms | ease-out | On mount |
| Data update | 300ms | ease-in-out | On data change |
| Series toggle | 200ms | ease-out | Legend click |
| Drill down | 200ms | ease-out | Click |
| Tooltip show | 100ms | ease-out | Hover |
| Tooltip hide | 100ms | ease-in | Leave |

**Reduced motion:** Disable all animations when `prefers-reduced-motion` is set.

---

## 7. Responsive Behavior

| Breakpoint | Grid Columns | Sparkline | Legend | Tooltip |
|------------|-------------|-----------|--------|---------|
| ≥ 1280px | 4 | Show | Top-right | Follow cursor |
| 1024–1280px | 3 | Show | Top-center | Follow cursor |
| 768–1024px | 2 | Show | Right (vertical) | Fixed position |
| 640–768px | 2 | Hide | Bottom | Fixed position |
| < 640px | 1 | Hide | Bottom | Fixed position |

- Charts resize proportionally with container
- X-axis labels rotate at dense intervals
- Simplify tooltips on mobile (fewer values)
- Remove gridlines on mobile
- Make touch targets 44pt for interactive chart elements

---

## 8. Accessibility

### 8.1 Data Accessibility

- All charts must have a **data table fallback** (hidden or toggleable)
- Chart must have an `aria-label` describing the data
- Color must not be the only way to distinguish data
- Interactive elements must be keyboard accessible
- Focus order: Chart → Tooltip → Legend

### 8.2 Screen Reader Support

```
Chart container:   role="img", aria-label="Chart: description"
Data points:       aria-label="Value X at point Y"
Legend items:      role="button", tabindex="0"
Tooltip:           role="tooltip", aria-live="polite"
```

### 8.3 Pattern & Texture Alternatives

For color-blind accessibility, use patterns as secondary encoding:
- Solid (default)
- Striped (horizontal, 45°)
- Dotted
- Cross-hatched

Patterns are enabled in high-contrast mode or by user preference.

### 8.4 Keyboard Navigation

```
Tab:          Focus chart elements in logical order
Arrow keys:   Navigate data points within a chart
Enter/Space:  Select data point or legend item
Esc:          Close tooltip
Ctrl+Plus:    Zoom in
Ctrl+Minus:   Zoom out
```
