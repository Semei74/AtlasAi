import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Pressable, RefreshControl } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';

import {
  useTheme,
  useSpacing,
  useTypography,
  isReducedMotionEnabled,
  Button,
  Card,
  Stack,
  Row,
  Avatar,
  Badge,
  Divider,
  Input,
  Icon,
  EmptyState,
  ErrorState,
  Page,
  Container,
  Surface,
  Loader,
  Section,
  Chip,
  Text,
} from '../../design-system';

import type { Agent, AgentStatus } from '../types';

function getStatusBadgeColor(status: AgentStatus) {
  switch (status) {
    case 'idle': return 'neutral';
    case 'running': return 'success';
    case 'error': return 'error';
    case 'offline': return 'outline';
    default: return 'neutral';
  }
}

function AgentCard({ agent, onStartChat, onExecuteTask }: { agent: Agent; onStartChat: () => void; onExecuteTask: () => void }) {
  const theme = useTheme();
  const spacing = useSpacing();
  const typography = useTypography();

  return (
    <Card
      variant="outline"
      padding={spacing.spacing[4]}
      accessibilityLabel={`Agent: ${agent.name}`}
    >
      <Stack spacing={spacing.spacing[3]}>
        <Row spacing={spacing.spacing[3]} align="flex-start">
          <Avatar
            size="md"
            src={agent.avatarUrl}
            initials={agent.name.slice(0, 2).toUpperCase()}
            accessibilityLabel={agent.name}
          />
          <Stack spacing={spacing.spacing[1]} flex={1}>
            <Row spacing={spacing.spacing[2]} align="center">
              <Text role="label">{agent.name}</Text>
              <Badge size="sm" color={getStatusBadgeColor(agent.status) as any} label={agent.status} dot={false} />
            </Row>
            {agent.description ? (
              <Text role="bodySmall" color={theme.colors.text.secondary} numberOfLines={2}>
                {agent.description}
              </Text>
            ) : null}
          </Stack>
        </Row>

        <Row spacing={spacing.spacing[4]}>
          <Stack spacing={spacing.spacing[1]}>
            <Text role="caption" color={theme.colors.text.tertiary}>Model</Text>
            <Text role="label" color={theme.colors.text.primary}>{agent.model}</Text>
          </Stack>
          <Stack spacing={spacing.spacing[1]}>
            <Text role="caption" color={theme.colors.text.tertiary}>Provider</Text>
            <Text role="label" color={theme.colors.text.primary}>{agent.provider}</Text>
          </Stack>
          {agent.lastActivity && (
            <Stack spacing={spacing.spacing[1]}>
              <Text role="caption" color={theme.colors.text.tertiary}>Last Activity</Text>
              <Text role="label" color={theme.colors.text.primary}>
                {new Date(agent.lastActivity).toLocaleDateString()}
              </Text>
            </Stack>
          )}
        </Row>

        {agent.capabilities.length > 0 && (
          <Row wrap spacing={spacing.spacing[1]}>
            {agent.capabilities.map((cap) => (
              <Chip key={cap} size="sm" color="primary" label={cap} />
            ))}
          </Row>
        )}

        <Divider />

        <Row spacing={spacing.spacing[3]} justify="flex-end">
          <Button
            variant="outline"
            size="sm"
            onPress={onStartChat}
            accessibilityLabel={`Start conversation with ${agent.name}`}
          >
            Chat
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={onExecuteTask}
            accessibilityLabel={`Execute task with ${agent.name}`}
          >
            Execute
          </Button>
        </Row>
      </Stack>
    </Card>
  );
}

function LoadingSkeleton() {
  const theme = useTheme();
  const spacing = useSpacing();

  return (
    <Stack spacing={spacing.spacing[3]}>
      {[1, 2, 3].map((i) => (
        <Surface key={i} variant="default" padding={spacing.spacing[4]}>
          <Stack spacing={spacing.spacing[3]}>
            <Row spacing={spacing.spacing[3]}>
              <View
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.neutral[200] }}
              />
              <Stack spacing={spacing.spacing[2]} flex={1}>
                <View
                  style={{ height: 14, width: '40%', borderRadius: theme.radius.sm, backgroundColor: theme.colors.neutral[200] }}
                />
                <View
                  style={{ height: 12, width: '70%', borderRadius: theme.radius.sm, backgroundColor: theme.colors.neutral[100] }}
                />
              </Stack>
            </Row>
            <View
              style={{ height: 12, width: '50%', borderRadius: theme.radius.sm, backgroundColor: theme.colors.neutral[100] }}
            />
          </Stack>
        </Surface>
      ))}
    </Stack>
  );
}

