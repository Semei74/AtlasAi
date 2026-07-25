export interface DashboardStatistics {
  workspacesCount: number;
  organizationsCount: number;
  projectsCount: number;
  activeUsersCount: number;
}

export interface ActivityEntry {
  id: string;
  type: string;
  actor: {
    id: string;
    displayName: string;
  };
  description: string;
  createdAt: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
}

export interface InsightMetric {
  id: string;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
  icon: string;
  color: string;
}

export interface SearchResult {
  id: string;
  type: 'project' | 'chat' | 'document' | 'knowledge' | 'agent';
  title: string;
  subtitle?: string;
  updatedAt: string;
  matchField?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

export interface Greeting {
  text: string;
  emoji: string;
}
