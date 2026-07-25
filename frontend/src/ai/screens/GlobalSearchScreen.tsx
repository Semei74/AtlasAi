import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Pressable, TextInput, Keyboard } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useChat } from '../context/ChatContext';

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

import type { SearchResult } from '../types';

const RECENT_SEARCHES_KEY = 'atlas_recent_searches';
const MAX_RECENT_SEARCHES = 10;

function getTypeIcon(type: SearchResult['type']): string {
  switch (type) {
    case 'chat': return '💬';
    case 'prompt': return '📝';
    case 'document': return '📄';
    case 'project': return '📁';
    case 'agent': return '🤖';
    default: return '🔍';
  }
}

function getResultTypeIcon(type: SearchResult['type']): { icon: string; color: string } {
  switch (type) {
    case 'chat': return { icon: '💬', color: '#3B82F6' };
    case 'prompt': return { icon: '📝', color: '#8B5CF6' };
    case 'document': return { icon: '📄', color: '#10B981' };
    case 'project': return { icon: '📁', color: '#F59E0B' };
    case 'agent': return { icon: '🤖', color: '#EC4899' };
    default: return { icon: '🔍', color: '#6B7280' };
  }
}

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

function SearchResultItem({ result, onPress }: { result: SearchResult; onPress: () => void }) {
  const theme = useTheme();
  const spacing = useSpacing();
  const typeInfo = getResultTypeIcon(result.type);

  return (
    <Card
      variant="outline"
      padding={spacing.spacing[3]}
      onPress={onPress}
      accessibilityLabel={`${result.type}: ${result.title}`}
    >
      <Row spacing={spacing.spacing[3]} align="flex-start">
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.primary[50],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text role="heading5">{typeInfo.icon}</Text>
        </View>
        <Stack spacing={spacing.spacing[1]} flex={1}>
          <Row spacing={spacing.spacing[2]} align="center">
            <Text role="label" numberOfLines={1} style={[{ flex: 1 }]}>{result.title}</Text>
            <Badge size="sm" color="outline" label={result.type} />
          </Row>
          {result.subtitle && (
            <Text role="bodySmall" color={theme.colors.text.secondary} numberOfLines={1}>
              {result.subtitle}
            </Text>
          )}
          <Row spacing={spacing.spacing[2]} align="center">
            {result.matchField && (
              <Text role="caption" color={theme.colors.primary[500]}>
                Matched: {result.matchField}
              </Text>
            )}
            <Text role="caption" color={theme.colors.text.tertiary}>
              {formatRelativeTime(result.updatedAt)}
            </Text>
          </Row>
        </Stack>
      </Row>
    </Card>
  );
}

function RecentSearchItem({ query, onPress, onRemove }: { query: string; onPress: () => void; onRemove: () => void }) {
  const theme = useTheme();
  const spacing = useSpacing();

  return (
    <Row
      spacing={spacing.spacing[3]}
      justify="space-between"
      align="center"
      padding={spacing.spacing[3]}
      paddingLeft={spacing.spacing[4]}
    >
      <Pressable onPress={onPress} style={[{ flex: 1 }]} accessibilityLabel={`Search for ${query}`} accessibilityRole="button">
        <Row spacing={spacing.spacing[3]} align="center">
          <Text role="caption" color={theme.colors.text.tertiary}>🕐</Text>
          <Text role="body" numberOfLines={1}>{query}</Text>
        </Row>
      </Pressable>
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        accessibilityLabel={`Remove ${query} from recent searches`}
        accessibilityRole="button"
      >
        <Text role="label" color={theme.colors.text.tertiary}>×</Text>
      </Pressable>
    </Row>
  );
}

