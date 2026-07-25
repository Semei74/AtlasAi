import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Pressable, RefreshControl } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';

import { useDocuments, useDeleteDocumentMutation } from '../hooks';

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

import type { KnowledgeDocument, DocumentStatus } from '../types';

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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getStatusColor(status: DocumentStatus) {
  switch (status) {
    case 'Ready': return 'success';
    case 'Processing': return 'info';
    case 'Uploading': return 'info';
    case 'Failed': return 'error';
    case 'Archived': return 'neutral';
    case 'Deleted': return 'neutral';
    default: return 'default';
  }
}

function getMimeIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('text') || mimeType.includes('markdown')) return '📝';
  if (mimeType.includes('csv') || mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('yaml')) return '📋';
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('gz')) return '📦';
  return '📎';
}

const STATUS_OPTIONS: Array<{ label: string; value: DocumentStatus | 'All' }> = [
  { label: 'All', value: 'All' },
  { label: 'Ready', value: 'Ready' },
  { label: 'Processing', value: 'Processing' },
  { label: 'Failed', value: 'Failed' },
];

function StatusProgressBar({ status }: { status: DocumentStatus }) {
  const theme = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (status === 'Uploading' || status === 'Processing') {
      progress.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) });
    } else {
      progress.value = status === 'Ready' ? 1 : 0;
    }
  }, [status, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (status !== 'Uploading' && status !== 'Processing') {
    return null;
  }

  const barColor = status === 'Uploading' ? theme.colors.info.default : theme.colors.primary[500];

  return (
    <View
      style={{
        height: 3,
        backgroundColor: theme.colors.neutral[200],
        borderRadius: theme.radius.full,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: barColor,
            borderRadius: theme.radius.full,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

function DocumentCard({
  document: doc,
  onPress,
  onDelete,
}: {
  document: KnowledgeDocument;
  onPress: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const spacing = useSpacing();

  return (
    <Card
      variant="outline"
      padding={spacing.spacing[4]}
      onPress={onPress}
      accessibilityLabel={`Document: ${doc.originalName}`}
    >
      <Stack spacing={spacing.spacing[3]}>
        <Row spacing={spacing.spacing[3]} align="flex-start">
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.primary[50],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text role="heading4">{getMimeIcon(doc.mimeType)}</Text>
          </View>
          <Stack spacing={spacing.spacing[1]} flex={1}>
            <Text role="label" numberOfLines={1}>{doc.originalName}</Text>
            <Row spacing={spacing.spacing[2]}>
              <Text role="caption" color={theme.colors.text.tertiary}>
                {formatBytes(doc.size)}
              </Text>
              <Text role="caption" color={theme.colors.text.tertiary}>·</Text>
              <Text role="caption" color={theme.colors.text.tertiary}>
                {formatRelativeTime(doc.updatedAt)}
              </Text>
            </Row>
          </Stack>
          <Badge size="sm" color={getStatusColor(doc.status) as any} label={doc.status} />
        </Row>

        <StatusProgressBar status={doc.status} />

        {doc.tags.length > 0 && (
          <Row wrap spacing={spacing.spacing[1]}>
            {doc.tags.map((tag) => (
              <Chip key={tag} size="sm" color="outline" label={tag} />
            ))}
          </Row>
        )}

        <Row justify="space-between" align="center">
          <Text role="caption" color={theme.colors.text.tertiary}>
            v{doc.version}
          </Text>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            accessibilityLabel={`Delete ${doc.originalName}`}
            accessibilityRole="button"
          >
            <Text role="label" color={theme.colors.error.default}>Delete</Text>
          </Pressable>
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
      {[1, 2, 3, 4].map((i) => (
        <Surface key={i} variant="default" padding={spacing.spacing[4]}>
          <Stack spacing={spacing.spacing[3]}>
            <Row spacing={spacing.spacing[3]}>
              <View
                style={{ width: 40, height: 40, borderRadius: theme.radius.md, backgroundColor: theme.colors.neutral[200] }}
              />
              <Stack spacing={spacing.spacing[2]} flex={1}>
                <View
                  style={{ height: 14, width: '70%', borderRadius: theme.radius.sm, backgroundColor: theme.colors.neutral[200] }}
                />
                <View
                  style={{ height: 12, width: '40%', borderRadius: theme.radius.sm, backgroundColor: theme.colors.neutral[100] }}
                />
              </Stack>
            </Row>
            <View
              style={{ height: 3, width: '100%', borderRadius: theme.radius.full, backgroundColor: theme.colors.neutral[100] }}
            />
          </Stack>
        </Surface>
      ))}
    </Stack>
  );
}

export function KnowledgeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const spacing = useSpacing();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: documents,
    isLoading,
    isError,
    error,
    refetch,
  } = useDocuments({
    search: searchQuery || undefined,
    status: statusFilter === 'All' ? undefined : statusFilter,
  });

  const deleteDocumentMutation = useDeleteDocumentMutation();

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    let result = documents;
    if (statusFilter !== 'All') {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.originalName.toLowerCase().includes(lower) ||
          d.tags.some((t) => t.toLowerCase().includes(lower)),
      );
    }
    return result;
  }, [documents, statusFilter, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleUpload = useCallback(() => {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 2000);
  }, []);

  const handleDocumentPress = useCallback(
    (doc: KnowledgeDocument) => {
      router.push(`/knowledge/${doc.id}`);
    },
    [router],
  );

  const handleDelete = useCallback(
    (docId: string) => {
      deleteDocumentMutation.mutate(docId);
    },
    [deleteDocumentMutation],
  );

  const renderItem = useCallback(
    ({ item }: { item: KnowledgeDocument }) => (
      <DocumentCard
        document={item}
        onPress={() => handleDocumentPress(item)}
        onDelete={() => handleDelete(item.id)}
      />
    ),
    [handleDocumentPress, handleDelete],
  );

  const keyExtractor = useCallback((item: KnowledgeDocument) => item.id, []);

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
          title="Failed to load documents"
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
            <Input
              type="search"
              placeholder="Search documents..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search documents"
            />
            <Row spacing={spacing.spacing[2]} wrap>
              {STATUS_OPTIONS.map((opt) => (
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
        ) : filteredDocuments.length === 0 ? (
          <EmptyState
            title={searchQuery || statusFilter !== 'All' ? 'No matching documents' : 'No documents yet'}
            description={
              searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to build your knowledge base'
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
                  <Text role="heading4" color={theme.colors.primary[500]}>📚</Text>
                </View>
              </Icon>
            }
            action={
              searchQuery || statusFilter !== 'All' ? undefined : (
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleUpload}
                  loading={isUploading}
                  accessibilityLabel="Upload document"
                >
                  Upload Document
                </Button>
              )
            }
          />
        ) : (
          <FlashList
            data={filteredDocuments}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={160}
            contentContainerStyle={{ paddingHorizontal: spacing.spacing[4], paddingBottom: spacing.spacing[20] }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.spacing[3] }} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary[500]}
                accessibilityLabel="Refresh documents"
              />
            }
            accessibilityLabel="Documents list"
          />
        )}

        {!isLoading && filteredDocuments.length > 0 && (
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
              onPress={handleUpload}
              disabled={isUploading}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isUploading ? theme.colors.neutral[400] : theme.colors.primary[500],
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}
              accessibilityLabel="Upload document"
              accessibilityRole="button"
              accessibilityState={{ disabled: isUploading }}
            >
              {isUploading ? (
                <Loader size={24} color="#FFFFFF" />
              ) : (
                <Text role="heading4" color="#FFFFFF">+</Text>
              )}
            </Pressable>
          </Animated.View>
        )}
      </Stack>
    </Page>
  );
}
