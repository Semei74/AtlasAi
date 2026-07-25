import { useCallback, useMemo, useState, useRef } from 'react';
import { RefreshControl, ScrollView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Page, ErrorState } from '../../design-system';
import { useDashboard, useDashboardActivity, useDashboardRefresh, useWorkspace } from '../dashboard';
import {
  WorkspaceHeader,
  WelcomeBlock,
  AIQuickActions,
  AIInsights,
  RecentActivity,
  FloatingActionButton,
  DashboardSkeleton,
} from '../dashboard';

export function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboard();
  const { isLoading: activityLoading, error: activityError, refetch: refetchActivity } = useDashboardActivity(10);
  const { refreshAll } = useDashboardRefresh();
  const { data: workspace } = useWorkspace();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAll]);

  const hasError = statsError && activityError;

  const handleNotificationPress = useCallback(() => {
    router.push('/notifications');
  }, [router]);

  const handleProfilePress = useCallback(() => {
    router.push('/(tabs)/profile');
  }, [router]);

  const handleOrganizationSwitch = useCallback(() => {
    router.push('/workspace-selection');
  }, [router]);

  const fabActions = useMemo(
    () => [
      {
        id: 'new-chat',
        label: 'New Chat',
        icon: '💬',
        color: theme.colors.primary[500],
        onPress: () => router.push('/ai/chat'),
      },
      {
        id: 'new-prompt',
        label: 'New Prompt',
        icon: '📝',
        color: theme.colors.secondary[500],
        onPress: () => router.push('/ai/prompts'),
      },
      {
        id: 'new-project',
        label: 'New Project',
        icon: '📁',
        color: theme.colors.accent[500],
        onPress: () => router.push('/(tabs)/projects'),
      },
      {
        id: 'upload-knowledge',
        label: 'Upload Knowledge',
        icon: '📄',
        color: theme.colors.info.default,
        onPress: () => router.push('/ai/knowledge'),
      },
      {
        id: 'create-agent',
        label: 'Create Agent',
        icon: '🤖',
        color: '#7C3AED',
        onPress: () => router.push('/ai'),
      },
    ],
    [router, theme],
  );

  if (statsLoading && !stats) {
    return (
      <Page safeArea>
        <WorkspaceHeader
          onNotificationPress={handleNotificationPress}
          onProfilePress={handleProfilePress}
          onOrganizationSwitch={handleOrganizationSwitch}
        />
        <DashboardSkeleton />
      </Page>
    );
  }

  if (hasError) {
    return (
      <Page safeArea>
        <WorkspaceHeader
          onNotificationPress={handleNotificationPress}
          onProfilePress={handleProfilePress}
          onOrganizationSwitch={handleOrganizationSwitch}
        />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ErrorState
            title="Unable to load dashboard"
            description="There was a problem loading your dashboard data. Please check your connection and try again."
            onRetry={onRefresh}
            retryLabel="Retry"
          />
        </View>
      </Page>
    );
  }

  return (
    <Page safeArea>
      <WorkspaceHeader
        onNotificationPress={handleNotificationPress}
        onProfilePress={handleProfilePress}
        onOrganizationSwitch={handleOrganizationSwitch}
      />
      <ScrollView
        ref={scrollRef}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
            colors={[theme.colors.primary[500]]}
            accessibilityLabel="Pull to refresh dashboard"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <WelcomeBlock workspaceName={workspace?.name} />
        <AIQuickActions />
        <AIInsights />
        <RecentActivity />
        <View style={{ height: 100 }} />
      </ScrollView>
      <FloatingActionButton actions={fabActions} />
    </Page>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
});
