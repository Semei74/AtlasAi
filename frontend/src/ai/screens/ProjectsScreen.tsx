import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Pressable, RefreshControl } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';

import { useProjects, useCreateProjectMutation } from '../hooks';

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

import type { Project, ProjectStatus } from '../types';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getStatusBadgeColor(status: ProjectStatus) {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'ARCHIVED': return 'neutral';
    case 'DRAFT': return 'warning';
    case 'COMPLETED': return 'info';
    default: return 'default';
  }
}

const STATUS_FILTERS: Array<{ label: string; value: ProjectStatus | 'All' }> = [
  { label: 'All', value: 'All' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

function ProjectCard({
  project,
  onPress,
}: {
  project: Project;
  onPress: () => void;
}) {
  const theme = useTheme();
  const spacing = useSpacing();
  const scale = useSharedValue(1);
  const reducedMotion = isReducedMotionEnabled();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
    }
  }, [reducedMotion, scale]);

  const handlePressOut = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    }
  }, [reducedMotion, scale]);

  return (
    <Animated.View style={animatedStyle}>
      <Card
        variant="outline"
        padding={spacing.spacing[4]}
        onPress={onPress}
        accessibilityLabel={`Project: ${project.name}`}
      >
        <Stack spacing={spacing.spacing[3]}>
          <Row justify="space-between" align="flex-start">
            <Stack spacing={spacing.spacing[1]} flex={1}>
              <Row spacing={spacing.spacing[2]} align="center">
                <Text role="label" numberOfLines={1}>{project.name}</Text>
                <Badge size="sm" color={getStatusBadgeColor(project.status) as any} label={project.status} />
              </Row>
              {project.description ? (
                <Text role="bodySmall" color={theme.colors.text.secondary} numberOfLines={2}>
                  {project.description}
                </Text>
              ) : null}
            </Stack>
          </Row>

          <Row spacing={spacing.spacing[4]}>
            {project.memberCount !== undefined && (
              <Row spacing={spacing.spacing[1]} align="center">
                <Text role="caption" color={theme.colors.text.tertiary}>👥</Text>
                <Text role="caption" color={theme.colors.text.secondary}>{project.memberCount} members</Text>
              </Row>
            )}
            {project.aiActivityCount !== undefined && (
              <Row spacing={spacing.spacing[1]} align="center">
                <Text role="caption" color={theme.colors.text.tertiary}>🤖</Text>
                <Text role="caption" color={theme.colors.text.secondary}>{project.aiActivityCount} AI activities</Text>
              </Row>
            )}
            <Text role="caption" color={theme.colors.text.tertiary}>
              {formatRelativeTime(project.updatedAt)}
            </Text>
          </Row>
        </Stack>
      </Card>
    </Animated.View>
  );
}

function LoadingSkeleton() {
  const theme = useTheme();
  const spacing = useSpacing();

  return (
    <Stack spacing={spacing.spacing[3]}>
      {[1, 2, 3, 4].map((i) => (
        <Surface key={i} variant="default" padding={spacing.spacing[4]}>
          <Stack spacing={spacing.spacing[3]}>
            <View
              style={{ height: 16, width: '50%', borderRadius: theme.radius.sm, backgroundColor: theme.colors.neutral[200] }}
            />
            <View
              style={{ height: 12, width: '80%', borderRadius: theme.radius.sm, backgroundColor: theme.colors.neutral[100] }}
            />
            <View
              style={{ height: 12, width: '30%', borderRadius: theme.radius.sm, backgroundColor: theme.colors.neutral[100] }}
            />
          </Stack>
        </Surface>
      ))}
    </Stack>
  );
}

