import { useState, useCallback, useMemo, useRef } from 'react';
import { View, Pressable, TextInput, Keyboard, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, Text, Stack, Row, Card, EmptyState } from '../../design-system';
import { isReducedMotionEnabled } from '../../design-system';
import type { SearchResult } from '../types';

interface EnterpriseSearchProps {
  onResultPress?: (result: SearchResult) => void;
  onSearch?: (query: string) => void;
  recentSearches?: string[];
  onClearRecent?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function EnterpriseSearch({
  onResultPress,
  onSearch,
  recentSearches = [],
  onClearRecent,
  onCancel,
  autoFocus = false,
}: EnterpriseSearchProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(autoFocus);
  const inputRef = useRef<TextInput>(null);
  const scale = useSharedValue(1);
  const reducedMotion = isReducedMotionEnabled();

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      onSearch?.(text);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  const handleCancel = useCallback(() => {
    setQuery('');
    Keyboard.dismiss();
    setIsFocused(false);
    onCancel?.();
  }, [onCancel]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (!reducedMotion) {
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    }
  }, [reducedMotion, scale]);

  const handleBlur = useCallback(() => {
    if (!query) {
      setIsFocused(false);
    }
  }, [query]);

  const handlePressIn = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withTiming(0.98, { duration: 100 });
    }
  }, [reducedMotion, scale]);

  const handlePressOut = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    }
  }, [reducedMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const searchResults: SearchResult[] = useMemo(() => [], []);

  const renderSearchItem = useCallback(
    ({ item }: { item: SearchResult }) => (
      <Pressable
        onPress={() => onResultPress?.(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.type}: ${item.title}`}
        style={[
          styles.resultItem,
          {
            paddingHorizontal: theme.contentPadding.md,
            paddingVertical: theme.spacing[3],
          },
        ]}
      >
        <Row spacing={12} align="center">
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: theme.colors.neutral[100],
                borderRadius: theme.radius.sm,
              },
            ]}
          >
            <Text role="caption">{getTypeIcon(item.type)}</Text>
          </View>
          <Stack spacing={2} style={{ flex: 1 }}>
            <Text role="bodySmall" numberOfLines={1}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text role="caption" color={theme.colors.text.tertiary} numberOfLines={1}>
                {item.subtitle}
              </Text>
            )}
          </Stack>
        </Row>
      </Pressable>
    ),
    [onResultPress, theme],
  );

  const renderRecentItem = useCallback(
    ({ item }: { item: string }) => (
      <Pressable
        onPress={() => setQuery(item)}
        accessibilityRole="button"
        accessibilityLabel={`Recent search: ${item}`}
        style={[
          styles.resultItem,
          {
            paddingHorizontal: theme.contentPadding.md,
            paddingVertical: theme.spacing[3],
          },
        ]}
      >
        <Row spacing={12} align="center">
          <Text role="bodySmall" color={theme.colors.text.tertiary}>
            🔍
          </Text>
          <Text role="bodySmall" numberOfLines={1} style={{ flex: 1 }}>
            {item}
          </Text>
        </Row>
      </Pressable>
    ),
    [theme],
  );

  const keyExtractor = useCallback(
    (item: SearchResult | string, index: number) =>
      typeof item === 'string' ? `recent-${index}` : item.id,
    [],
  );

  const estimatedItemSize = useMemo(() => 52, []);

  const showRecent = isFocused && !query && recentSearches.length > 0;
  const showNoResults = isFocused && query && searchResults.length === 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bg.primary,
          borderBottomWidth: isFocused ? 0 : 1,
          borderBottomColor: theme.colors.border.default,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.inputRow,
          {
            paddingHorizontal: theme.contentPadding.md,
            paddingVertical: theme.spacing[2],
          },
        ]}
      >
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.neutral[100],
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: isFocused ? theme.colors.border.focus : 'transparent',
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search across Atlas AI..."
            placeholderTextColor={theme.colors.text.tertiary}
            returnKeyType="search"
            keyboardType="web-search"
            autoCorrect={false}
            autoCapitalize="none"
            style={[
              styles.input,
              {
                fontSize: theme.getTypeRole('body').fontSize,
                fontFamily: theme.fontFamily.inter,
                color: theme.colors.text.primary,
              },
            ]}
            accessibilityLabel="Search"
            accessibilityHint="Search across projects, documents, conversations, and more"
          />
          {query.length > 0 && (
            <Pressable
              onPress={handleClear}
              hitSlop={8}
              style={[styles.clearBtn, { padding: theme.spacing[1] }]}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Text role="caption" color={theme.colors.text.tertiary}>
                ✕
              </Text>
            </Pressable>
          )}
        </View>
        {isFocused && (
          <Pressable
            onPress={handleCancel}
            hitSlop={8}
            style={[styles.cancelBtn, { paddingLeft: theme.spacing[2] }]}
            accessibilityLabel="Cancel search"
            accessibilityRole="button"
          >
            <Text role="bodySmall" color={theme.colors.text.link}>
              Cancel
            </Text>
          </Pressable>
        )}
      </View>

      {showRecent && (
        <Animated.View
          entering={FadeInDown.duration(theme.duration.fast)}
          exiting={FadeOutUp.duration(theme.duration.fast)}
        >
          <View
            style={{
              paddingHorizontal: theme.contentPadding.md,
              paddingBottom: theme.spacing[2],
            }}
          >
            <Row spacing={12} align="center" style={{ marginBottom: theme.spacing[2] }}>
              <Text role="caption" color={theme.colors.text.secondary}>
                Recent Searches
              </Text>
              <Pressable
                onPress={onClearRecent}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear recent searches"
              >
                <Text role="caption" color={theme.colors.text.link}>
                  Clear
                </Text>
              </Pressable>
            </Row>
          </View>
          <FlashList
            data={recentSearches}
            renderItem={renderRecentItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={estimatedItemSize}
            scrollEnabled={false}
          />
        </Animated.View>
      )}

      {showNoResults && (
        <Animated.View
          entering={FadeInDown.duration(theme.duration.fast)}
          exiting={FadeOutUp.duration(theme.duration.fast)}
          style={{ paddingVertical: theme.spacing[8] }}
        >
          <EmptyState
            title="No results found"
            description={`No results for "${query}". Try a different search term.`}
          />
        </Animated.View>
      )}

      {isFocused && query && searchResults.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(theme.duration.fast)}
          exiting={FadeOutUp.duration(theme.duration.fast)}
        >
          <FlashList
            data={searchResults}
            renderItem={renderSearchItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={estimatedItemSize}
            scrollEnabled={false}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'project': return '📁';
    case 'chat': return '💬';
    case 'document': return '📄';
    case 'knowledge': return '🧠';
    case 'agent': return '🤖';
    default: return '📌';
  }
}

const styles = StyleSheet.create({
  container: {},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    padding: 0,
    margin: 0,
  },
  clearBtn: {},
  cancelBtn: {},
  resultItem: {
    minHeight: 44,
  },
  typeBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
