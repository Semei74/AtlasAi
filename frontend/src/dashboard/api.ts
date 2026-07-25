import { DASHBOARD_CONFIG } from './config';
import type { DashboardStatistics, ActivityEntry } from './types';

class DashboardApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string = 'UNKNOWN') {
    super(message);
    this.name = 'DashboardApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${DASHBOARD_CONFIG.apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const message = data.message ?? data.error ?? 'Request failed';
    const code = data.code ?? 'UNKNOWN';
    throw new DashboardApiError(message, response.status, code);
  }

  return data as T;
}

export const dashboardApi = {
  async getStatistics(): Promise<DashboardStatistics> {
    const data = await request<DashboardStatistics>(
      DASHBOARD_CONFIG.endpoints.statistics,
    );
    return data;
  },

  async getActivity(limit: number = 10): Promise<ActivityEntry[]> {
    const data = await request<ActivityEntry[]>(
      `${DASHBOARD_CONFIG.endpoints.activity}?limit=${limit}`,
    );
    return data;
  },
};

export { DashboardApiError };
