export { useDashboard, useDashboardActivity, useDashboardInsights, useWorkspace, useDashboardSearch, useDashboardRefresh, DASHBOARD_QUERY_KEYS } from './hooks';
export type { DashboardApiError } from './api';
export { dashboardApi, DashboardApiError as DashboardApiErrorClass } from './api';
export { DASHBOARD_CONFIG } from './config';
export type {
  DashboardStatistics,
  ActivityEntry,
  WorkspaceInfo,
  InsightMetric,
  SearchResult,
  QuickAction,
  Greeting,
} from './types';

export { WorkspaceHeader } from './components/WorkspaceHeader';
export { WelcomeBlock } from './components/WelcomeBlock';
export { AIQuickActions } from './components/AIQuickActions';
export { AIInsights } from './components/AIInsights';
export { RecentActivity } from './components/RecentActivity';
export { EnterpriseSearch } from './components/EnterpriseSearch';
export { FloatingActionButton } from './components/FloatingActionButton';
export { DashboardSkeleton } from './components/DashboardSkeleton';
