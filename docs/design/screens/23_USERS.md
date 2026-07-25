# 23 — Users

## Overview

**Purpose:** Manage user accounts, roles, and permissions within the workspace.

**Business Goal:** Enable user administration. Control access via roles. Maintain security.

**User Goal:** I want to view, invite, and manage users in my workspace.

---

## Entry Points

| Direction | Source | Target |
|-----------|--------|--------|
| **From** | Sidebar "Users", Settings "Team", Admin panel | User list |
| **To** | User profile, Invite form, Role editor, Workspace settings | User management |

---

## User Story

> As an admin, I want to manage users, assign roles, and control permissions so that the right people have the right access.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                     │
├────────┬────────────────────────────────────────────────────┤
│        │  Users (24px SemiBold)        [Invite User] [⋯]  │
│ Side   │  Search ──────────────────────                    │
│ Bar    │  Filter: [All Roles▾] [Status▾]                    │
│        │                                                     │
│        │  ┌──────┬──────────┬────────┬────────┬──────────┐  │
│        │  │ User │ Role     │ Status │ Last   │ Actions  │  │
│        │  ├──────┼──────────┼────────┼────────┼──────────┤  │
│        │  │Alice │ Manager  │ Active │ 2h ago │ [Edit]   │  │
│        │  │Bob   │ Mechanic │ Active │ 1d ago │ [Edit]   │  │
│        │  │Carol │ Mechanic │ Invited│ —      │ [Resend] │  │
│        │  │Dave  │ Viewer   │ Inactive│ 30d   │ [Edit]   │  │
│        │  └──────┴──────────┴────────┴────────┴──────────┘  │
│        │                                                     │
│        │  24 users total                          Page 1/3  │
└────────┴─────────────────────────────────────────────────────┘
```

**Zones:**
```
Header:    Title + Invite + More menu
Search:    User search
Filters:   Role, Status dropdowns
Table:     User rows (name, role, status, last active, actions)
Pagination: Page nav
```

---

## Components

| Component | Usage | Variant/Size |
|-----------|-------|-------------|
| Search Bar | User search | sm |
| Select | Role, Status filters | sm |
| Table | User list | sortable, with actions |
| Avatar | User thumbnail | sm (32px) |
| Badge | Role badge | per role |
| Badge | Status badge | Active/Invited/Inactive |
| Button | Edit user | ghost, sm |
| Button | Invite User | primary, sm |
| Button | Resend Invite | ghost, sm |
| Modal | Invite form | default |
| Modal | Confirm deactivate | dialog |
| Pagination | Page nav | default |

---

## Information Hierarchy

```
Primary:   User list, role, status
Secondary: Search, filters, invite
Tertiary:  Last active, actions
```

---

## States

| State | Behavior |
|-------|----------|
| **Default** | User list with data. |
| **Loading** | Skeleton rows. |
| **Success** | Data rendered. |
| **Warning** | Users with expired invitations highlighted. |
| **Error** | Error banner on load failure. |
| **Offline** | "Showing cached users." |
| **Empty** | "No users yet. Invite your team." |
| **No permissions** | User management hidden. "Contact admin." |
| **No data** | Default empty state. |
| **Syncing** | Pull-to-refresh. |
| **Updating** | Optimistic role/status changes. |
| **Read only** | Edit/Invite disabled. View only. |

---

## Responsive

| Platform | Layout |
|----------|--------|
| **Desktop** | Full table with actions. |
| **Tablet** | Table with fewer columns. |
| **Mobile** | Card list. Swipe for actions. |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **ARIA** | `aria-label` on user rows. `aria-live` on status changes. |
| **Focus order** | Search → Filters → Table → Actions → Invite |
| **Screen reader** | Announce user details. Announce role/status changes. |
| **Contrast** | Per COLOR_SYSTEM.md. |
| **Keyboard** | Tab through rows. Enter opens edit. |
| **Touch targets** | ≥ 44×44pt. |

---

## Animations

| Animation | Type | Duration |
|-----------|------|----------|
| Table enter | Staggered rows | 300ms |
| Invite modal | Slide up | 300ms |
| Role change | Badge update animation | 200ms |
| User removed | Row slide out | 200ms |

---

## Validation

| Field (Invite) | Rule |
|----------------|------|
| Email | Required, valid email, not already in workspace |
| Role | Required |

---

## Edge Cases

1. **Invite existing user** — Show "User already in workspace." Offer to change role instead.
2. **Pending invitation expiry** — Invitation expires after 7 days. Show "Expired" badge.
3. **User deactivation** — Deactivated users shown in list with "Inactive" badge. Can restore.
4. **Last admin cannot be deactivated** — Prevent deactivating last workspace admin.
5. **Self-service removal** — User cannot remove themselves. Must have another admin.
6. **Role change audit** — Log all role changes with timestamp and actor.
7. **SSO-managed users** — Show "Managed by SSO" for SSO users. Role changes may be restricted.
8. **User deletion vs deactivation** — Soft delete (deactivate) by default. Permanent delete requires confirmation.
9. **Bulk user operations** — Select multiple users for batch role change or deactivation.
10. **User count limit** — Show remaining seats if workspace has user limit.

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `screen_viewed` | Screen mount |
| `user_invited` | Invite submitted |
| `invite_resend` | Resend invitation |
| `user_role_changed` | `{user_id, old_role, new_role}` |
| `user_deactivated` | `{user_id}` |
| `user_reactivated` | `{user_id}` |
| `user_removed` | Permanent delete |
| `search_performed` | User search |
| `filter_changed` | Filter change |

---

## Telemetry

| Metric | Measurement |
|--------|-------------|
| User count growth | Per period |
| Role distribution | Manager/Mechanic/Viewer % |
| Invite acceptance rate | Invited vs active |
| Average time to role change | User lifecycle |
| Deactivation rate | Per period |

---

## Future Improvements

1. User groups — Create groups for batch permission management
2. Activity log per user — View individual user's action history
3. User impersonation — Admin can temporarily act as user (with audit trail)
4. Department hierarchy — Organize users by department/location
5. Custom roles — Create roles with custom permission sets
6. Bulk user import — CSV upload for large teams
7. User provisioning — SCIM integration for automatic user management
