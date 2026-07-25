# Atlas AI Accessibility Guidelines

> **Status:** Foundation (Phase 1)  
> **Version:** 1.0.0  
> **Purpose:** Ensure the Atlas AI platform is usable by everyone, regardless of ability

---

## 1. Compliance Target

- **Minimum**: WCAG 2.2 Level AA
- **Target**: WCAG 2.2 Level AAA where feasible
- **Internal Policy**: All new features must pass accessibility review before shipping

---

## 2. Perceivable

### 2.1 Text Alternatives

- All non-text content must have a text alternative
- Decorative images must have empty `alt=""`
- Informational images must have descriptive `alt` text
- Icons used as buttons must have `aria-label`
- Complex images (charts, diagrams) must have long descriptions

### 2.2 Time-Based Media

- Video content must have captions
- Audio content must have transcripts
- Live video must have real-time captions (future)

### 2.3 Adaptable

- Content must maintain meaning when linearized (without CSS)
- All functionality must work with increased font size up to 200%
- Information, structure, and relationships must be programmatically determinable
- Use semantic HTML elements (`<nav>`, `<main>`, `<aside>`, `<section>`)

### 2.4 Distinguishable

- **Color contrast**: 
  - Normal text: 4.5:1 minimum (7:1 target)
  - Large text (18px+): 3:1 minimum (4.5:1 target)
  - UI components and graphical objects: 3:1 minimum
- **Color alone**: Never use color alone to convey information
- **Audio control**: Auto-playing audio must have pause/stop control
- **Resize text**: Text can be resized to 200% without loss of content or functionality
- **Images of text**: Avoid images of text. Use styled text instead.

### 2.5 High Contrast Mode

- Platform must support high contrast mode
- All interactive elements must remain visible in high contrast
- Focus indicators must be visible in high contrast

---

## 3. Operable

### 3.1 Keyboard Accessible

- All functionality must be operable through keyboard interface
- No keyboard traps
- Visible focus indicators on all interactive elements
- Focus order must follow logical reading order
- Tab navigation for all interactive elements
- Arrow keys for list navigation
- Escape to close modals, dropdowns, and popovers

### 3.2 Keyboard Shortcuts

- All shortcuts must be documented and discoverable
- Single-key shortcuts must be configurable or disableable
- Shortcuts must not interfere with assistive technology

### 3.3 Enough Time

- Session timeout must have warning with extend option (2-minute warning)
- No time limits on content consumption
- Time limits on operations must be adjustable or extendable
- Moving, blinking, or auto-updating content must have pause/stop/hide

### 3.4 Seizures and Physical Reactions

- No flashing content (more than 3 flashes per second)
- No animations that could trigger vestibular disorders
- Reduced motion mode must disable all non-essential animations

### 3.5 Navigable

- Skip-to-content link at top of every page
- Page titles must describe purpose
- Focus order must preserve logical reading order
- Link purpose must be clear from text alone or from text + programmatic context
- Multiple ways to find content (search, navigation, sitemap)
- Headings and labels must describe topic or purpose
- Section headings must organize content

### 3.6 Input Modalities

- Pointer gestures must have single-point activation alternatives
- Touch target size: minimum 44x44 CSS pixels
- Drag actions must have single-click alternative
- Motion-based activation must have UI-based alternative

---

## 4. Understandable

### 4.1 Readable

- Language of page must be programmatically set (`lang` attribute)
- Language changes within content must be indicated
- Unusual words must have definitions
- Abbreviations must be expanded on first use
- Reading level should not exceed lower secondary education level
- Pronunciation guidance for ambiguous words

### 4.2 Predictable

- Navigation must be consistent across all pages
- Components with same functionality must be labeled consistently
- Changes of context must be initiated by user action only
- No automatic redirects
- Consistent help and documentation access

### 4.3 Input Assistance

- Error messages must be descriptive and specific
- Labels or instructions must be provided for all input fields
- Required fields must be clearly indicated
- Error suggestions must be provided where possible
- Error prevention for legal, financial, and data-critical operations
- Form submission must be reversible, checked, or confirmed

---

## 5. Robust

### 5.1 Compatible

- Valid HTML5 must be used
- ARIA roles, states, and properties must be used correctly
- Status messages must be programmatically determinable via `aria-live`
- Custom widgets must have appropriate ARIA roles
- Platform must work with current and future assistive technologies

### 5.2 ARIA Usage

