import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, DashboardApiError } from './api';
import { DASHBOARD_CONFIG } from './config';
import type { DashboardStatistics, ActivityEntry, InsightMetric, SearchResult } from './types';
import { useAuth } from '../auth/auth-context';

export const DASHBOARD_QUERY_KEYS = DASHBOARD_CONFIG.queryKeys;

export function useDashboard() {
  return useQuery<DashboardStatistics>({
    queryKey: DASHBOARD_QUERY_KEYS.statistics,
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return dashboardApi.getStatistics();
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useDashboardActivity(limit: number = 10) {
  return useQuery<ActivityEntry[]>({
    queryKey: [...DASHBOARD_QUERY_KEYS.activity, limit],
    queryFn: ({ signal }) => {
      const controller = new AbortController();
      signal?.addEventListener('abort', () => controller.abort());
      return dashboardApi.getActivity(limit);
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useDashboardInsights() {
  return useQuery<InsightMetric[]>({
    queryKey: DASHBOARD_QUERY_KEYS.insights,
    queryFn: async () => {
      throw new DashboardApiError('Insights endpoint not available', 404, 'ENDPOINT_NOT_FOUND');
    },
    enabled: false,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}

export function useWorkspace() {
  const { user, memberships } = useAuth();
  const activeMembership = memberships?.[0];
  const workspace = activeMembership?.workspaces?.[0] ?? null;
  const organization = activeMembership?.organization ?? null;

  return {
    data: workspace ? {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      color: workspace.color,
      icon: workspace.icon,
    } : null,
    organization,
    role: activeMembership?.role ?? null,
    isLoading: !memberships,
  };
}

export function useDashboardSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: [...DASHBOARD_QUERY_KEYS.search, query],
    queryFn: async () => {
      if (!query.trim()) return [];
      throw new DashboardApiError('Search endpoint not available', 404, 'ENDPOINT_NOT_FOUND');
    },
    enabled: false,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}

export function useDashboardRefresh() {
  const queryClient = useQueryClient();

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.statistics }),
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.activity }),
    ]);
  };

  return { refreshAll };
}

export type { DashboardApiError };
