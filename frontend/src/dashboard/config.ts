const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export const DASHBOARD_CONFIG = {
  apiUrl: API_BASE_URL,
  endpoints: {
    statistics: '/dashboard/statistics',
    activity: '/activity/recent',
  },
  queryKeys: {
    statistics: ['dashboard', 'statistics'] as const,
    activity: ['dashboard', 'activity'] as const,
    insights: ['dashboard', 'insights'] as const,
    workspace: ['dashboard', 'workspace'] as const,
    search: ['dashboard', 'search'] as const,
  },
} as const;