- Use native HTML semantics before ARIA
- No redundant ARIA (e.g., `role="button"` on a `<button>`)
- ARIA states must be kept in sync with visual states
- `aria-expanded`, `aria-pressed`, `aria-selected` for toggleable elements
- `aria-controls` for elements that control visibility of other elements
- `aria-describedby` for error messages
- `aria-label` for icon-only buttons
- `aria-hidden="true"` for decorative icons

---

## 6. Component-Specific Requirements

| Component | Requirements |
|-----------|--------------|
| **Button** | Focus visible, keyboard activation (Enter/Space), role="button" |
| **Input** | Associated label, aria-describedby for errors, aria-required |
| **Select** | aria-expanded, aria-controls for options, keyboard navigation |
| **Checkbox** | role="checkbox", aria-checked, keyboard toggle with Space |
| **Toggle** | role="switch", aria-checked, keyboard toggle with Space |
| **Modal** | Focus trap, aria-modal="true", role="dialog", aria-labelledby, Escape to close |
| **Dialog** | role="alertdialog" for confirmations, focus on primary action |
| **Toast** | role="alert" or aria-live="polite" |
| **Tooltip** | role="tooltip", aria-describedby on trigger element |
| **Tabs** | role="tablist", role="tab", role="tabpanel", arrow key navigation |
| **Accordion** | role="button" on header, aria-expanded, aria-controls |
| **DataTable** | `<table>` with `<th>`, sort indicators with aria-sort |
| **Menu** | role="menu", role="menuitem", arrow key navigation, Escape to close |
| **Progress** | role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax |

---

## 7. Color and Contrast

### 7.1 Color Palette for Accessibility

All color combinations must meet WCAG 2.2 AA contrast ratios:

| Combination | Ratio Required | Status |
|-------------|----------------|--------|
| Text on background | 4.5:1 | Verify in Phase 2 |
| Large text on background | 3:1 | Verify in Phase 2 |
| UI components | 3:1 | Verify in Phase 2 |
| Link text in body | 3:1 | Verify in Phase 2 |
| Error text on background | 4.5:1 | Verify in Phase 2 |
| Placeholder text | 4.5:1 | Verify in Phase 2 |

### 7.2 Color Blindness

- Platform must be usable without color discrimination
- Use patterns, icons, and text labels in addition to color
- Test with common color blindness simulations: deuteranopia, protanopia, tritanopia
- Never use red/green as the only differentiator

---

## 8. Testing Requirements

### 8.1 Automated Testing

- Axe-core integration in CI pipeline
- Lighthouse accessibility audit in CI
- Color contrast validation in CI
- Keyboard navigation testing in E2E tests

### 8.2 Manual Testing

- Screen reader testing (NVDA, VoiceOver, TalkBack)
- Keyboard-only navigation testing
- Zoom testing (200%, 400%)
- Reduced motion testing
- High contrast mode testing
- Color blindness simulation testing

### 8.3 Testing Cadence

- Every PR: automated accessibility checks
- Every sprint: manual accessibility review of new features
- Every release: full accessibility audit
- Quarterly: third-party accessibility audit

---

## 9. Screen Reader Support

### 9.1 Supported Screen Readers

| Platform | Screen Reader |
|----------|---------------|
| Windows | NVDA (primary), JAWS |
| macOS | VoiceOver |
| iOS | VoiceOver |
| Android | TalkBack |

### 9.2 Announcement Patterns

- Dynamic content updates: `aria-live="polite"` for non-critical, `aria-live="assertive"` for critical
- Loading state: `aria-busy="true"` on container, remove when complete
- Navigation: announce current page/section
- Errors: announce in `aria-live` region
- Success: announce for non-obvious successes
- Search results: announce result count

---

## 10. Reduced Motion

### 10.1 Motion Preferences

- Respect `prefers-reduced-motion` media query
- Disable non-essential animations when reduced motion is preferred
- Essential animations (loading, progress) can remain with reduced intensity

### 10.2 Animations to Disable

- Page transitions
- Card hover effects
- Skeleton shimmer
- Toast slide-in
- Modal scale-in
- List item animations
- Background particle effects

### 10.3 Animations that May Remain (Reduced)

- Progress bar fill
- Loading spinner (minimal)
- Focus indicator
- Essential state transitions (collapsed → expanded)

---

## 11. Documentation

- Accessibility statement published at `/accessibility`
- Known limitations documented
- Alternative access methods documented
- Contact for accessibility issues
- Continuous improvement plan
