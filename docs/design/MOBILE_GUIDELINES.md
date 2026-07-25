# Atlas AI Mobile Guidelines

> **Status:** Foundation (Phase 1)  
> **Version:** 1.0.0  
> **Purpose:** Define mobile-specific design and interaction patterns

---

## 1. Platform

- **Framework**: React Native (Expo SDK 54+)
- **Target OS**: iOS 17+ and Android 14+
- **Surface**: Phone (primary) and tablet (adaptive)

---

## 2. Navigation

### 2.1 Bottom Tab Bar

- Fixed at bottom of screen (56px height)
- 4-5 primary tabs max
- Active tab highlighted with accent color
- Badge for notification counts
- Tab labels hidden on devices < 360px width

### 2.2 Top Navigation

- Minimal top bar (44px height)
- Back button for secondary screens
- Screen title centered
- Contextual actions on right (search, filter, more options)

### 2.3 Gesture Navigation

- Swipe left → navigate back (iOS)
- Swipe right → reveal actions (list items)
- Long press → context menu
- Pull to refresh → reload content
- Pinch → zoom (documents, images)

### 2.4 Sheet Navigation

- Bottom sheet for selections and filters
- Full-screen sheet for creation flows
- Sheet drag handle for dismissal

---

## 3. Touch Targets

| Element | Minimum Size | Notes |
|---------|-------------|-------|
| Buttons | 44x44pt | Primary actions should be larger |
| Links in text | 44x44pt | Ensure adequate tap area |
| List items | 44pt height | With adequate spacing |
| Toggle switches | 44x28pt | |
| Tab bar items | 48x48pt | |
| Toolbar icons | 44x44pt | |
| Cards | 44pt min height | |
| Input fields | 44pt height | |

---

## 4. Layout

### 4.1 Screen Structure

```
┌──────────────────────────┐
│  Status Bar (varies)     │
├──────────────────────────┤
│  Top Bar (44pt)          │
├──────────────────────────┤
│                          │
│  Content Area            │
│  (scrollable)            │
│                          │
│                          │
├──────────────────────────┤
│  Bottom Tab Bar (56pt)   │
└──────────────────────────┘
```

### 4.2 Safe Areas

- Respect safe areas for notch, home indicator, status bar
- Content should not go behind notches or rounded corners
- Bottom tab bar should sit above home indicator
- Top bar should sit below status bar

### 4.3 Responsive Breakpoints (Mobile)

| Breakpoint | Device | Layout |
|------------|--------|--------|
| < 360pt | Small phone | Single column, compact |
| 360-414pt | Standard phone | Single column |
| 414-768pt | Large phone / phablet | Single column, wider margins |
| 768-1024pt | Tablet | Two column, split view |

---

## 5. Typography (Mobile)

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Screen title | 17pt | Semibold | Top bar |
| Heading 1 | 28pt | Bold | |
| Heading 2 | 22pt | Bold | |
| Heading 3 | 20pt | Semibold | |
| Body text | 16pt | Regular | |
| Body small | 14pt | Regular | Captions |
| Caption | 12pt | Regular | Labels, timestamps |
| Button label | 16pt | Semibold | |
| Tab label | 10pt | Medium | Bottom tab |

---

## 6. Interactions (Mobile-Specific)

### 6.1 Keyboard

- Keyboard pushes content up (not overlap)
- Done/Return key submits forms
- Keyboard toolbar with prev/next/done for multi-field forms
- Dismiss keyboard on tap outside input

### 6.2 Haptics

- Light impact for button press
- Medium impact for success confirmation
- Heavy impact for destructive actions
- Notification feedback for alerts
- Selection feedback for picker changes

### 6.3 Orientation

- Portrait as default
- Landscape supported for: document reading, AI chat, media viewing
- Lock to portrait for: forms, settings, admin panels

---

## 7. Offline Behavior

- Cached documents available for reading
- Cached conversations available for viewing
- Draft documents saved locally for upload on reconnection
- Queue-based sync with progress indicator
- Offline banner at top: "You are offline. Changes will sync when connected."
- Conflict resolution with latest-wins + notification

---

## 8. Push Notifications

| Event | Notification | Action |
|-------|-------------|--------|
| New message | "You have a new AI response" | Opens chat |
| Member joined | "[Name] joined [Workspace]" | Opens members |
| Invitation received | "[Name] invited you to [Org]" | Opens invitation |
| Processing complete | "[Document] processing complete" | Opens document |
| Mention | "[Name] mentioned you in [Context]" | Opens context |
| Alert | "Cost threshold exceeded" | Opens analytics |
| System | "Scheduled maintenance in 1 hour" | Opens announcement |

---

## 9. Platform-Specific Conventions

### iOS
- Use SF Symbols for icons (fallback to custom)
- HIG-compliant navigation
- Spring animations
- Native share sheet
- Face ID / Touch ID for auth
- Live activities for long operations

### Android
- Use Material icons for icons (fallback to custom)
- Material Design navigation
- Ripple effects for touch feedback
- Android share intent
- BiometricPrompt for auth
- Notification channels for settings

---

## 10. Mobile-First Design Process

1. Design for mobile first (smallest screen)
2. Add tablet adaptations
3. Add desktop adaptations
4. Verify all breakpoints
5. Test on physical devices (not just simulators)
