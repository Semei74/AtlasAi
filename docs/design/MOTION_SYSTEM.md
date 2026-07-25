# Atlas AI Motion System

> **Status:** Foundation (Phase 1)  
> **Version:** 1.0.0  
> **Purpose:** Define animation and transition standards for the Atlas AI platform

---

## 1. Motion Philosophy

Motion in Atlas AI serves three purposes:

1. **Orientation** — Help users understand where they are and what changed
2. **Feedback** — Confirm actions and show system state
3. **Delight** — Create a polished, professional feel without distraction

All motion must be:
- **Purposeful** — Every animation has a reason
- **Subtle** — Never flashy or attention-seeking
- **Fast** — Complete in 100-300ms
- **Accessible** — Respects `prefers-reduced-motion`

---

## 2. Duration Tokens

| Token | Duration | Usage |
|-------|----------|-------|
| Instant | 50ms | Micro-interactions (button press, toggle) |
| Fast | 100ms | Hover effects, focus rings, color transitions |
| Normal | 200ms | Standard transitions (default) |
| Slow | 300ms | Emphasis transitions, modals entering |
| XL | 500ms | Page transitions, complex reveals |
| Deliberate | 1000ms | Progress indicators, skeleton loading |

---

## 3. Easing Tokens

| Token | Curve | Usage |
|-------|-------|-------|
| Ease-Out | cubic-bezier(0.16, 1, 0.3, 1) | Elements entering screen (default) |
| Ease-In | cubic-bezier(0.4, 0, 1, 1) | Elements leaving screen |
| Ease-In-Out | cubic-bezier(0.65, 0, 0.35, 1) | Element transitions within screen |
| Linear | linear | Progress bars, color transitions |
| Spring | Custom spring (tension: 300, friction: 30) | Overlays, sheets (mobile) |

---

## 4. Animation Types

### 4.1 Fade

| Use Case | Duration | Easing | Parameters |
|----------|----------|--------|------------|
| Modal backdrop enter | 200ms | Ease-Out | opacity 0 → 0.5 |
| Modal backdrop exit | 150ms | Ease-In | opacity 0.5 → 0 |
| Toast enter | 200ms | Ease-Out | opacity 0 → 1 |
| Toast exit | 200ms | Ease-In | opacity 1 → 0 |
| Tooltip show | 100ms | Ease-Out | opacity 0 → 1 |
| Tooltip hide | 50ms | Ease-In | opacity 1 → 0 |

### 4.2 Slide

| Use Case | Duration | Easing | Parameters |
|----------|----------|--------|------------|
| Modal enter | 200ms | Ease-Out | translateY: 20px → 0 |
| Modal exit | 150ms | Ease-In | translateY: 0 → 20px |
| Sheet enter (mobile) | 250ms | Spring | translateY: 100% → 0 |
| Sheet exit (mobile) | 200ms | Ease-In | translateY: 0 → 100% |
| Sidebar enter | 200ms | Ease-Out | translateX: -240px → 0 |
| Slide-in panel | 250ms | Ease-Out | translateX: 100% → 0 |
| Toast slide | 200ms | Ease-Out | translateX: 100% → 0 |

### 4.3 Scale

| Use Case | Duration | Easing | Parameters |
|----------|----------|--------|------------|
| Modal enter | 200ms | Ease-Out | scale: 0.95 → 1, opacity: 0 → 1 |
| Modal exit | 150ms | Ease-In | scale: 1 → 0.95, opacity: 1 → 0 |
| Button press | 50ms | Ease-Out | scale: 1 → 0.97 |
| Button release | 100ms | Ease-Out | scale: 0.97 → 1 |

### 4.4 Height/Width

| Use Case | Duration | Easing | Parameters |
|----------|----------|--------|------------|
| Accordion expand | 200ms | Ease-Out | maxHeight: 0 → auto |
| Accordion collapse | 150ms | Ease-In | maxHeight: auto → 0 |
| Section expand | 300ms | Ease-Out | height: 0 → auto |

