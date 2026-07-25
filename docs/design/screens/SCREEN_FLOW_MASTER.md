# Screen Flow Master — Atlas AI Navigation Graph

## Overview

Complete navigation architecture for all 40 screens. Defines every transition, deep link, back stack rule, modal hierarchy, and navigation guard.

---

## Navigation Architecture

### Stack Model

| Stack | Purpose | Max Depth | Clear Behavior |
|-------|---------|-----------|----------------|
| **Auth** | Unauthenticated flow | 5 | Cleared on login |
| **Main** | Primary app navigation | 10 | Persistent during session |
| **Modal** | Overlay screens | 3 | Dismissed on Esc/backdrop |
| **System** | OS-level dialogs | 1 | OS-controlled |

### Navigation Types

| Type | Animation | Back Behavior |
|------|-----------|---------------|
| Push (stack) | Slide left → | Back navigates to parent |
| Replace (reset) | Fade | Clears back stack |
| Modal (sheet) | Slide up | Dismiss on Esc/backdrop/swipe |
| Overlay (popover) | Fade + scale | Tap outside dismisses |
| Deep link | No animation | Resolves to target screen |
| Tab switch | Instant/Cross-fade | Preserves tab state |

---

## Screen Groups

| Group | Screens | Auth Required |
|-------|---------|---------------|
| **Auth** | 01–04 | No |
| **Onboarding** | 05 | Weak (partial token) |
| **Dashboard** | 06–07 | Yes |
| **Profile & Settings** | 08–10 | Yes |
| **Material Management** | 11–20 | Yes |
| **Analytics & Admin** | 21–24 | Yes |
| **AI Suite** | 25–28 | Yes |
| **Activity & Logs** | 29–30 | Yes |
| **System States** | 31–34 | Varies |
| **Utility** | 35–40 | No (35, 37, 38, 39, 40) / Yes (36) |

---

## Complete Transition Graph

### Auth Flow (01–05)

```
[App Launch]
     │
     ▼
┌──────────────────────────────────────────────────┐
│  35 — Splash                                     │
│  ├─ session exists → 06/07 Dashboard             │
│  ├─ first launch   → 05 Onboarding               │
│  └─ no session    → 01 Login                     │
└──────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────┐
│  01 — Auth Login                                 │
│  ├─ email/password success → 06/07 Dashboard     │
│  ├─ SSO success            → 06/07 Dashboard     │
│  ├─ "Sign up"              → 02 Auth Register    │
│  ├─ "Forgot password?"     → 03 Forgot Password  │
│  └─ session expired 401    → (replace) 01 Login  │
└──────────────────────────────────────────────────┘
     │
     ├──────────────────────────────────────┐
     ▼                                      ▼
┌─────────────────────┐        ┌─────────────────────────────┐
│ 02 — Auth Register  │        │ 03 — Auth Forgot Password   │
│ ├─ success → 04 OTP │        │ ├─ email sent → 04 OTP     │
│ │ (replace)         │        │ └─ back → 01 Login         │
│ └─ back → 01 Login  │        └─────────────────────────────┘
└─────────┬───────────┘                       │
          ▼                                   ▼
┌────────────────────────────────────────────────────────────┐
│  04 — Auth Verify OTP                                      │
│  ├─ registration OTP match → 05 Onboarding (replace)       │
│  ├─ password reset OTP     → 01 Login (password reset)     │
│  ├─ MFA OTP match          → 06/07 Dashboard (replace)     │
│  ├─ resend OTP             → (same screen, refresh)        │
│  └─ back → previous screen                                 │
└────────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────────┐
│  05 — Onboarding                                           │
│  ├─ complete (manager)   → 06 Dashboard Manager (replace) │
│  ├─ complete (mechanic)  → 07 Dashboard Mechanic (replace)│
│  ├─ skip                 → 06/07 Dashboard (replace)       │
│  └─ back                 → 04 Auth Verify OTP              │
└────────────────────────────────────────────────────────────┘
```

### Dashboard & Profile (06–10)

