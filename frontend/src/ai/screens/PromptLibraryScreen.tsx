import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Pressable, RefreshControl, ScrollView } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';

import {
  usePrompts,
  usePromptCategories,
  useDeletePromptMutation,
  usePublishPromptMutation,
  useArchivePromptMutation,
} from '../hooks';

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

import type { Prompt, PromptCategory } from '../types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

function PromptCard({
  prompt,
  onPress,
  onToggleFavorite,
  onExecute,
}: {
  prompt: Prompt;
  onPress: () => void;
  onToggleFavorite: () => void;
  onExecute: () => void;
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

  const statusColor = useMemo(() => {
    switch (prompt.status) {
      case 'Published': return 'success';
      case 'Draft': return 'warning';
      case 'Archived': return 'neutral';
      default: return 'default';
    }
  }, [prompt.status]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      accessibilityLabel={`Prompt: ${prompt.name}`}
      accessibilityRole="button"
    >
      <Card variant="outline" padding={spacing.spacing[4]}>
        <Stack spacing={spacing.spacing[3]}>
          <Row justify="space-between" align="flex-start">
            <Stack spacing={spacing.spacing[1]} flex={1}>
              <Row spacing={spacing.spacing[2]} align="center">
                <Text role="label" numberOfLines={1}>{prompt.name}</Text>
                <Badge size="sm" color={statusColor as any} label={prompt.status} />
                {prompt.currentVersion && (
                  <Badge size="sm" color="outline" label={`v${prompt.currentVersion.version}`} />
                )}
              </Row>
              {prompt.description ? (
                <Text role="bodySmall" color={theme.colors.text.secondary} numberOfLines={2}>
                  {prompt.description}
                </Text>
              ) : null}
            </Stack>
            <Pressable
              onPress={onToggleFavorite}
              hitSlop={8}
              accessibilityLabel={prompt.favorite ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityRole="button"
            >
              <Text
                role="heading5"
                color={prompt.favorite ? theme.colors.warning.default : theme.colors.text.tertiary}
              >
                {prompt.favorite ? '★' : '☆'}
              </Text>
            </Pressable>
          </Row>

          {prompt.category && (
            <Chip
              size="sm"
              color="primary"
              label={prompt.category.name}
            />
          )}

          {prompt.tags.length > 0 && (
            <Row wrap spacing={spacing.spacing[1]}>
              {prompt.tags.map((tag) => (
                <Chip key={tag} size="sm" color="outline" label={tag} />
              ))}
            </Row>
          )}

          <Divider />

          <Row justify="space-between" align="center">
            <Text role="caption" color={theme.colors.text.tertiary}>
              Updated {formatRelativeTime(prompt.updatedAt)}
            </Text>
            <Button
              variant="primary"
              size="sm"
              onPress={onExecute}
              accessibilityLabel={`Execute prompt ${prompt.name}`}
            >
              Run
            </Button>
          </Row>
        </Stack>
      </Card>
    </AnimatedPressable>
  );
}

function LoadingSkeleton() {
  const theme = useTheme();
  const spacing = useSpacing();

  return (
    <Stack spacing={spacing.spacing[4]}>
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

export function PromptLibraryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const spacing = useSpacing();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: prompts,
    isLoading: promptsLoading,
    isError: promptsError,
    error: promptsErrorObj,
    refetch: refetchPrompts,
  } = usePrompts(
    selectedCategoryId ? { categoryId: selectedCategoryId, search: searchQuery || undefined } : { search: searchQuery || undefined },
  );

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = usePromptCategories();

  const deletePromptMutation = useDeletePromptMutation();
  const publishPromptMutation = usePublishPromptMutation();
  const archivePromptMutation = useArchivePromptMutation();

  const filteredPrompts = useMemo(() => {
    if (!prompts) return [];
    let result = prompts;
    if (favoritesOnly) {
      result = result.filter((p) => p.favorite);
    }
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          p.tags.some((t) => t.toLowerCase().includes(lower)),
      );
    }
    return result;
  }, [prompts, favoritesOnly, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchPrompts();
    setRefreshing(false);
  }, [refetchPrompts]);

  const handleToggleFavorite = useCallback(
    (promptId: string) => {
      publishPromptMutation.mutate(promptId);
    },
    [publishPromptMutation],
  );

  const handleExecute = useCallback(
    (prompt: Prompt) => {
      router.push(`/prompts/${prompt.id}/execute`);
    },
    [router],
  );

  const handlePromptPress = useCallback(
    (prompt: Prompt) => {
      router.push(`/prompts/${prompt.id}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Prompt }) => (
      <PromptCard
        prompt={item}
        onPress={() => handlePromptPress(item)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
        onExecute={() => handleExecute(item)}
      />
    ),
    [handlePromptPress, handleToggleFavorite, handleExecute],
  );

  const keyExtractor = useCallback((item: Prompt) => item.id, []);

  if (promptsError) {
    return (
      <Page safeArea>
        <ErrorState
          title="Failed to load prompts"
          description={(promptsErrorObj as any)?.message ?? 'An unexpected error occurred'}
          onRetry={() => refetchPrompts()}
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
            <Input
              type="search"
              placeholder="Search prompts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search prompts"
            />
            <Row spacing={spacing.spacing[2]} justify="space-between" align="center">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                accessibilityLabel="Category filters"
              >
                <Row spacing={spacing.spacing[2]}>
                  <Chip
                    label="All"
                    color={selectedCategoryId === null ? 'primary' : 'default'}
                    onPress={() => setSelectedCategoryId(null)}
                    accessibilityLabel="Show all categories"
                  />
                  {!categoriesLoading && categories?.map((cat) => (
                    <Chip
                      key={cat.id}
                      label={cat.name}
                      color={selectedCategoryId === cat.id ? 'primary' : 'default'}
                      onPress={() => setSelectedCategoryId(cat.id)}
                      accessibilityLabel={`Filter by ${cat.name}`}
                    />
                  ))}
                </Row>
              </ScrollView>
              <Chip
                label="Favorites"
                color={favoritesOnly ? 'warning' : 'outline'}
                onPress={() => setFavoritesOnly((f) => !f)}
                icon={
                  <Text
                    role="caption"
                    color={favoritesOnly ? theme.colors.warning.default : theme.colors.text.tertiary}
                  >
                    ★
                  </Text>
                }
                accessibilityLabel="Toggle favorites filter"
              />
            </Row>
          </Stack>
        </Container>

        {promptsLoading ? (
          <Container>
            <LoadingSkeleton />
          </Container>
        ) : filteredPrompts.length === 0 ? (
          <EmptyState
            title={searchQuery || favoritesOnly ? 'No matching prompts' : 'No prompts yet'}
            description={
              searchQuery || favoritesOnly
                ? 'Try adjusting your search or filters'
                : 'Create your first prompt to get started'
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
                  <Text role="heading4" color={theme.colors.primary[500]}>📝</Text>
                </View>
              </Icon>
            }
          />
        ) : (
          <FlashList
            data={filteredPrompts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={180}
            contentContainerStyle={{ paddingHorizontal: spacing.spacing[4], paddingBottom: spacing.spacing[8] }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.spacing[3] }} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary[500]}
                accessibilityLabel="Refresh prompts"
              />
            }
            accessibilityLabel="Prompts list"
          />
        )}
      </Stack>
    </Page>
  );
}