### 4.5 Rotate

| Use Case | Duration | Easing | Parameters |
|----------|----------|--------|------------|
| Chevron rotate | 150ms | Ease-Out | rotate: 0 → 180 (expanded) |
| Loading spinner | 1000ms | Linear | rotate: 0 → 360 (continuous) |
| Refresh indicator | 500ms | Ease-Out | rotate: 0 → 360 |

---

## 5. Component Animations

| Component | Enter | Exit | State Change |
|-----------|-------|------|--------------|
| Button | — | — | Scale on press (50ms), color transition (100ms) |
| Card | Fade + slide up (200ms) | — | Hover elevation (150ms) |
| Modal | Fade backdrop + scale (200ms) | Fade + scale (150ms) | — |
| Toast | Slide + fade (200ms) | Fade (200ms) | — |
| Tooltip | Fade (100ms) | Fade (50ms) | — |
| Dropdown | Fade + slide down (150ms) | Fade (100ms) | — |
| Accordion | — | — | Height transition (200ms) |
| Tabs | Fade (150ms) | — | Indicator slide (200ms) |
| Skeleton | — | Fade (200ms) | Shimmer (1.5s loop) |
| Page | Fade (200ms) | Fade (150ms) | — |
| List item | Fade + slide (150ms) | — | Reorder (200ms) |
| Notification | Slide + fade (200ms) | Fade (200ms) | — |

---

## 6. Page Transitions

### 6.1 Page Enter

- Duration: 200ms
- Easing: Ease-Out
- Effect: Fade in (opacity 0 → 1)
- Content skeleton appears first, then content replaces it

### 6.2 Page Exit

- Duration: 150ms
- Easing: Ease-In
- Effect: Fade out (opacity 1 → 0)

### 6.3 Route Change

- Previous page: Fade out (150ms)
- Loading state: Skeleton (immediate)
- New page: Fade in (200ms)

### 6.4 Same Route (Tab/Filter)

- Duration: 150ms
- Effect: Cross-fade
- No layout shift

---

## 7. Loading Animations

### 7.1 Skeleton Screens

- Match final layout dimensions
- Animated shimmer gradient (1.5s loop)
- Rounded corners match component
- No text, just shapes
- Fade out when content loads (200ms)

### 7.2 Progress Bars

- Indeterminate: Animated gradient sweep (1.5s loop)
- Determinate: Smooth fill with 100ms easing per update
- Completion: Full bar hold, then fade out (300ms)

### 7.3 AI Streaming Response

- First token: Fade in typing indicator (200ms)
- Streaming tokens: Sequential reveal with 10ms stagger
- Complete: Fade out typing indicator (100ms)

---

## 8. Staggered Animations

For lists and grids:

- Stagger delay: 30ms between items
- Maximum stagger: 300ms total
- Individual item animation: Fade + slide up (200ms, Ease-Out)
- Only on initial load, not on re-render

---

## 9. Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- Disable all page transitions
- Disable all staggered animations
- Disable all hover effects
- Disable skeleton shimmer
- Disable parallax and scroll-based animations
- Keep: progress bars, loading spinners (reduced intensity)
- Keep: focus indicators
- Keep: essential state transitions (collapsed → expanded)
- Keep: modal show/hide (instant, no animation)

---

## 10. Motion Implementation

### 10.1 Web

- Use CSS transitions and animations for simple effects
- Use Framer Motion for complex animations
- Use `prefers-reduced-motion` media query
- Use `will-change` for GPU-accelerated properties

### 10.2 Mobile (React Native)

- Use Reanimated for animations
- Use React Native Gesture Handler for gesture-driven animations
- Respect `AccessibilityInfo.isReduceMotionEnabled()`

### 10.3 Performance Rules

- Animate only `opacity` and `transform` (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly
- Debounce scroll-based animations
- Disable animations when browser tab is hidden