```
┌─────────────────────────────────────────────────────────────┐
│  06 — Dashboard Manager                                     │
│  07 — Dashboard Mechanic                                    │
│                                                              │
│  Common transitions:                                        │
│  ├─ Dashboard card click → 11 Materials List (+filter)      │
│  ├─ Dashboard card click → 12 Material Card (specific)      │
│  ├─ Dashboard card click → 21 Analytics (manager)           │
│  ├─ Dashboard AI widget  → 25 AI Assistant                  │
│  ├─ Quick action (Issue) → 16 Issue Material                │
│  ├─ Quick action (Return)→ 17 Return Material               │
│  ├─ Quick action (QR)    → 19 QR Scanner                    │
│  ├─ Quick action (Resv.)→ 18 Reservations                   │
│  ├─ Notifications badge  → 10 Notifications                 │
│  ├─ Top bar avatar       → 08 Profile                       │
│  ├─ Top bar search       → 20 Search                        │
│  ├─ Sidebar Navigation   → Any main screen                  │
│  └─ Sidebar "Help"       → 38 Help                          │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  08 — Profile                                               │
│  ├─ "Settings"           → 09 Settings                      │
│  ├─ "Notifications"      → 10 Notifications                 │
│  ├─ Edit inline          → (inline edit)                    │
│  └─ Back                 → Previous screen                  │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  09 — Settings                                              │
│  ├─ "Notifications"      → 10 Notifications                 │
│  ├─ "Workspace"          → 24 Workspaces                    │
│  ├─ "Team"               → 23 Users                         │
│  ├─ "API Keys"           → (inline section)                 │
│  ├─ "About"              → 39 About                         │
│  ├─ "Help"               → 38 Help                          │
│  ├─ "Check for updates"  → 36 App Update                    │
│  └─ Back                 → 08 Profile                       │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  10 — Notifications                                         │
│  ├─ Notification tap      → 12 Material Card (related)      │
│  ├─ Notification tap      → (task detail)                   │
│  ├─ Notification tap      → 22 Reports (report ready)       │
│  ├─ "View all activity"   → 29 Activity                     │
│  └─ Back                  → Previous screen                 │
└─────────────────────────────────────────────────────────────┘
```

### Material Management Core (11–15)

```
┌─────────────────────────────────────────────────────────────┐
│  11 — Materials List                                        │
│  ├─ Row click            → 12 Material Card                  │
│  ├─ "Create" button      → 13 Create Material               │
│  ├─ Issue action         → 16 Issue Material                │
│  ├─ Return action        → 17 Return Material               │
│  ├─ Search bar           → 20 Search                        │
│  ├─ Filter bar           → (inline filter)                  │
│  └─ Back                 → Dashboard / Sidebar nav          │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  12 — Material Card (Detail)                                │
│  ├─ "Edit"               → 14 Edit Material                 │
│  ├─ "Issue"              → 16 Issue Material                │
│  ├─ "Return"             → 17 Return Material               │
│  ├─ "Reserve"            → 18 Reservations                  │
│  ├─ "View all movements" → 15 Movement History              │
│  ├─ "Ask AI about this"  → 26 AI Chat (context: material)   │
│  ├─ QR code tap          → 19 QR Scanner                    │
│  └─ Back                 → 11 Materials List                │
└─────────┬───────────────────────────────────────────────────┘
          │
          ├──────────────────────────────────────┐
          ▼                                      ▼
┌─────────────────────┐        ┌─────────────────────────────┐
│ 13 — Create Material│        │ 14 — Edit Material          │
│ ├─ Save success      │        │ ├─ Save success            │
│ │ → 12 Material Card│        │ │ → 12 Material Card        │
│ │   (new) (replace)  │        │ │   (updated) (replace)    │
│ └─ Cancel → 11 List  │        │ └─ Cancel → 12 Material    │
└──────────────────────┘        └────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  15 — Movement History                                      │
│  ├─ Material link      → 12 Material Card                   │
│  ├─ Task link          → (task detail screen)               │
│  └─ Back               → 12 Material Card / 11 List        │
└─────────────────────────────────────────────────────────────┘
```

### Material Actions (16–20)

