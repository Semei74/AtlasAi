# Atlas AI Navigation Map

> **Status:** Foundation (Phase 1)  
> **Version:** 1.0.0  
> **Purpose:** Complete navigation flow documentation for the Atlas AI platform

---

## 1. Navigation Flow Diagram

```
                          ┌───────────────────┐
                          │   Splash / Boot   │
                          └────────┬──────────┘
                                   │
                          ┌────────▼──────────┐
                          │   Authenticated?   │
                          └───┬───────────┬────┘
                         No   │           │  Yes
                    ┌─────────▼──┐    ┌────▼──────────┐
                    │   Login    │    │   App Shell    │
                    └─────┬─────┘    └────┬───────────┘
                          │               │
                    ┌─────▼──────┐  ┌─────▼──────┐
                    │  Register  │  │ Onboarding  │
                    └─────┬─────┘  │ Completed?  │
                          │        └──┬───┬──────┘
                    ┌─────▼─────┐  No │   │ Yes
                    │ Forgot    │ ┌────▼──┐ │
                    │ Password  │ │ Setup │ │
                    └─────┬─────┘ └──┬────┘ │
                          │          │      │
                          │    ┌─────▼──────▼──────┐
                          │    │   Dashboard / Home │
                          │    └─────────┬──────────┘
                          │              │
                          │     ┌────────▼──────────┐
                          │     │  Workspace Select  │
                          │     └────────┬──────────┘
                          │              │
              ┌───────────┼──────────────┼───────────────────┐
              │           │              │                   │
     ┌────────▼────┐ ┌───▼────┐  ┌──────▼─────┐   ┌────────▼───────┐
     │ AI Chat     │ │Projects│  │ Knowledge  │   │ Prompt Library  │
     │             │ │        │  │            │   │                 │
     ├─────────────┤ ├────────┤  ├────────────┤   ├─────────────────┤
     │ Conversation│ │ List   │  │ Library    │   │ Prompt Grid     │
     │ List        │ │ Detail │  │ Detail     │   │ Category Filter │
     │ Chat View   │ │ Create │  │ Upload     │   │ Editor          │
     │ Settings    │ │ Archive│  │ Search     │   │ Version History │
     └─────────────┘ └────────┘  │ Processing │   └─────────────────┘
                                  └────────────┘

     ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐
     │ Analytics  │  │  Agents    │  │ Workflows  │  │   Team         │
     │            │  │            │  │            │  │                │
     ├────────────┤  ├────────────┤  ├────────────┤  ├────────────────┤
     │ Dashboard  │  │ Agent List │  │ List       │  │ Members        │
     │ Cost       │  │ Editor     │  │ Editor     │  │ Invitations    │
     │ Reports    │  │ Testing    │  │ Execution  │  │ Activity       │
     └────────────┘  │ Logs       │  └────────────┘  └────────────────┘
                      └────────────┘

     ┌──────────────────────────────────────────────────────────┐
     │                    Admin Panel                           │
     ├──────────┬──────────┬──────────┬──────────┬─────────────┤
     │ Users    │ Security │ Integr.  │ Billing  │ Audit Log   │
     ├──────────┴──────────┴──────────┴──────────┴─────────────┤
     │                    Settings                              │
     ├──────────┬──────────┬──────────┬────────────────────────┤
     │ Profile  │ Prefs    │ Security │ Accessibility          │
     └──────────┴──────────┴──────────┴────────────────────────┘
```

---

## 2. Sidebar Navigation Structure (Desktop)

### Main Navigation

| Section | Icon | Visibility | Notes |
|---------|------|------------|-------|
| Dashboard | grid | All users | |
| AI Chat | message-circle | All users | |
| Projects | folder | All users | |
| Knowledge | book-open | All users | |
| Prompt Library | file-text | All users | |
| AI Agents | robot | Power users | Future |
| Workflows | git-branch | Power users | Future |
| Analytics | bar-chart-2 | All users | |
| Team | users | Manager+ | |

### Bottom Section

| Section | Icon | Visibility | Notes |
|---------|------|------------|-------|
| Administration | settings | Admin+ | |
| Settings | user-cog | All users | |

---

## 3. Bottom Navigation (Mobile)

### Tab Bar (5 items max)

| Tab | Icon | Screen |
|-----|------|--------|
| Home | home | Dashboard |
| Chat | message-circle | AI Chat |
| Projects | folder | Projects |
| Knowledge | book-open | Documents |
| More | more-horizontal | All other sections |

The "More" tab opens a grid of all additional sections.

---

## 4. Quick Actions

Accessible from the "+" FAB (mobile) or top bar button (desktop):

- New project
- Upload document
- New chat
- Create prompt
- Invite member
- Create workspace (Manager+)

---

## 5. Contextual Navigation

### Breadcrumb Navigation

```
Home → Workspace Name → Section → Subsection → Item
```

### Back Navigation

- Browser back button navigates to previous screen
- Mobile back gesture navigates to previous screen
- Escape key closes modals and panels

### Deep Links

All screens have shareable URLs. Deep links navigate to the exact content:

```
/app/w/{workspaceId}/knowledge/{documentId}
/app/w/{workspaceId}/prompts/{promptId}/versions/{versionId}
```

---

## 6. Navigation Rules

1. Keep sidebar selection in sync with current route
2. Breadcrumbs reflect full path from home
3. Modal/dialog closes return to underlying screen
4. Deep link navigation bypasses intermediate screens
5. Unauthorized sections are hidden, not disabled
6. Workspace context persists until explicit switch
7. Command palette provides universal access to all sections
8. Search is accessible from any screen via Cmd+K or search icon