export function ProjectsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const spacing = useSpacing();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const {
    data: projects,
    isLoading,
    isError,
    error,
    refetch,
  } = useProjects({
    search: searchQuery || undefined,
    status: statusFilter === 'All' ? undefined : statusFilter,
  });

  const createProjectMutation = useCreateProjectMutation();

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let result = projects;
    if (statusFilter !== 'All') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          (p.description && p.description.toLowerCase().includes(lower)),
      );
    }
    return result;
  }, [projects, statusFilter, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCreateProject = useCallback(() => {
    createProjectMutation.mutate(
      { name: `Project ${new Date().toLocaleDateString()}` },
      {
        onSuccess: (newProject) => {
          router.push(`/projects/${newProject.id}`);
        },
      },
    );
  }, [createProjectMutation, router]);

  const handleProjectPress = useCallback(
    (project: Project) => {
      router.push(`/projects/${project.id}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Project }) => (
      <ProjectCard project={item} onPress={() => handleProjectPress(item)} />
    ),
    [handleProjectPress],
  );

  const keyExtractor = useCallback((item: Project) => item.id, []);

  const fabScale = useSharedValue(0);
  const reducedMotion = isReducedMotionEnabled();

  useEffect(() => {
    if (!reducedMotion) {
      fabScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      fabScale.value = 1;
    }
  }, [reducedMotion, fabScale]);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
    opacity: fabScale.value,
  }));

  if (isError) {
    return (
      <Page safeArea>
        <ErrorState
          title="Failed to load projects"
          description={(error as any)?.message ?? 'An unexpected error occurred'}
          onRetry={() => refetch()}
          retryLabel="Retry"
        />
      </Page>
    );
  }

  return (
    <Page safeArea>
      <Stack spacing={spacing.spacing[0]} flex={1}>
        <Container>
          <Stack spacing={spacing.spacing[3]}>
            <Row spacing={spacing.spacing[2]} align="center">
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Search projects"
              />
              <Pressable
                onPress={() => setViewMode((m) => (m === 'list' ? 'grid' : 'list'))}
                hitSlop={8}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors.neutral[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityLabel={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
                accessibilityRole="button"
              >
                <Text role="label" color={theme.colors.text.secondary}>
                  {viewMode === 'list' ? '▦' : '☰'}
                </Text>
              </Pressable>
            </Row>
            <Row spacing={spacing.spacing[2]} wrap>
              {STATUS_FILTERS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  color={statusFilter === opt.value ? 'primary' : 'default'}
                  onPress={() => setStatusFilter(opt.value)}
                  accessibilityLabel={`Filter by ${opt.label}`}
                />
              ))}
            </Row>
          </Stack>
        </Container>

        {isLoading ? (
          <Container>
            <LoadingSkeleton />
          </Container>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title={searchQuery || statusFilter !== 'All' ? 'No matching projects' : 'No projects yet'}
            description={
              searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started'
            }
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
                  <Text role="heading4" color={theme.colors.primary[500]}>📁</Text>
                </View>
              </Icon>
            }
            action={
              searchQuery || statusFilter !== 'All' ? undefined : (
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleCreateProject}
                  loading={createProjectMutation.isPending}
                  accessibilityLabel="Create new project"
                >
                  Create Project
                </Button>
              )
            }
          />
        ) : (
          <FlashList
            data={filteredProjects}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={140}
            contentContainerStyle={{ paddingHorizontal: spacing.spacing[4], paddingBottom: spacing.spacing[20] }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.spacing[3] }} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary[500]}
                accessibilityLabel="Refresh projects"
              />
            }
            accessibilityLabel="Projects list"
          />
        )}

        {!isLoading && filteredProjects.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            style={[
              {
                position: 'absolute',
                bottom: spacing.spacing[6],
                right: spacing.spacing[6],
              },
              fabAnimatedStyle,
            ]}
          >
            <Pressable
              onPress={handleCreateProject}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: theme.colors.primary[500],
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}
              accessibilityLabel="Create new project"
              accessibilityRole="button"
            >
              <Text role="heading4" color="#FFFFFF">+</Text>
            </Pressable>
          </Animated.View>
        )}
      </Stack>
    </Page>
  );
}