```
┌─────────────────────┐    ┌─────────────────────┐
│ 16 — Issue Material │    │ 17 — Return Material │
│ ├─ Confirm → Success│    │ ├─ Confirm → Success│
│ │ → 15 Movement Hist│    │ │ → 15 Movement Hist│
│ │ → 12 Material Card│    │ │ → 12 Material Card│
│ └─ Cancel → Previous│    │ └─ Cancel → Previous│
└─────────┬───────────┘    └─────────┬───────────┘
          │                          │
          └──────────┬───────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  18 — Reservations                                          │
│  ├─ Reserve material  → (confirmation inline)               │
│  ├─ Issue from resv.  → 16 Issue Material (prefilled)      │
│  ├─ Reservation tap   → 12 Material Card                    │
│  └─ Back              → Previous                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  19 — QR Scanner                                            │
│  ├─ Scan success (material) → 12 Material Card              │
│  ├─ Scan (issue mode)       → 16 Issue Material (prefilled)│
│  ├─ Scan (return mode)      → 17 Return Material (prefilled)│
│  ├─ Manual entry            → (inline text input)            │
│  ├─ Camera permission denied→ 37 Permission Requests         │
│  └─ Close                   → Previous screen                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  20 — Search                                                │
│  ├─ Result (material) → 12 Material Card                    │
│  ├─ Result (task)     → (task detail)                       │
│  ├─ Result (user)     → 23 Users / 08 Profile               │
│  ├─ Result (report)   → 22 Reports                          │
│  ├─ Result (knowledge)→ 28 AI Knowledge                     │
│  ├─ Result (AI chat)  → 26 AI Chat                          │
│  ├─ <Esc>              → Close overlay                      │
│  └─ Back               → Previous screen                    │
└─────────────────────────────────────────────────────────────┘
```

### Analytics & Admin (21–24)

```
┌─────────────────────────────────────────────────────────────┐
│  21 — Analytics                                             │
│  ├─ Drill-down chart  → 12 Material Card (material)         │
│  ├─ "Generate Report" → 22 Reports                          │
│  ├─ Export             → (download action)                  │
│  └─ Back               → Dashboard / Sidebar                │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  22 — Reports                                               │
│  ├─ Report click       → (report viewer / detail)           │
│  ├─ "Generate"         → 21 Analytics (with params)         │
│  ├─ Download/Export    → (file download action)             │
│  └─ Back               → 21 Analytics / Sidebar             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  23 — Users                                                 │
│  ├─ User click         → 08 Profile (user detail)           │
│  ├─ "Invite"           → (inline invite form)               │
│  ├─ Role editor        → (inline/modal)                     │
│  ├─ Workspace scope    → 24 Workspaces                      │
│  └─ Back               → Settings / Sidebar                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  24 — Workspaces                                            │
│  ├─ Workspace click    → Dashboard (scoped)                 │
│  ├─ "Settings"         → 09 Settings (scoped)               │
│  ├─ "Users"            → 23 Users (scoped)                  │
│  ├─ "Materials"        → 11 Materials List (scoped)         │
│  ├─ Workspace switcher → (top bar, instant switch)          │
│  └─ Back               → Settings / Sidebar                 │
└─────────────────────────────────────────────────────────────┘
```

### AI Suite (25–28)

```
┌─────────────────────────────────────────────────────────────┐
│  25 — AI Assistant (Hub)                                    │
│  ├─ "New Chat"          → 26 AI Chat (new conversation)     │
│  ├─ "Prompts"           → 27 AI Prompts                     │
│  ├─ "Knowledge"         → 28 AI Knowledge                   │
│  ├─ Suggested prompt    → 26 AI Chat (with prompt)          │
│  └─ Back                → Dashboard / Sidebar               │
└─────────┬───────────────────────────────────────────────────┘
          │
          ├──────────────────────────────────────┐
          ▼                                      ▼
┌─────────────────────┐        ┌─────────────────────────────┐
│ 26 — AI Chat        │        │ 27 — AI Prompts             │
│ ├─ Send message      │        │ ├─ Prompt click            │
│ ├─ AI action result  │        │ │ → 26 AI Chat (applied)   │
│ │ → 12 Material Card│        │ ├─ Edit prompt              │
│ │ → 22 Reports       │        │ │ → (inline/edit modal)    │
│ │ → (navigate)       │        │ └─ Back → 25 AI Assistant  │
│ ├─ "Prompts"         │        └─────────────────────────────┘
│ │ → 27 AI Prompts    │
│ ├─ "Knowledge"       │
│ │ → 28 AI Knowledge  │
│ └─ Back              │
└─────────┬────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  28 — AI Knowledge                                           │
│  ├─ Article click     → (article detail)                     │
│  ├─ "Ask AI about"    → 26 AI Chat (context: article)       │
│  ├─ Related articles  → (same screen, new article)          │
│  ├─ Search            → 20 Search (filtered: knowledge)     │
│  └─ Back              → 25 AI Assistant                     │
└─────────────────────────────────────────────────────────────┘
```

