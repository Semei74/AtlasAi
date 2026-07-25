import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme, Text, Card, Stack, Row } from '../../design-system';
import { useDashboard } from '../hooks';
import type { InsightMetric } from '../types';

function deriveInsights(
  stats: { projectsCount: number; workspacesCount: number; activeUsersCount: number } | undefined,
): InsightMetric[] {
  if (!stats) return [];
  return [
    {
      id: 'projects',
      label: 'Projects',
      value: String(stats.projectsCount),
      trend: 'stable',
      change: 'Active',
      icon: '📁',
      color: '#4F46E5',
    },
    {
      id: 'workspaces',
      label: 'Workspaces',
      value: String(stats.workspacesCount),
      trend: 'stable',
      change: 'Active',
      icon: '🏢',
      color: '#059669',
    },
    {
      id: 'members',
      label: 'Active Members',
      value: String(stats.activeUsersCount),
      trend: 'stable',
      change: 'Active',
      icon: '👥',
      color: '#2563EB',
    },
    {
      id: 'tokens',
      label: 'AI Tokens',
      value: '—',
      trend: 'stable',
      change: 'Endpoint unavailable',
      icon: '⚡',
      color: '#D97706',
    },
    {
      id: 'chats',
      label: 'AI Chats',
      value: '—',
      trend: 'stable',
      change: 'Endpoint unavailable',
      icon: '💬',
      color: '#7C3AED',
    },
    {
      id: 'requests',
      label: 'API Requests',
      value: '—',
      trend: 'stable',
      change: 'Endpoint unavailable',
      icon: '🔄',
      color: '#DC2626',
    },
  ];
}

interface AIInsightsProps {
  compact?: boolean;
}

export function AIInsights({ compact = false }: AIInsightsProps) {
  const theme = useTheme();
  const { data: stats, isLoading, error } = useDashboard();

  const insights = useMemo(() => deriveInsights(stats), [stats]);

  if (error) {
    return null;
  }

  if (isLoading) {
    return (
      <View
        style={[
          styles.section,
          { paddingHorizontal: theme.contentPadding.md },
        ]}
      >
        <Text role="heading4" style={{ marginBottom: theme.spacing[3] }}>
          Insights
        </Text>
        <Row spacing={12}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.skeletonCard,
                {
                  flex: 1,
                  backgroundColor: theme.colors.neutral[100],
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.neutral[200],
                }}
              />
              <View style={{ height: 8 }} />
              <View
                style={{
                  width: '60%',
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: theme.colors.neutral[200],
                }}
              />
              <View style={{ height: 4 }} />
              <View
                style={{
                  width: '40%',
                  height: 10,
                  borderRadius: 4,
                  backgroundColor: theme.colors.neutral[200],
                }}
              />
            </View>
          ))}
        </Row>
      </View>
    );
  }

  if (!stats) return null;

  return (
    <View
      style={[
        styles.section,
        { paddingHorizontal: theme.contentPadding.md },
      ]}
      accessibilityLabel="AI Insights"
    >
      <Row spacing={12} align="center" style={{ marginBottom: theme.spacing[3] }}>
        <Text role="heading4">Insights</Text>
      </Row>
      <View style={styles.grid}>
        {insights.map((metric, index) => (
          <Animated.View
            key={metric.id}
            entering={FadeInDown.duration(theme.duration.fast).delay(index * 40).springify()}
            style={
              compact || index < 3
                ? { flex: index < 3 ? 1 : undefined, width: compact ? '48%' : index < 3 ? undefined : '48%' }
                : { width: '48%' }
            }
          >
            <Card
              variant={metric.change === 'Endpoint unavailable' ? 'default' : 'elevated'}
              padding={12}
            >
              <Stack spacing={4}>
                <Row spacing={8} align="center">
                  <Text role="body">{metric.icon}</Text>
                  <Text
                    role="caption"
                    color={theme.colors.text.secondary}
                    numberOfLines={1}
                    style={{ flex: 1 }}
                  >
                    {metric.label}
                  </Text>
                </Row>
                <Text role="dataLarge">{metric.value}</Text>
                <Text
                  role="caption"
                  color={
                    metric.change === 'Endpoint unavailable'
                      ? theme.colors.text.tertiary
                      : theme.colors.text.secondary
                  }
                >
                  {metric.change}
                </Text>
              </Stack>
            </Card>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skeletonCard: {
    padding: 16,
  },
});
