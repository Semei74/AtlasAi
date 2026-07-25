import { z } from "zod";

/**
 * Schemas mirror the REAL backend response DTOs (verified in
 *  services/backend/src):
 *  - WorkspaceResponseDto
 *  - OrganizationResponseDto
 *  - UserPreferences (GET /users/preferences)
 *  - GET /auth/me profile
 *  - DashboardStatisticsResponseDto
 *  - ActivityEntryDto
 *  - ProjectResponseDto
 * Dates arrive as ISO strings over JSON.
 */

export const dashboardStatisticsSchema = z.object({
  workspacesCount: z.number(),
  organizationsCount: z.number(),
  projectsCount: z.number(),
  activeUsersCount: z.number(),
});

export type DashboardStatistics = z.infer<typeof dashboardStatisticsSchema>;

export const activityEntrySchema = z.object({
  id: z.string(),
  type: z.string(),
  actor: z.object({
    id: z.string(),
    displayName: z.string(),
  }),
  description: z.string(),
  createdAt: z.string(),
});

export type ActivityEntry = z.infer<typeof activityEntrySchema>;

export const activityEntriesResponseSchema = z.array(activityEntrySchema);

export const projectOwnerSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  workspaceId: z.string(),
  organizationId: z.string(),
  owner: projectOwnerSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProjectItem = z.infer<typeof projectSchema>;

export const projectsResponseSchema = z.array(projectSchema);

export const workspaceSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Workspace = z.infer<typeof workspaceSchema>;

export const workspacesResponseSchema = z.array(workspaceSchema);

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  ownerId: z.string(),
  logoUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Organization = z.infer<typeof organizationSchema>;

export const organizationsResponseSchema = z.array(organizationSchema);

export const userPreferencesSchema = z.object({
  theme: z.string(),
  locale: z.string(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  status: z.enum(["active", "suspended", "deleted"]),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  timezone: z.string().nullable(),
  theme: z.string(),
  locale: z.string(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export function parseWorkspaces(raw: unknown): Workspace[] {
  return workspacesResponseSchema.parse(raw);
}

export function parseOrganizations(raw: unknown): Organization[] {
  return organizationsResponseSchema.parse(raw);
}

export function parseUserPreferences(raw: unknown): UserPreferences {
  return userPreferencesSchema.parse(raw);
}

export function parseUserProfile(raw: unknown): UserProfile {
  return userProfileSchema.parse(raw);
}

export function parseDashboardStatistics(raw: unknown): DashboardStatistics {
  return dashboardStatisticsSchema.parse(raw);
}

export function parseRecentActivity(raw: unknown): ActivityEntry[] {
  return activityEntriesResponseSchema.parse(raw);
}

export const projectListResponseSchema = z.object({
  items: projectsResponseSchema,
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;

export const projectActivityLogEntrySchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  actorName: z.string(),
  createdAt: z.string(),
});

export type ProjectActivityLogEntry = z.infer<typeof projectActivityLogEntrySchema>;

export const projectDetailSchema = projectSchema.extend({
  workspaceName: z.string(),
  isArchived: z.boolean(),
  activityLogs: z.array(projectActivityLogEntrySchema),
});

export type ProjectDetail = z.infer<typeof projectDetailSchema>;

export function parseRecentProjects(raw: unknown): ProjectItem[] {
  return projectsResponseSchema.parse(raw);
}

export function parseProjectList(raw: unknown): ProjectListResponse {
  return projectListResponseSchema.parse(raw);
}

export function parseProjectDetail(raw: unknown): ProjectDetail {
  return projectDetailSchema.parse(raw);
}