### Activity & Logs (29–30)

```
┌─────────────────────────────────────────────────────────────┐
│  29 — Activity                                              │
│  ├─ Activity item tap  → 12 Material Card (material)        │
│  ├─ Activity item tap  → 08 Profile (user)                  │
│  ├─ Activity item tap  → 15 Movement History (movement)     │
│  ├─ "View audit log"   → 30 System Logs                     │
│  └─ Back               → Dashboard / Sidebar                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  30 — System Logs (Admin only)                              │
│  ├─ Log entry tap      → (inline detail expand)             │
│  ├─ "View in Activity" → 29 Activity (filtered)             │
│  ├─ Export             → (file download)                    │
│  └─ Back               → Settings / Sidebar                 │
└─────────────────────────────────────────────────────────────┘
```

### System States (31–34)

```
┌─────────────────────────────────────────────────────────────┐
│  31 — Empty States                                          │
│  ├─ "Create" CTA      → 13 Create Material (material)       │
│  ├─ "Import" CTA      → (import flow)                       │
│  ├─ "Go to Settings"  → 09 Settings                         │
│  ├─ "Learn more"      → 38 Help                             │
│  └─ Back / Dismiss    → Previous screen                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  32 — Error States                                          │
│  ├─ "Retry"            → (repeat failed action)             │
│  ├─ "Go Home"          → 06/07 Dashboard (replace)          │
│  ├─ "Sign Out"         → 01 Login (replace, clear stack)    │
│  ├─ "Contact Support"  → 38 Help                            │
│  ├─ "Check settings"   → 09 Settings                        │
│  └─ Back               → Previous screen                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  33 — Loading States                                        │
│  ├─ Success            → (target content screen)            │
│  ├─ Failure timeout    → 32 Error States                    │
│  └─ Cancel             → Previous screen                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  34 — Offline Mode                                          │
│  ├─ Connectivity restore → (automatic, return to online)    │
│  ├─ Manual retry          → (repeat failed request)         │
│  ├─ View cached data      → 11 Materials List (cached)      │
│  └─ Dismiss               → Current screen (offline banner) │
└─────────────────────────────────────────────────────────────┘
```

### Utility Screens (35–40)