export function GlobalSearchScreen() {
  const router = useRouter();
  const theme = useTheme();
  const spacing = useSpacing();
  const searchInputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isRecentLoaded, setIsRecentLoaded] = useState(false);

  const { searchConversations, conversations } = useChat();

  const loadRecentSearches = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Non-critical
    } finally {
      setIsRecentLoaded(true);
    }
  }, []);

  const saveRecentSearch = useCallback(async (searchQuery: string) => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      const existing: string[] = stored ? JSON.parse(stored) : [];
      const updated = [searchQuery, ...existing.filter((s) => s !== searchQuery)].slice(0, MAX_RECENT_SEARCHES);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {
      // Non-critical
    }
  }, []);

  const clearRecentSearches = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch {
      // Non-critical
    }
  }, []);

  const removeRecentSearch = useCallback(
    async (searchQuery: string) => {
      const updated = recentSearches.filter((s) => s !== searchQuery);
      try {
        await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        setRecentSearches(updated);
      } catch {
        // Non-critical
      }
    },
    [recentSearches],
  );

  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const conversationResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchConversations(debouncedQuery).map(
      (conv): SearchResult => ({
        id: conv.id,
        type: 'chat',
        title: conv.title,
        subtitle: conv.messages[conv.messages.length - 1]?.content.slice(0, 60) ?? '',
        matchField: conv.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ? 'title' : 'content',
        updatedAt: conv.updatedAt,
      }),
    );
  }, [debouncedQuery, searchConversations]);

  const results = useMemo(() => conversationResults, [conversationResults]);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
    },
    [],
  );

  const handleResultPress = useCallback(
    (result: SearchResult) => {
      saveRecentSearch(query);
      switch (result.type) {
        case 'chat':
          router.push(`/ai/chat?id=${result.id}`);
          break;
        case 'prompt':
          router.push(`/prompts/${result.id}`);
          break;
        case 'document':
          router.push(`/knowledge/${result.id}`);
          break;
        case 'project':
          router.push(`/projects/${result.id}`);
          break;
        case 'agent':
          router.push(`/agents/${result.id}`);
          break;
      }
    },
    [query, saveRecentSearch, router],
  );

  const handleRecentPress = useCallback(
    (recentQuery: string) => {
      setQuery(recentQuery);
      setDebouncedQuery(recentQuery);
    },
    [],
  );

  const handleCancel = useCallback(() => {
    Keyboard.dismiss();
    setQuery('');
    setDebouncedQuery('');
    router.back();
  }, [router]);

  const renderResult = useCallback(
    ({ item }: { item: SearchResult }) => (
      <SearchResultItem result={item} onPress={() => handleResultPress(item)} />
    ),
    [handleResultPress],
  );

  const resultKeyExtractor = useCallback((item: SearchResult) => `${item.type}-${item.id}`, []);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const r of results) {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    }
    return groups;
  }, [results]);

  const resultSections = useMemo(() => {
    const sections: Array<{ type: SearchResult['type']; data: SearchResult[]; icon: string }> = [];
    const order: SearchResult['type'][] = ['chat', 'prompt', 'document', 'project', 'agent'];
    for (const t of order) {
      if (groupedResults[t] && groupedResults[t].length > 0) {
        sections.push({ type: t, data: groupedResults[t], icon: getTypeIcon(t) });
      }
    }
    return sections;
  }, [groupedResults]);

  const renderSectionHeader = useCallback(
    (sectionType: SearchResult['type'], icon: string) => (
      <Row spacing={spacing.spacing[2]} padding={spacing.spacing[2]} paddingLeft={spacing.spacing[4]}>
        <Text role="label" color={theme.colors.text.secondary}>{icon}</Text>
        <Text role="label" color={theme.colors.text.secondary}>
          {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}s
        </Text>
      </Row>
    ),
    [theme, spacing],
  );

  const hasQuery = debouncedQuery.trim().length > 0;

  if (!hasQuery && isRecentLoaded && recentSearches.length === 0 && conversations.length === 0) {
    return (
      <Page safeArea>
        <Container>
          <Stack spacing={spacing.spacing[3]}>
            <Row spacing={spacing.spacing[2]} align="center">
              <Input
                type="search"
                placeholder="Search across conversations, prompts, documents, and more..."
                value={query}
                onChangeText={handleSearch}
                accessibilityLabel="Search"
              />
              <Pressable onPress={handleCancel} hitSlop={8} accessibilityLabel="Cancel search" accessibilityRole="button">
                <Text role="label" color={theme.colors.primary[500]}>Cancel</Text>
              </Pressable>
            </Row>
          </Stack>
        </Container>
        <EmptyState
          title="Search everything"
          description="Search across conversations, prompts, documents, and more"
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
                <Text role="heading4" color={theme.colors.primary[500]}>🔍</Text>
              </View>
            </Icon>
          }
        />
      </Page>
    );
  }

  return (
    <Page safeArea>
      <Container>
        <Stack spacing={spacing.spacing[3]}>
          <Row spacing={spacing.spacing[2]} align="center">
            <Input
              type="search"
              placeholder="Search..."
              value={query}
              onChangeText={handleSearch}
              accessibilityLabel="Search"
            />
            <Pressable onPress={handleCancel} hitSlop={8} accessibilityLabel="Cancel search" accessibilityRole="button">
              <Text role="label" color={theme.colors.primary[500]}>Cancel</Text>
            </Pressable>
          </Row>
        </Stack>
      </Container>

      {!hasQuery && recentSearches.length > 0 && (
        <Animated.View entering={FadeInDown.duration(200)}>
          <Section
            title="Recent Searches"
            action={
              <Pressable
                onPress={clearRecentSearches}
                hitSlop={8}
                accessibilityLabel="Clear recent searches"
                accessibilityRole="button"
              >
                <Text role="label" color={theme.colors.primary[500]}>Clear all</Text>
              </Pressable>
            }
          >
            {recentSearches.map((s) => (
              <RecentSearchItem
                key={s}
                query={s}
                onPress={() => handleRecentPress(s)}
                onRemove={() => removeRecentSearch(s)}
              />
            ))}
          </Section>
          <Divider />
        </Animated.View>
      )}

      {hasQuery && results.length === 0 ? (
        <EmptyState
          title={`No results found for "${debouncedQuery}"`}
          description="Try a different search term or check your spelling"
          icon={
            <Icon size={48} color={theme.colors.text.tertiary}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: theme.colors.neutral[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text role="heading4" color={theme.colors.text.tertiary}>🔍</Text>
              </View>
            </Icon>
          }
        />
      ) : hasQuery ? (
        <FlashList
          data={results}
          renderItem={renderResult}
          keyExtractor={resultKeyExtractor}
          estimatedItemSize={80}
          contentContainerStyle={{ paddingHorizontal: spacing.spacing[4], paddingBottom: spacing.spacing[8] }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.spacing[2] }} />}
          keyboardShouldPersistTaps="handled"
          accessibilityLabel="Search results"
        />
      ) : null}
    </Page>
  );
}
