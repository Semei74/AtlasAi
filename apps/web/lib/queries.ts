"use client";

import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";
import { useApi } from "./api";
import {
  parseOrganizations,
  parseUserPreferences,
  parseUserProfile,
  parseWorkspaces,
  parseDashboardStatistics,
  parseRecentActivity,
  parseRecentProjects,
  parseProjectList,
  parseProjectDetail,
  type Organization,
  type UserPreferences,
  type UserProfile,
  type Workspace,
  type DashboardStatistics,
  type ActivityEntry,
  type ProjectItem,
  type ProjectListResponse,
  type ProjectDetail,
} from "./dashboard-schemas";

const STALE_TIMES = {
  DASHBOARD: 60_000,
  PROJECTS: 30_000,
  PROJECT_DETAIL: 60_000,
  WORKSPACES: 120_000,
  ORGANIZATIONS: 120_000,
  USER_PREFERENCES: 120_000,
} as const;

const GC_TIME = 5 * 60_000;
const RETRY_COUNT = 2;

export function useWorkspaces(): UseQueryResult<Workspace[]> {
  const api = useApi();
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await api.GET("/workspaces");
      if (!response.response.ok) {
        throw new Error("Failed to load workspaces");
      }
      return parseWorkspaces(response.data);
    },
    staleTime: STALE_TIMES.WORKSPACES,
    gcTime: GC_TIME,
    retry: RETRY_COUNT,
  });
}

export function useOrganizations(): UseQueryResult<Organization[]> {
  const api = useApi();
  return useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await api.GET("/organizations");
      if (!response.response.ok) {
        throw new Error("Failed to load organizations");
      }
      return parseOrganizations(response.data);
    },
    staleTime: STALE_TIMES.ORGANIZATIONS,
    gcTime: GC_TIME,
    retry: RETRY_COUNT,
  });
}

export function useUserPreferences(): UseQueryResult<UserPreferences> {
  const api = useApi();
  return useQuery<UserPreferences>({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      const response = await api.GET("/users/preferences");
      if (!response.response.ok) {
        throw new Error("Failed to load preferences");
      }
      return parseUserPreferences(response.data);
    },
    staleTime: STALE_TIMES.USER_PREFERENCES,
    gcTime: GC_TIME,
    retry: RETRY_COUNT,
  });
}

export function useAuthMe(): UseQueryResult<UserProfile> {
  const api = useApi();
  return useQuery<UserProfile>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const response = await api.GET("/auth/me");
      if (!response.response.ok) {
        throw new Error("Failed to load profile");
      }
      return parseUserProfile(response.data);
    },
    staleTime: STALE_TIMES.DASHBOARD,
    gcTime: GC_TIME,
    retry: RETRY_COUNT,
  });
}

export function useDashboardStatistics(): UseQueryResult<DashboardStatistics> {
  const api = useApi();
  return useQuery<DashboardStatistics>({
    queryKey: ["dashboard-statistics"],
    queryFn: async () => {
      const response = await api.GET("/dashboard/statistics");
      if (!response.response.ok) {
        throw new Error("Failed to load dashboard statistics");
      }
      return parseDashboardStatistics(response.data);
    },
    staleTime: STALE_TIMES.DASHBOARD,
    gcTime: GC_TIME,
    retry: RETRY_COUNT,
  });
}

export function useRecentActivity(limit = 10): UseQueryResult<ActivityEntry[]> {
  const api = useApi();
  return useQuery<ActivityEntry[]>({
    queryKey: ["recent-activity", limit],
    queryFn: async () => {
      const response = await api.GET("/activity/recent", { params: { query: { limit } } });
      if (!response.response.ok) {
        throw new Error("Failed to load recent activity");
      }
      return parseRecentActivity(response.data);
    },
    staleTime: STALE_TIMES.PROJECTS,
    gcTime: GC_TIME,
    retry: RETRY_COUNT,
  });
}

