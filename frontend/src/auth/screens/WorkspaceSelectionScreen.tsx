import { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  type ListRenderItemInfo,
} from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import {
  useTheme,
  Text,
  Input,
  Stack,
  Container,
  Surface,
  Avatar,
  Badge,
  Loader,
  EmptyState,
  useReducedMotion,
} from '../../../design-system';
import { useMembershipsQuery } from '../auth-hooks';
import type { Membership } from '../types';

interface WorkspaceSelectionScreenProps {
  onSelectWorkspace: (workspaceId: string) => void;
}

export function WorkspaceSelectionScreen({
  onSelectWorkspace,
}: WorkspaceSelectionScreenProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    data: memberships = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useMembershipsQuery();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return memberships;
    const query = searchQuery.toLowerCase();
    return memberships.filter(
      (m) =>
        m.organization.name.toLowerCase().includes(query) ||
        m.workspaces?.some((w) => w.name.toLowerCase().includes(query)),
    );
  }, [memberships, searchQuery]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Membership>) => {
      const org = item.organization;
      const workspaces = item.workspaces ?? [];

      return (
        <Animated.View
          entering={reducedMotion ? FadeIn.duration(0) : FadeIn.duration(300).delay(index * 50)}
          layout={Layout.duration(reducedMotion ? 0 : 200)}
        >
          <Surface variant="elevated" padding="md" style={styles.card}>
            <Pressable
              onPress={() => onSelectWorkspace(org.id)}
              accessibilityLabel={`${org.name} workspace`}
              accessibilityHint={`Tap to enter ${org.name}`}
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Stack spacing={4}>
                <Stack spacing={3} style={styles.cardHeader}>
                  <Avatar
                    size="lg"
                    initials={org.name.charAt(0).toUpperCase()}
                  />
                  <Stack spacing={1} flex={1}>
                    <Text role="subtitle" color={theme.colors.text.primary}>
                      {org.name}
                    </Text>
                    <Badge
                      color="info"
                      size="sm"
                      label={item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                    />
                  </Stack>
                </Stack>

                {workspaces.length > 0 && (
                  <Stack spacing={2} style={styles.workspaceList}>
                    {workspaces.map((w) => (
                      <Pressable
                        key={w.id}
                        onPress={() => onSelectWorkspace(w.id)}
                        accessibilityLabel={`Enter ${w.name}`}
                        style={({ pressed }) => [
                          styles.workspaceItem,
                          { backgroundColor: theme.colors.neutral[50] },
                          pressed && { backgroundColor: theme.colors.neutral[100] },
                        ]}
                      >
                        <Stack spacing={2}>
                          <Text
                            role="bodySmall"
                            color={theme.colors.text.primary}
                          >
                            {w.name}
                          </Text>
                          {w.description && (
                            <Text
                              role="caption"
                              color={theme.colors.text.tertiary}
                            >
                              {w.description}
                            </Text>
                          )}
                        </Stack>
                      </Pressable>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Pressable>
          </Surface>
        </Animated.View>
      );
    },
    [onSelectWorkspace, theme, reducedMotion],
  );

  if (isLoading) {
    return (
      <Container flex={1} center>
        <Loader size="lg" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container flex={1} center>
        <EmptyState
          title="Failed to load workspaces"
          description="Pull down to retry loading workspaces"
        />
      </Container>
    );
  }

  return (
    <Container flex={1}>
      <Stack spacing={6}>
        <Stack spacing={2}>
          <Text role="heading2" color={theme.colors.text.primary}>
            Select Workspace
          </Text>
          <Text role="body" color={theme.colors.text.secondary}>
            Choose a workspace to continue
          </Text>
        </Stack>

        <Input
          placeholder="Search workspaces..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          type="search"
          accessibilityLabel="Search workspaces"
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No workspaces found"
            description={
              searchQuery
                ? 'Try a different search term'
                : "You don't have any workspaces yet"
            }
          />
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={theme.colors.primary[500]}
                colors={[theme.colors.primary[500]]}
              />
            }
          />
        )}
      </Stack>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  cardPressable: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workspaceList: {
    marginTop: 8,
    paddingLeft: 56,
  },
  workspaceItem: {
    padding: 12,
    borderRadius: 8,
  },
  list: {
    paddingBottom: 32,
  },
});
