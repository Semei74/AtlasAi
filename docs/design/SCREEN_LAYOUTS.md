# Screen Layouts

> **Part of:** Atlas AI Enterprise Design System v1.0  
> **Status:** Production Ready

---

## Table of Contents

1. [Layout Principles](#1-layout-principles)
2. [Screen Template Index](#2-screen-template-index)
3. [1. Login Screen](#3-login-screen)
4. [2. Dashboard Screen](#4-dashboard-screen)
5. [3. CRUD List Screen](#5-crud-list-screen)
6. [4. CRUD Detail Screen](#6-crud-detail-screen)
7. [5. Create/Edit Screen](#7-createedit-screen)
8. [6. Wizard Screen](#8-wizard-screen)
9. [7. Settings Screen](#9-settings-screen)
10. [8. Analytics Screen](#10-analytics-screen)
11. [9. Profile Screen](#11-profile-screen)
12. [10. Empty State Screen](#12-empty-state-screen)
13. [11. Error Screen](#13-error-screen)
14. [12. Loading Screen](#14-loading-screen)
15. [13. Landing/Marketing Screen](#15-landingmarketing-screen)
16. [14. AI Chat Screen](#16-ai-chat-screen)
17. [15. Search Results Screen](#17-search-results-screen)
18. [16. Onboarding Screen](#18-onboarding-screen)

---

## 1. Layout Principles

1. **Every screen has a clear primary action.** The user always knows what to do next.
2. **Navigation is consistent.** Top bar, sidebar, and content area follow the same structure across all screens.
3. **Content is scannable.** Headers, whitespace, and visual hierarchy guide the eye.
4. **Empty states are designed.** Every screen considers: no data, error, loading, and first-use states.
5. **Responsive by default.** Every template works from mobile to ultrawide desktop.

---

## 2. Screen Template Index

| # | Template | Purpose | Primary Action |
|---|----------|---------|----------------|
| 1 | Login | Authentication | Log in |
| 2 | Dashboard | Overview, KPIs | Navigate to first section |
| 3 | CRUD List | List items | Create new / Search |
| 4 | CRUD Detail | View single item | Edit / Delete |
| 5 | Create/Edit | Create or edit item | Save |
| 6 | Wizard | Multi-step flow | Next / Submit |
| 7 | Settings | User/App configuration | Save / Auto-save |
| 8 | Analytics | Data analysis, charts | Filter / Export |
| 9 | Profile | User profile | Edit profile |
| 10 | Empty State | No content | Create first item |
| 11 | Error | Error recovery | Retry / Go home |
| 12 | Loading | Content loading | Wait / Cancel |
| 13 | Landing | Marketing, showcase | Sign up / CTA |
| 14 | AI Chat | AI conversation | Send message |
| 15 | Search Results | Search results | Navigate to result |
| 16 | Onboarding | First-time setup | Next / Get started |

---

## 3. Login Screen

### 3.1 Purpose
User authentication — sign in, sign up, password reset.

### 3.2 Layout (Desktop)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─ Brand Area ──────────────────────────────────────────┐   │
│  │  ┌────────────────────────┐  ┌──────────────────────┐ │   │
│  │  │                        │  │  ┌────────────────┐  │ │   │
│  │  │  Brand Illustration    │  │  │  Sign In Form   │  │ │   │
│  │  │  (optional)            │  │  │  ────────────  │  │ │   │
│  │  │                        │  │  │  Email          │  │ │   │
│  │  │                        │  │  │  ────────────  │  │ │   │
│  │  │                        │  │  │  Password       │  │ │   │
│  │  │                        │  │  │  ────────────  │  │ │   │
│  │  │                        │  │  │  Remember me    │  │ │   │
│  │  │                        │  │  │  ────────────  │  │ │   │
│  │  │                        │  │  │  Sign In btn    │  │ │   │
│  │  │                        │  │  │  ────────────  │  │ │   │
│  │  │                        │  │  │  Forgot pwd?    │  │ │   │
│  │  │                        │  │  │  Sign up link   │  │ │   │
│  │  │                        │  │  └────────────────┘  │ │   │
│  │  └────────────────────────┘  └──────────────────────┘ │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  Footer: Copyright, Terms, Privacy                           │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Layout (Mobile)

```
┌────────────────┐
│                │
│  Logo (40px)   │
│                │
│  ┌──────────┐  │
│  │ Sign In  │  │
│  │          │  │
│  │ Email    │  │
│  │          │  │
│  │ Password │  │
│  │          │  │
│  │ Remember │  │
│  │          │  │
│  │ [Sign In]│  │
│  │          │  │
│  │ Forgot?  │  │
│  └──────────┘  │
│                │
│  Sign up link  │
└────────────────┘
```

### 3.4 Specs
```
Form width: 400px (desktop), 100% (mobile)
Form padding: 32px (card)
Centered: Vertically and horizontally
Brand illustration: 480px wide (hidden on mobile)
Background: bg-primary with subtle gradient
Max width container: 960px
```

### 3.5 States
- **Default:** Clean form, cursor in email field
- **Loading:** Spinner in button, "Signing in..."
- **Error:** Inline error on field, or banner for general error
- **Success:** Redirect to dashboard
- **SSO:** "Continue with Google/SSO" buttons above form

---

## 4. Dashboard Screen

### 4.1 Purpose
First screen after login. Shows overview, KPIs, recent activity.

### 4.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (56px)                    Help  Notif  Avatar      │
├────────┬────────────────────────────────────────────────────┤
│        │  Page Header "Dashboard"            Date Range     │
│ Side   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│ Bar    │  │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │             │
│ (240px)│  └──────┘ └──────┘ └──────┘ └──────┘             │
│        │                                                     │
│        │  ┌──────────────────────────────────────────┐       │
│        │  │  Main Chart (Line/Bar)                   │       │
│        │  └──────────────────────────────────────────┘       │
│        │                                                     │
│        │  ┌────────────────────┐ ┌────────────────────┐      │
│        │  │  Recent Activity   │ │  Quick Actions     │      │
│        │  │  - Item 1          │ │  - Create report   │      │
│        │  │  - Item 2          │ │  - Invite users    │      │
│        │  │  - Item 3          │ │  - View all        │      │
│        │  └────────────────────┘ └────────────────────┘      │
│        │                                                     │
│        │  ┌──────────────────────────────────────────┐       │
│        │  │  Secondary Chart or Table                 │       │
│        │  └──────────────────────────────────────────┘       │
└────────┴─────────────────────────────────────────────────────┘
```

### 4.3 Grid Specs
```
Desktop (≥1280px):  4 KPI cards, full chart, 2-column bottom
Tablet (768–1024px): 2 KPI cards (2 rows), chart full width, single column bottom
Mobile (<768px):     2 KPI cards per row (wrap), chart full, single column bottom
Gap: 16px all
```

### 4.4 States
- **Default:** Show actual data
- **Loading:** Skeleton cards + skeleton chart
- **Empty (first visit):** Onboarding prompts
- **Error:** Banner "Could not load dashboard data" + retry

---

## 5. CRUD List Screen

### 5.1 Purpose
List items with search, filter, and bulk actions.

### 5.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Page Header "Items"                    + Create   │
│ Side   │  Search Bar ──────────────────────────────         │
│ Bar    │  Filter Bar: [Status▾] [Type▾] [Owner▾] [+Add]   │
│        │                                                     │
│        │  ┌────────────────────────────────────────────┐     │
│        │  │  A. Bar: "3 selected" [Action1] [Action2] │     │
│        │  │  ┌────┬────────┬───────┬────────┬────────┐│     │
│        │  │  │ ☐  │ Name   │ Status│ Owner  │ Date   ││     │
│        │  │  ├────┼────────┼───────┼────────┼────────┤│     │
│        │  │  │ ☐  │ Item 1 │ Active│ Alice  │ 1/15   ││     │
│        │  │  │ ☐  │ Item 2 │ Draft │ Bob    │ 1/14   ││     │
│        │  │  │ ☐  │ Item 3 │ Active│ Carol  │ 1/13   ││     │
│        │  │  └────┴────────┴───────┴────────┴────────┘│     │
│        │  │  Pagination: ← 1 2 3 ... 10 →  100 items  │     │
│        │  └────────────────────────────────────────────┘     │
└────────┴─────────────────────────────────────────────────────┘
```

### 5.3 States
- **Default:** Table with data
- **Loading:** Skeleton rows (5)
- **Empty:** Empty state with "Create first item" CTA
- **Filtered no results:** "No items match filters" + "Clear filters"
- **Error:** Error state + retry

---

## 6. CRUD Detail Screen

### 6.1 Purpose
View details of a single item.

### 6.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Breadcrumb: Home > Items > Item Name              │
│ Side   │  Page Header "Item Name"           [Edit] [Delete] │
│ Bar    │                                                     │
│        │  ┌────────────────────────────────────────────┐     │
│        │  │  Detail Section                             │     │
│        │  │  ┌────────────┬──────────────────────┐     │     │
│        │  │  │ Field      │ Value                │     │     │
│        │  │  ├────────────┼──────────────────────┤     │     │
│        │  │  │ Status     │ Active badge         │     │     │
│        │  │  │ Name       │ Item 1               │     │     │
│        │  │  │ Owner      │ Alice (avatar+name)  │     │     │
│        │  │  │ Created    │ Jan 15, 2024         │     │     │
│        │  │  └────────────┴──────────────────────┘     │     │
│        │  └────────────────────────────────────────────┘     │
│        │                                                     │
│        │  ┌────────────────────────────────────────────┐     │
│        │  │  Related Items / Activity Log               │     │
│        │  └────────────────────────────────────────────┘     │
└────────┴─────────────────────────────────────────────────────┘
```

### 6.3 States
- **Default:** Show data
- **Loading:** Skeleton detail card
- **Not found:** "Item not found" error
- **Edit mode:** Fields become editable
- **Delete:** Confirmation dialog + redirect

---

## 7. Create/Edit Screen

### 7.1 Purpose
Create or edit a single item.

### 7.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Breadcrumb: Home > Items > {New / Edit}           │
│ Side   │  Page Header "{Create} / {Edit} Item"              │
│ Bar    │                                                     │
│        │  ┌────────────────────────────────────────────┐     │
│        │  │  Form                                       │     │
│        │  │  ┌─ Section 1 ──────────────────────────┐  │     │
│        │  │  │  Name _________________               │  │     │
│        │  │  │  Description _________________        │  │     │
│        │  │  └───────────────────────────────────────┘  │     │
│        │  │  ┌─ Section 2 ──────────────────────────┐  │     │
│        │  │  │  Type ▾                    Status ▾  │  │     │
│        │  │  │  Owner ▾                              │  │     │
│        │  │  └───────────────────────────────────────┘  │     │
│        │  │                                             │     │
│        │  │  [Cancel] [Save as Draft] [Save]            │     │
│        │  └────────────────────────────────────────────┘     │
└────────┴─────────────────────────────────────────────────────┘
```

### 7.3 States
- **Default:** Clean form (create) or prefilled (edit)
- **Loading:** Spinner in save button
- **Validation error:** Inline errors, scroll to first
- **Save error:** Banner with retry
- **Dirty:** Unsaved indicator in title
- **Save success:** Toast + redirect to detail (create) or toast (edit)

---

## 8. Wizard Screen

### 8.1 Purpose
Multi-step process for complex tasks.

### 8.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (minimal — close x)                                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Stepper:  ① Setup  ② Configure  ③ Review  ④ Done  │   │
│  │  ─────────────────────────────────────────────────   │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────┐      │   │
│  │  │  Current Step Content                       │      │   │
│  │  │  (Form fields, configuration, preview)      │      │   │
│  │  │                                             │      │   │
│  │  │                                             │      │   │
│  │  └────────────────────────────────────────────┘      │   │
│  │                                                       │   │
│  │                       [Back] [Next] / [Submit]        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Skip link (top-right, text-tertiary)                        │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Specs
```
Card width: 640px (centered)
Button position: Bottom-right (Back ghost, Next/Save primary)
Stepper: Numbered circles with line connectors
```

---

## 9. Settings Screen

### 9.1 Purpose
User and application configuration.

### 9.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Page Header "Settings"                             │
│ Side   │  ┌──────┬────────────────────────────────────────┐ │
│ Bar    │  │      │  ┌─ Section ─────────────────────────┐ │ │
│        │  │ Nav  │  │  Section Title                     │ │ │
│        │  │ Panel │  │  Description text                 │ │ │
│        │  │       │  │                                    │ │ │
│        │  │ • Gen │  │  Toggle field   ◉────────○        │ │ │
│        │  │ • Sec │  │  Text field  __________            │ │ │
│        │  │ • Not │  │  Select field ▾                    │ │ │
│        │  │ • API │  │                                    │ │ │
│        │  │ • Bll │  │  [Save Changes]                    │ │ │
│        │  │       │  └────────────────────────────────────┘ │ │
│        │  └──────┴─────────────────────────────────────────┘ │
└────────┴─────────────────────────────────────────────────────┘
```

### 9.3 States
- **Default:** Current settings displayed
- **Editing:** Changes highlighted
- **Saved:** "Saved" indicator (auto-save) or button state
- **Error:** Inline error on field
- **Read-only:** Certain settings locked by role

---

## 10. Analytics Screen

### 10.1 Purpose
Data analysis with charts, filters, and export.

### 10.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Page Header "Analytics"              [Export▾]   │
│ Side   │  Filter Bar: [Date▾] [Metric▾] [Group by▾]        │
│ Bar    │                                                     │
│        │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│        │  │ KPI 1    │ │ KPI 2    │ │ KPI 3    │           │
│        │  └──────────┘ └──────────┘ └──────────┘           │
│        │                                                     │
│        │  ┌──────────────────────────────────────────┐       │
│        │  │  Main Chart (dimension selector)         │       │
│        │  └──────────────────────────────────────────┘       │
│        │                                                     │
│        │  ┌────────────────────┐ ┌────────────────────┐      │
│        │  │  Secondary Chart   │ │  Data Table        │      │
│        │  └────────────────────┘ └────────────────────┘      │
└────────┴─────────────────────────────────────────────────────┘
```

### 10.3 States
- **Default:** Data displayed
- **Loading:** Skeleton charts
- **Empty:** "No data matches filters"
- **Exporting:** Progress indicator

---

## 11. Profile Screen

### 11.1 Purpose
User profile display and editing.

### 11.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  ┌────────────────────────────────────────────┐     │
│ Side   │  │  Profile Header                             │     │
│ Bar    │  │  ┌──────┐                                  │     │
│        │  │  │Avatar│  Name (24px SemiBold)            │     │
│        │  │  │96px  │  Role (14px Regular)             │     │
│        │  │  └──────┘  Edit button                     │     │
│        │  └────────────────────────────────────────────┘     │
│        │                                                     │
│        │  ┌────────────────────────────────────────────┐     │
│        │  │  About                                      │     │
│        │  │  Bio, location, website, joined date        │     │
│        │  └────────────────────────────────────────────┘     │
│        │                                                     │
│        │  ┌────────────────────────────────────────────┐     │
│        │  │  Account Info                              │     │
│        │  │  Email, phone, timezone, preferences       │     │
│        │  └────────────────────────────────────────────┘     │
└────────┴─────────────────────────────────────────────────────┘
```

---

## 12. Empty State Screen

### 12.1 Purpose
First visit or no data available.

### 12.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar + Sidebar (standard)                               │
├────────┬────────────────────────────────────────────────────┤
│        │                                                     │
│        │              ┌──────┐                              │
│        │              │ 64px │  Icon (neutral-300)          │
│        │              │ icon │                              │
│        │              └──────┘                              │
│        │                                                     │
│        │  Title (20px SemiBold, centered)                    │
│        │  Description (14px Regular, text-secondary)         │
│        │  Max width 360px, centered                          │
│        │                                                     │
│        │  [Primary Action Button]                             │
│        │                                                     │
│        │  Secondary link (optional)                          │
│        │                                                     │
│        │  Padding top: 120px                                 │
└────────┴─────────────────────────────────────────────────────┘
```

### 12.3 Templates Per Context

| Context | Icon | Title | Description | Action |
|---------|------|-------|-------------|--------|
| No items | inbox | "No items yet" | "Create your first item to get started." | "Create Item" |
| No results | search-x | "No results found" | "Try adjusting your search or filters." | "Clear filters" |
| No members | users | "No team members" | "Invite your team to collaborate." | "Invite members" |
| No activity | activity | "No activity yet" | "Activity will appear here as you work." | "Get started" |
| No data | bar-chart | "No data available" | "Data will appear once you have records." | "Add data" |
| No notifications | bell-off | "All caught up" | "Notifications will appear here." | — |

---

## 13. Error Screen

### 13.1 Purpose
Display errors gracefully.

### 13.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar + Sidebar (standard)                               │
├────────┬────────────────────────────────────────────────────┤
│        │                                                     │
│        │              ┌──────┐                              │
│        │              │ 48px │  Icon (error)                │
│        │              │ icon │                              │
│        │              └──────┘                              │
│        │                                                     │
│        │  Title (18px SemiBold, centered)                    │
│        │  Description (14px Regular, text-secondary)         │
│        │                                                     │
│        │  [Try Again] [Contact Support]                      │
│        │                                                     │
│        │  Error ID: ABC-123 (12px text-tertiary, bottom)    │
│        │                                                     │
│        │  Padding top: 120px                                 │
└────────┴─────────────────────────────────────────────────────┘
```

### 13.3 Error Templates

| Error Type | Title | Description | Action |
|------------|-------|-------------|--------|
| 404 | "Page not found" | "The page you're looking for doesn't exist." | "Go home" |
| 403 | "Access denied" | "You don't have permission to view this." | "Request access" |
| 500 | "Something went wrong" | "Our team has been notified. Please try again." | "Try again" |
| Network | "Connection lost" | "Check your connection and try again." | "Retry" |
| Timeout | "Request timed out" | "The server is taking too long. Try again." | "Retry" |
| Offline | "You're offline" | "Some features may not be available." | "Reload" |

---

## 14. Loading Screen

### 14.1 Purpose
Full-page or section loading state.

### 14.2 Layout (Full Page)

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (minimal)                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                     ┌────────────┐                          │
│                     │  Spinner    │  32px                    │
│                     │  (primary)  │                          │
│                     └────────────┘                          │
│                                                              │
│                  "Loading..." (14px Regular)                  │
│                                                              │
│  Centered vertically and horizontally                        │
└─────────────────────────────────────────────────────────────┘
```

### 14.3 Layout (Section/Content)

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐    │
│  │  ─────────────  ─────────────  ─────────────         │    │
│  │  ─────────────  ─────────────  ─────────────         │    │  Skeleton cards
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  ╱╲    ╱╲                                            │    │
│  │ ╱  ╲  ╱  ╲    ╱╲                                     │    │  Skeleton chart
│  │╱    ╲╱    ╲  ╱  ╲  ╱╲                                │    │
│  │            ╲╱    ╲╱  ╲  ╱                             │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 15. Landing/Marketing Screen

### 15.1 Purpose
Marketing page, feature showcase.

### 15.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (transparent, logo + nav + CTA button)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Hero ─────────────────────────────────────────────┐     │
│  │  Headline (48px Bold)                              │     │
│  │  Subtitle (20px Regular)                           │     │
│  │  [Get Started] [Learn More]                        │     │
│  │  ┌──────────────────────────────────────┐          │     │
│  │  │  Hero Image / Illustration            │          │     │
│  │  └──────────────────────────────────────┘          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌─ Features Grid ──────────────────────────────────────┐   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐                          │   │
│  │  │Feat 1│ │Feat 2│ │Feat 3│                           │   │
│  │  └──────┘ └──────┘ └──────┘                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Testimonials / Stats ──────────────────────────────┐    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─ CTA Section ───────────────────────────────────────┐    │
│  │  "Ready to get started?" [Sign Up Free]             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  Footer: Links, Copyright, Social                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 16. AI Chat Screen

### 16.1 Purpose
AI conversation interface.

### 16.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar: "AI Assistant"           Model▾  Clear  ✕        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Message List (scrollable) ──────────────────────────┐   │
│  │                                                       │   │
│  │  ┌──────────────────────────────┐                    │   │
│  │  │  AI response bubble          │                    │   │
│  │  │  (left-aligned, neutral-100) │                    │   │
│  │  └──────────────────────────────┘                    │   │
│  │                                                       │   │
│  │           ┌──────────────────────┐                    │   │
│  │           │  User bubble          │                    │   │
│  │           │  (right-aligned, pri) │                    │   │
│  │           └──────────────────────┘                    │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  Typing indicator: ● ● ●                     │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Input Area ─────────────────────────────────────────┐   │
│  │  [Attach]  Ask Atlas AI...               [Send]      │   │
│  │  Token count: 128 / 4096                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 16.3 States
- **Default:** Welcome message or empty chat
- **Typing:** User typing in input
- **Loading (AI):** Typing indicator
- **Error:** Error message in chat, retry option
- **Streaming:** Real-time token-by-token response
- **Long response:** Progress indicator

---

## 17. Search Results Screen

### 17.1 Purpose
Display global search results.

### 17.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar:  Search bar (focused, expanded)                   │
├────────┬────────────────────────────────────────────────────┤
│        │  Results for "query" — 42 results    Filter▾      │
│ Side   │                                                     │
│ Bar    │  ┌─ Result Category ───────────────────────────┐   │
│        │  │  Category: Items (12 results)               │   │
│        │  │  ┌────────────────────────────────────┐     │   │
│        │  │  │ Item 1 — matching context...        │     │   │
│        │  │  │ Item 2 — matching context...        │     │   │
│        │  │  │ "View all X results" →             │     │   │
│        │  │  └────────────────────────────────────┘     │   │
│        │  └─────────────────────────────────────────────┘   │
│        │                                                     │
│        │  ┌─ Category 2 ────────────────────────────────┐   │
│        │  │  ...                                        │   │
│        │  └─────────────────────────────────────────────┘   │
│        │                                                     │
│        │  Recent searches (when query empty)                │
└────────┴─────────────────────────────────────────────────────┘
```

### 17.3 States
- **Empty query:** Recent searches + popular items
- **Loading:** Skeleton results
- **Results:** Grouped by category
- **No results:** "No results for 'query'" + suggestions
- **Error:** Error state with retry

---

## 18. Onboarding Screen

### 18.1 Purpose
First-time user experience.

### 18.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Minimal Top Bar (Logo + Skip link)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │              ┌────────────────────┐                   │   │
│  │              │  Step Illustration  │                   │   │
│  │              └────────────────────┘                   │   │
│  │                                                       │   │
│  │  Title (30px SemiBold, centered)                      │   │
│  │  Description (16px Regular, text-secondary, center)   │   │
│  │                                                       │   │
│  │  ● ● ○ ○ ○  (dot indicators)                         │   │
│  │                                                       │   │
│  │               [Skip] [Next →]                         │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Card: max 480px, centered                                   │
└─────────────────────────────────────────────────────────────┘
```

### 18.3 States
- **Step 1:** Welcome + value prop
- **Step 2–4:** Feature highlights
- **Last step:** CTA "Get Started"
- **Skip:** Confirmation "Are you sure?"
- **Progress:** Dot indicators + "Step X of Y"