```
┌─────────────────────────────────────────────────────────────┐
│  35 — Splash (Launch)                                       │
│  ├─ Session exists     → 06/07 Dashboard (replace)          │
│  ├─ First launch       → 05 Onboarding (replace)            │
│  └─ No session         → 01 Login (replace)                 │
│  (All transitions: replace, clear stack)                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  36 — App Update                                            │
│  ├─ "Update Now"       → App Store / Download (external)    │
│  ├─ "Remind Later"     → Dismiss (return to app)            │
│  ├─ "What's New"       → (inline expanded list)             │
│  └─ Dismiss            → Previous / Current screen          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  37 — Permission Requests                                   │
│  ├─ "Allow" (granted)  → (return to caller feature)         │
│  ├─ "Don't Allow"      → Settings fallback / feature retry  │
│  ├─ "Go to Settings"   → 09 Settings (OS settings link)     │
│  └─ Dismiss            → Previous screen                    │
│  (Caller screens: 19 QR Scanner, 10 Notifications,          │
│   file upload, location features)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  38 — Help & Support                                        │
│  ├─ Quick link click   → 28 AI Knowledge (article)          │
│  ├─ "Contact Support"  → (email/chat external)              │
│  ├─ "AI Chat"          → 26 AI Chat                         │
│  ├─ "Tutorials"        → 05 Onboarding (replay)             │
│  ├─ "Keyboard Shortcuts"→ 40 Command Palette (reference)    │
│  ├─ "About"            → 39 About                           │
│  └─ Back               → Previous screen                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  39 — About                                                 │
│  ├─ "Check for Updates" → 36 App Update                     │
│  ├─ "Open Source Licenses"→ (licenses list/scroll view)     │
│  ├─ "Privacy Policy"    → (external link / webview)         │
│  ├─ "Terms of Service"  → (external link / webview)         │
│  └─ Back                → 09 Settings / 38 Help             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  40 — Command Palette (Overlay)                             │
│  ├─ Navigate command   → (target screen, close palette)     │
│  ├─ Action command     → (execute action, close palette)    │
│  ├─ Search query       → 20 Search (with query)             │
│  ├─ <Esc>              → Close overlay                      │
│  └─ Click outside       → Close overlay                     │
│  (Accessible from ANY screen via Cmd+K / Ctrl+K)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Back Stack Rules

### Auth Stack

| Transition | Back Stack Action |
|---|---|
| 35 Splash → 01 Login | Replace: clear all |
| 35 Splash → 05 Onboarding | Replace: clear all |
| 35 Splash → 06/07 Dashboard | Replace: clear all |
| 01 Login → 02 Register | Push |
| 01 Login → 03 Forgot Password | Push |
| 02 Register → 04 OTP | Replace (cannot go back to register) |
| 03 Forgot Password → 04 OTP | Replace (cannot go back to forgot) |
| 04 OTP → 05 Onboarding | Replace |
| 04 OTP → 06/07 Dashboard | Replace: clear auth stack |
| 05 Onboarding → 06/07 Dashboard | Replace: clear auth + onboarding |

### Main Stack

| Transition | Back Stack Action |
|---|---|
| Any sidebar nav | Push with stack reset |
| 11 List → 12 Detail | Push |
| 12 Detail → 14 Edit | Push (edit tag) |
| 12 Detail → 15 History | Push |
| 12 Detail → 16 Issue | Push |
| 11 List → 13 Create | Push |
| 13 Create → 12 Detail | Replace |
| 14 Edit → 12 Detail | Replace |
| 16 Issue → 15 History | Replace |
| 17 Return → 15 History | Replace |
| 18 Reservations → 16 Issue | Push |
| 21 Analytics → 22 Reports | Push |
| 06/07 Dashboard → any | Push (or tab switch) |

### Modal Stack

| Transition | Back Stack Action |
|---|---|
| 40 Command Palette | Overlay (not in stack) |
| 37 Permission Requests | System modal (not in stack) |
| Any → 36 App Update | Modal (push) |
| 19 QR Scanner | Modal (push) |
| Multiple modals | Max depth 3 |

### Back Button Behavior (Android / Web)

| Context | Behavior |
|---|---|
| Auth flow (step) | Go to previous step |
| Auth flow (first screen) | Close app / "Exit app?" confirm |
| Main stack (depth > 1) | Pop to previous screen |
| Main stack (depth = 1) | Go to Dashboard (do NOT close app) |
| Modal open | Dismiss modal (not pop screen) |
| Command palette open | Close palette |
| Search open | Close search (restore previous state) |

---

## Deep Link Registry

| Deep Link | Target Screen | Auth | Notes |
|---|---|---|---|
| `atlas://login` | 01 Login | No | |
| `atlas://register` | 02 Register | No | |
| `atlas://reset-password` | 03 Forgot Password | No | |
| `atlas://onboarding` | 05 Onboarding | Weak | |
| `atlas://dashboard` | 06/07 Dashboard | Yes | Role-based routing |
| `atlas://materials` | 11 Materials List | Yes | |
| `atlas://material/{id}` | 12 Material Card | Yes | |
| `atlas://material/{id}/edit` | 14 Edit Material | Yes | |
| `atlas://material/{id}/movements` | 15 Movement History | Yes | |
| `atlas://material/create` | 13 Create Material | Yes | |
| `atlas://material/{id}/issue` | 16 Issue Material | Yes | |
| `atlas://material/{id}/return` | 17 Return Material | Yes | |
| `atlas://material/{id}/reserve` | 18 Reservations | Yes | |
| `atlas://scanner` | 19 QR Scanner | Yes | |
| `atlas://search?q={query}` | 20 Search | Yes | |
| `atlas://analytics` | 21 Analytics | Yes | |
| `atlas://reports` | 22 Reports | Yes | |
| `atlas://reports/{id}` | 22 Reports | Yes | |
| `atlas://users` | 23 Users | Yes | Admin |
| `atlas://users/{id}` | 08 Profile | Yes | |
| `atlas://workspaces` | 24 Workspaces | Yes | |
| `atlas://workspaces/{id}` | 24 Workspaces | Yes | |
| `atlas://ai` | 25 AI Assistant | Yes | |
| `atlas://ai/chat` | 26 AI Chat | Yes | |
| `atlas://ai/prompts` | 27 AI Prompts | Yes | |
| `atlas://ai/knowledge` | 28 AI Knowledge | Yes | |
| `atlas://ai/knowledge/{id}` | 28 AI Knowledge | Yes | |
| `atlas://activity` | 29 Activity | Yes | |
| `atlas://logs` | 30 System Logs | Yes | Admin |
| `atlas://notifications` | 10 Notifications | Yes | |
| `atlas://profile` | 08 Profile | Yes | |
| `atlas://settings` | 09 Settings | Yes | |
| `atlas://help` | 38 Help | No | |
| `atlas://about` | 39 About | No | |
| `atlas://updates` | 36 App Update | No | |