const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Research Assistant',
    description: 'Helps with research, summarization, and information gathering across multiple sources.',
    status: 'idle',
    capabilities: ['Research', 'Summarization', 'Web Search', 'Data Extraction'],
    model: 'gpt-4o',
    provider: 'openai',
    lastActivity: new Date().toISOString(),
  },
  {
    id: 'agent-2',
    name: 'Code Reviewer',
    description: 'Reviews code changes, suggests improvements, and detects potential bugs.',
    status: 'running',
    capabilities: ['Code Review', 'Bug Detection', 'Best Practices'],
    model: 'claude-3.5-sonnet',
    provider: 'anthropic',
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'agent-3',
    name: 'Data Analyst',
    description: 'Analyzes datasets, creates visualizations, and generates reports.',
    status: 'error',
    capabilities: ['Data Analysis', 'Visualization', 'Reporting', 'SQL'],
    model: 'gpt-4o',
    provider: 'openai',
    lastActivity: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function AgentsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const spacing = useSpacing();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMockData, setShowMockData] = useState(false);
  const [hasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMockData(true);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShowMockData(true);
    setRefreshing(false);
  }, []);

  const handleStartChat = useCallback(
    (agent: Agent) => {
      router.push(`/ai/chat?agent=${agent.id}`);
    },
    [router],
  );

  const handleExecuteTask = useCallback(
    (agent: Agent) => {
      router.push(`/agents/${agent.id}/execute`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Agent }) => (
      <AgentCard
        agent={item}
        onStartChat={() => handleStartChat(item)}
        onExecuteTask={() => handleExecuteTask(item)}
      />
    ),
    [handleStartChat, handleExecuteTask],
  );

  const keyExtractor = useCallback((item: Agent) => item.id, []);

  if (hasError) {
    return (
      <Page safeArea>
        <ErrorState
          title="Failed to load agents"
          description="Agent management is not available in the current backend version."
          retryLabel="Retry"
        />
      </Page>
    );
  }

  if (isLoading) {
    return (
      <Page safeArea>
        <Container>
          <Stack spacing={spacing.spacing[4]}>
            <View
              style={{
                height: 16,
                width: '50%',
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.neutral[200],
                marginBottom: spacing.spacing[2],
              }}
            />
            <LoadingSkeleton />
          </Stack>
        </Container>
      </Page>
    );
  }

  if (!showMockData) {
    return (
      <Page safeArea>
        <EmptyState
          title="AI Agents"
          description="Agent management is not available in the current backend version. Capabilities may be available in a future update."
          icon={
            <Icon size={48} color={theme.colors.text.tertiary}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: theme.colors.primary[50],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text role="heading4" color={theme.colors.primary[500]}>🤖</Text>
              </View>
            </Icon>
          }
        />
      </Page>
    );
  }

  return (
    <Page safeArea>
      <Stack spacing={spacing.spacing[0]} flex={1}>
        <Container>
          <Stack spacing={spacing.spacing[2]}>
            <Text role="heading5" color={theme.colors.text.primary}>AI Agents</Text>
            <Text role="bodySmall" color={theme.colors.text.secondary}>
              Deploy and manage AI agents for automated tasks
            </Text>
          </Stack>
        </Container>

        <FlashList
          data={MOCK_AGENTS}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={220}
          contentContainerStyle={{ paddingHorizontal: spacing.spacing[4], paddingTop: spacing.spacing[3], paddingBottom: spacing.spacing[8] }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.spacing[3] }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary[500]}
              accessibilityLabel="Refresh agents"
            />
          }
          accessibilityLabel="Agents list"
        />
      </Stack>
    </Page>
  );
}