export function useRecentProjects(limit = 10): UseQueryResult<ProjectItem[]> {
  const api = useApi();
  return useQuery<ProjectItem[]>({
    queryKey: ["recent-projects", limit],
    queryFn: async () => {
      const response = await api.GET("/projects/recent", { params: { query: { limit } } });
      if (!response.response.ok) {
        throw new Error("Failed to load recent projects");
      }
      return parseRecentProjects(response.data);
    },
    staleTime: STALE_TIMES.PROJECTS,
    gcTime: GC_TIME,
    retry: RETRY_COUNT,
  });
}

export function useProjects(limit?: number): UseQueryResult<ProjectItem[]> {
  const api = useApi();
  return useQuery<ProjectItem[]>({
    queryKey: ["projects", limit],
    queryFn: async () => {
      const response = await api.GET("/projects", { params: { query: { limit } } });
      if (!response.response.ok) {
        throw new Error("Failed to load projects");
      }
      const parsed = parseProjectList(response.data);
      return parsed.items;
    },
    staleTime: STALE_TIMES.PROJECTS,
    gcTime: GC_TIME,
    retry: RETRY_COUNT,
    refetchOnWindowFocus: false,
  });
}

export function useProjectsPaginated(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED" | "COMPLETED";
  workspaceId?: string;
  sort?: "updatedAt" | "createdAt" | "name";
  order?: "asc" | "desc";
}): UseQueryResult<ProjectListResponse> {
  const api = useApi();
  return useQuery<ProjectListResponse>({
    queryKey: ["projects-paginated", params],
    queryFn: async () => {
      const response = await api.GET("/projects", { params: { query: params } });
      if (!response.response.ok) {
        throw new Error("Failed to load projects");
      }
      return parseProjectList(response.data);
    },
    staleTime: STALE_TIMES.PROJECTS,
    gcTime: GC_TIME,
    retry: RETRY_COUNT,
  });
}

export function useProject(id: string): UseQueryResult<ProjectDetail> {
  const api = useApi();
  return useQuery<ProjectDetail>({
    queryKey: ["project", id],
    queryFn: async () => {
      const response = await api.GET("/projects/{id}", { params: { path: { id } } });
      if (!response.response.ok) {
        throw new Error("Failed to load project");
      }
      return parseProjectDetail(response.data);
    },
    enabled: id.length > 0,
    staleTime: STALE_TIMES.PROJECT_DETAIL,
    gcTime: GC_TIME,
    retry: RETRY_COUNT,
    refetchOnWindowFocus: false,
  });
}

export function useArchiveProject(): UseMutationResult<unknown, unknown, string> {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.PATCH("/projects/{id}/archive", { params: { path: { id } } });
      if (!response.response.ok) {
        throw new Error("Failed to archive project");
      }
      return response.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["project", id] });
      const previousProject = queryClient.getQueryData<ProjectDetail>(["project", id]);

      if (previousProject) {
        queryClient.setQueryData<ProjectDetail>(["project", id], {
          ...previousProject,
          status: "ARCHIVED" as const,
          isArchived: true,
        });
      }

      return { previousProject };
    },
    onError: (_error, id, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(["project", id], context.previousProject);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["projects-paginated"] });
      void queryClient.invalidateQueries({ queryKey: ["recent-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-statistics"] });
    },
  });
}

export function useRestoreProject(): UseMutationResult<unknown, unknown, string> {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.PATCH("/projects/{id}/restore", { params: { path: { id } } });
      if (!response.response.ok) {
        throw new Error("Failed to restore project");
      }
      return response.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["project", id] });
      const previousProject = queryClient.getQueryData<ProjectDetail>(["project", id]);

      if (previousProject) {
        queryClient.setQueryData<ProjectDetail>(["project", id], {
          ...previousProject,
          status: "ACTIVE" as const,
          isArchived: false,
        });
      }

      return { previousProject };
    },
    onError: (_error, id, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(["project", id], context.previousProject);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["projects-paginated"] });
      void queryClient.invalidateQueries({ queryKey: ["recent-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-statistics"] });
    },
  });
}