### Deep Link Resolution Algorithm

```
1. Check auth status
2. If auth required and no session → redirect to 01 Login
   (preserve deep link URL for post-auth redirect)
3. If multi-tenant → validate workspace access
4. If role-restricted → check user role; show 32 Error States if denied
5. Resolve to target screen with any parameters
6. Clear splash from stack if present
```

---

## Navigation Guards

| Guard | Rule |
|---|---|
| **Auth Gate** | Any screen with Auth Required = Yes → redirect to 01 Login if no session |
| **Role Gate** | 30 System Logs → admin only; 23 Users → admin/manager |
| **Workspace Gate** | Screens scoped to workspace → validate membership |
| **Permission Gate** | 19 QR Scanner → requires camera permission |
| **Feature Gate** | 25–28 AI Suite → requires AI feature flag |
| **Sync Gate** | Offline screen modifications → queue for sync, show 34 Offline Mode |
| **Rate Limit Gate** | 01 Login → max 5 attempts/min |
| **Deep Link Gate** | Deep link → validate target exists, role, workspace |

---

## Modal & Overlay Hierarchy

### Top (always-on-top)
```
┌─────────────────────────────────────────────┐
│  40 — Command Palette (Cmd+K / Ctrl+K)       │
│  (floats above ALL content)                  │
├─────────────────────────────────────────────┤
│  37 — Permission Requests (system dialog)    │
│  (OS-level, above everything)                │
├─────────────────────────────────────────────┤
│  36 — App Update (modal)                     │
│  (above main content, not above system)      │
├─────────────────────────────────────────────┤
│  20 — Search (overlay)                       │
│  (above main, below command palette)         │
├─────────────────────────────────────────────┤
│  19 — QR Scanner (modal)                     │
│  (full-screen camera overlay)                │
├─────────────────────────────────────────────┤
│  Toasts → 5s auto-dismiss                    │
│  Snackbars → action or dismiss               │
│  Tooltips → hover/focus                      │
│  Dropdowns → click outside                   │
└─────────────────────────────────────────────┘
```

### Z-Index Stack

| Layer | Z-Index | Screens |
|-------|---------|---------|
| Content | 0–99 | All main screens |
| Sticky elements (sidebar header) | 100 | Main navigation |
| Dropdowns, tooltips, popovers | 200–299 | Contextual overlays |
| Search overlay | 300–399 | 20 Search |
| Bottom sheet, drawer | 400–499 | Modals |
| Full-screen modal | 500–599 | 19 QR Scanner, 36 App Update |
| Command palette | 600–699 | 40 Command Palette |
| System permission dialog | 700–799 | 37 Permission Requests |
| Toast / Snackbar | 800–899 | Notifications |

---

## Transition Animation Matrix

