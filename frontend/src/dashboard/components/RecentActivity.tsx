import { useCallback, useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTheme, Text, Stack, Row, Divider, EmptyState, ErrorState } from '../../design-system';
import { useDashboardActivity } from '../hooks';
import type { ActivityEntry } from '../types';

function getActivityIcon(type: string): string {
  switch (type) {
    case 'project_created': return '📁';
    case 'project_updated': return '✏️';
    case 'chat_created': return '💬';
    case 'member_joined': return '👋';
    case 'knowledge_added': return '📄';
    case 'agent_created': return '🤖';
    case 'agent_updated': return '⚙️';
    default: return '📌';
  }
}

function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ActivityItem({ item, theme }: { item: ActivityEntry; theme: ReturnType<typeof useTheme> }) {
  const icon = getActivityIcon(item.type);

  return (
    <Animated.View
      entering={FadeInDown.duration(theme.duration.fast).springify()}
      exiting={FadeOutUp.duration(theme.duration.fast)}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Activity: ${item.description}`}
        style={[
          styles.activityItem,
          {
            paddingHorizontal: theme.contentPadding.md,
            paddingVertical: theme.spacing[3],
          },
        ]}
      >
        <Row spacing={12} align="flex-start">
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: theme.colors.neutral[100],
                borderRadius: theme.radius.full,
              },
            ]}
          >
            <Text role="body">{icon}</Text>
          </View>
          <Stack spacing={2} style={{ flex: 1 }}>
            <Text
              role="bodySmall"
              color={theme.colors.text.primary}
              numberOfLines={2}
            >
              {item.description}
            </Text>
            <Row spacing={8} align="center">
              <Text role="caption" color={theme.colors.text.tertiary}>
                {item.actor.displayName}
              </Text>
              <View
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: theme.colors.text.tertiary,
                }}
              />
              <Text role="caption" color={theme.colors.text.tertiary}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </Row>
          </Stack>
        </Row>
      </Pressable>
    </Animated.View>
  );
}

interface RecentActivityProps {
  limit?: number;
  onItemPress?: (item: ActivityEntry) => void;
}

export function RecentActivity({ limit = 10, onItemPress }: RecentActivityProps) {
  const theme = useTheme();
  const { data: activities, isLoading, error, refetch } = useDashboardActivity(limit);

  const renderItem = useCallback(
    ({ item }: { item: ActivityEntry }) => <ActivityItem item={item} theme={theme} />,
    [theme],
  );

  const keyExtractor = useCallback((item: ActivityEntry) => item.id, []);

  const estimatedItemSize = useMemo(() => 72, []);

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) return null;
    if (error) {
      return (
        <ErrorState
          title="Unable to load activity"
          description="There was a problem loading recent activity."
          onRetry={() => refetch()}
        />
      );
    }
    return (
      <EmptyState
        title="No recent activity"
        description="Activity from your workspace will appear here."
      />
    );
  }, [isLoading, error, refetch]);

  return (
    <View
      style={[
        styles.section,
        {
          paddingVertical: theme.spacing[4],
          backgroundColor: theme.colors.bg.primary,
        },
      ]}
      accessibilityLabel="Recent activity"
    >
      <View style={{ paddingHorizontal: theme.contentPadding.md, marginBottom: theme.spacing[3] }}>
        <Text role="heading4">Recent Activity</Text>
      </View>

      {isLoading && !activities ? (
        <View style={{ paddingHorizontal: theme.contentPadding.md }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.skeletonRow, { marginBottom: theme.spacing[3] }]}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.colors.neutral[200],
                }}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View
                  style={{
                    width: '80%',
                    height: 12,
                    borderRadius: 4,
                    backgroundColor: theme.colors.neutral[200],
                  }}
                />
                <View style={{ height: 6 }} />
                <View
                  style={{
                    width: '40%',
                    height: 10,
                    borderRadius: 4,
                    backgroundColor: theme.colors.neutral[200],
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlashList
          data={activities ?? []}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={estimatedItemSize}
          ListEmptyComponent={ListEmptyComponent}
          ItemSeparatorComponent={() => (
            <View style={{ paddingHorizontal: theme.contentPadding.md }}>
              <Divider thickness={1} />
            </View>
          )}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
  activityItem: {
    minHeight: 44,
  },
  iconCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