| Transition | Enter | Exit | Duration |
|---|---|---|---|
| Stack push (screen A → B) | Slide left 100% → 0% | Slide left 0% → -30% | 300ms ease-out |
| Stack pop (back) | Slide right -30% → 0% | Slide right 0% → 100% | 300ms ease-out |
| Modal open (full screen) | Slide up 100% → 0% | — | 350ms ease-out |
| Modal close | — | Slide down 0% → 100% | 250ms ease-in |
| Tab switch (dashboard tabs) | Cross-fade | Cross-fade | 200ms ease |
| Command palette open | Fade in + scale 0.95→1 | — | 150ms ease-out |
| Command palette close | — | Fade out + scale 1→0.95 | 100ms ease-in |
| Deep link / Replace | Fade in | Fade out | 200ms ease |
| QR scanner open | Camera zoom in | — | 400ms ease-out |
| Search overlay open | Fade in + slide down | — | 200ms ease-out |
| Search overlay close | — | Fade out + slide up | 150ms ease-in |

---

## Tab / Section Navigation

### Dashboard Tabs (06, 07)

| Tab | Content | Transition |
|---|---|---|
| Overview | KPI cards + charts | Default |
| Recent Activity | Activity feed | Tab switch |
| Quick Actions | Action grid | Tab switch |
| My Tasks | Task list | Tab switch |

### Profile Tabs (08)

| Tab | Content | Transition |
|---|---|---|
| Profile | Info + avatar | Default |
| Account | Email, password, 2FA | Tab switch |
| Preferences | Theme, language, notifications | Tab switch |

### Material Detail Tabs (12)

| Tab | Content | Transition |
|---|---|---|
| Overview | Key fields + status | Default |
| Specifications | Technical specs JSON | Tab switch |
| Movements | Recent movements (up to 5) | Tab switch |
| Related | Linked materials | Tab switch |

### AI Assistant Tabs (25)

| Tab | Content | Transition |
|---|---|---|
| Chat | 26 AI Chat embed | Inline |
| Prompts | 27 AI Prompts embed | Inline |
| Knowledge | 28 AI Knowledge embed | Inline |

---

## Cross-Group Navigation Summary

```
                    ┌────────────────────┐
                    │  35 Splash         │
                    └────────┬───────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ 01-04 Auth │  │ 05 Onboard │  │ 06-07 Dash │
     └────────────┘  └────────────┘  └─────┬──────┘
                                           │
              ┌─────────────────────────────┼──────────────────────┐
              ▼              ▼              ▼              ▼       ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐  ┌────────┐
     │ 08-10     │  │ 11-20     │  │ 21-24     │  │ 25-28 │  │ 29-30 │
     │ Profile   │  │ Materials │  │ Admin     │  │ AI    │  │ Logs  │
     └────────────┘  └────────────┘  └────────────┘  └────────┘  └────────┘
                                           │
                              ┌────────────┼────────────┐
                              ▼            ▼            ▼
                     ┌────────────┐  ┌────────────┐  ┌────────────┐
                     │ 31-34     │  │ 36-39     │  │ 40 Cmd    │
                     │ System    │  │ Utility   │  │ Palette   │
                     └────────────┘  └────────────┘  └────────────┘
```

### Transition Counts

| From Group | To Group | Transitions |
|---|---|---|
| Auth (01–04) | Dashboard (06–07) | 4 |
| Auth (01–04) | Onboarding (05) | 2 |
| Splash (35) | Auth/Onboarding/Dashboard | 3 |
| Dashboard (06–07) | All groups | ~20 |
| Materials (11–20) | Materials (internal) | ~25 |
| AI (25–28) | Materials/Analytics | ~8 |
| Any | Command Palette (40) | 1 (universal) |
| Any | Error/Loading/Offline (31–34) | Universal |
| Utility (36–39) | Each other | ~6 |

---

## Navigation Readiness Assessment

| Criteria | Status |
|---|---|
| All 40 screens mapped | ✅ |
| All 40 screens have identified entry points | ✅ |
| Auth flow with guard rules | ✅ |
| Deep link registry (37 links) | ✅ |
| Back stack rules per transition | ✅ |
| Modal / overlay hierarchy | ✅ |
| Z-index stack defined | ✅ |
| Transition animations matrix | ✅ |
| Role-based routing (manager vs mechanic) | ✅ |
| Permission-based routing (camera) | ✅ |
| Feature flag routing (AI suite) | ✅ |
| Universal command palette access | ✅ |
| Error / Loading / Offline integration | ✅ |
| Tab navigation within screens | ✅ |
| Cross-group navigation graph | ✅ |
