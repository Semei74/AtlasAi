import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Pressable, TextInput, RefreshControl } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring, FadeIn } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';

import { useChat } from '../context/ChatContext';
import { ChatBubble } from '../components/chat/ChatBubble';
import { ChatComposer } from '../components/chat/ChatComposer';
import { ChatHeader } from '../components/chat/ChatHeader';
import { EmptyChat } from '../components/chat/EmptyChat';

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

import type { Conversation } from '../types';

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

function SwipeableRow({ children, onDelete, accessibilityLabel }: { children: React.ReactNode; onDelete: () => void; accessibilityLabel: string }) {
  const theme = useTheme();
  const spacing = useSpacing();

  const renderRightActions = () => (
    <Pressable
      onPress={onDelete}
      style={{
        backgroundColor: theme.colors.error.default,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginLeft: spacing.spacing[2],
        borderRadius: theme.radius.md,
      }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Text color="#FFFFFF" role="label">Delete</Text>
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      {children}
    </Swipeable>
  );
}

function ConversationListItem({
  conversation,
  onPress,
  onLongPress,
  onDelete,
}: {
  conversation: Conversation;
  onPress: () => void;
  onLongPress: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const spacing = useSpacing();
  const messageCount = conversation.messages.length;
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const preview = lastMessage
    ? lastMessage.content.slice(0, 80) + (lastMessage.content.length > 80 ? '...' : '')
    : 'No messages yet';

  return (
    <SwipeableRow onDelete={onDelete} accessibilityLabel={`Delete ${conversation.title}`}>
      <Card
        variant="outline"
        padding={spacing.spacing[3]}
        onPress={onPress}
        accessibilityLabel={`Open conversation ${conversation.title}`}
      >
        <Pressable onLongPress={onLongPress} accessibilityLabel={`Options for ${conversation.title}`} accessibilityRole="button">
          <Row spacing={spacing.spacing[3]} align="flex-start">
            <Avatar
              size="sm"
              initials={conversation.title.slice(0, 2).toUpperCase()}
              accessibilityLabel={conversation.title}
            />
            <Stack spacing={spacing.spacing[1]} flex={1}>
              <Row justify="space-between" align="center">
                <Text role="label" numberOfLines={1} style={[{ flex: 1 }]}>{conversation.title}</Text>
                <Text role="caption" color={theme.colors.text.tertiary}>
                  {formatRelativeTime(conversation.updatedAt)}
                </Text>
              </Row>
              <Text role="bodySmall" color={theme.colors.text.secondary} numberOfLines={1}>
                {preview}
              </Text>
              <Row spacing={spacing.spacing[2]}>
                <Text role="caption" color={theme.colors.text.tertiary}>
                  {messageCount} messages
                </Text>
                {conversation.pinned && (
                  <Badge size="sm" color="info" label="Pinned" />
                )}
                {conversation.archived && (
                  <Badge size="sm" color="neutral" label="Archived" />
                )}
              </Row>
            </Stack>
          </Row>
        </Pressable>
      </Card>
    </SwipeableRow>
  );
}

function ConversationListView({
  conversations,
  searchQuery,
  onSearchChange,
  onCreateNew,
  onConversationPress,
  onConversationLongPress,
  onDelete,
  onRefresh,
  refreshing,
  isInitialLoading,
}: {
  conversations: Conversation[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCreateNew: () => void;
  onConversationPress: (id: string) => void;
  onConversationLongPress: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  isInitialLoading: boolean;
}) {
  const theme = useTheme();
  const spacing = useSpacing();

  const pinnedConversations = useMemo(
    () => conversations.filter((c) => c.pinned && !c.archived),
    [conversations],
  );

  const recentConversations = useMemo(
    () =>
      [...conversations]
        .filter((c) => !c.pinned && !c.archived)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [conversations],
  );

  if (isInitialLoading) {
    return (
      <Stack spacing={spacing.spacing[4]} padding={spacing.spacing[4]}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Surface key={i} variant="default" padding={spacing.spacing[4]}>
            <Row spacing={spacing.spacing[3]}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.neutral[200],
                }}
              />
              <Stack spacing={spacing.spacing[2]} flex={1}>
                <View
                  style={{
                    height: 14,
                    width: '60%',
                    borderRadius: theme.radius.sm,
                    backgroundColor: theme.colors.neutral[200],
                  }}
                />
                <View
                  style={{
                    height: 12,
                    width: '40%',
                    borderRadius: theme.radius.sm,
                    backgroundColor: theme.colors.neutral[100],
                  }}
                />
              </Stack>
            </Row>
          </Surface>
        ))}
      </Stack>
    );
  }

  const renderConversation = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationListItem
        conversation={item}
        onPress={() => onConversationPress(item.id)}
        onLongPress={() => onConversationLongPress(item.id)}
        onDelete={() => onDelete(item.id)}
      />
    ),
    [onConversationPress, onConversationLongPress, onDelete],
  );

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  if (conversations.length === 0 && !searchQuery) {
    return (
      <Page safeArea>
        <EmptyState
          title="No conversations yet"
          description="Start a new chat with an AI assistant"
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
                <Text role="heading4" color={theme.colors.primary[500]}>💬</Text>
              </View>
            </Icon>
          }
          action={
            <Button variant="primary" size="lg" onPress={onCreateNew} accessibilityLabel="Start new chat">
              New Chat
            </Button>
          }
        />
      </Page>
    );
  }

  const ListHeader = useMemo(
    () => (
      <Stack spacing={spacing.spacing[4]}>
        <Row spacing={spacing.spacing[3]}>
          <Input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={onSearchChange}
            accessibilityLabel="Search conversations"
          />
        </Row>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={onCreateNew}
          accessibilityLabel="Create new conversation"
        >
          New Chat
        </Button>
        {pinnedConversations.length > 0 && (
          <Section title="Pinned" description={`${pinnedConversations.length} conversations`}>
            <Stack spacing={spacing.spacing[2]}>
              {pinnedConversations.map((conv) => (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  onPress={() => onConversationPress(conv.id)}
                  onLongPress={() => onConversationLongPress(conv.id)}
                  onDelete={() => onDelete(conv.id)}
                />
              ))}
            </Stack>
          </Section>
        )}
        {recentConversations.length > 0 && (
          <Text role="heading6" color={theme.colors.text.primary} style={{ paddingHorizontal: spacing.spacing[4] }}>
            Recent conversations
          </Text>
        )}
      </Stack>
    ),
    [searchQuery, onSearchChange, pinnedConversations, recentConversations, onConversationPress, onConversationLongPress, onDelete, spacing, theme],
  );

  const emptyComponent = useMemo(
    () => (
      <EmptyState
        title="No results"
        description="Try a different search query"
      />
    ),
    [],
  );

  return (
    <Page safeArea>
      <FlashList
        data={searchQuery ? conversations.filter((c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
        ) : recentConversations}
        renderItem={renderConversation}
        keyExtractor={keyExtractor}
        estimatedItemSize={88}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={searchQuery ? emptyComponent : null}
        contentContainerStyle={{ paddingHorizontal: spacing.spacing[4], paddingTop: spacing.spacing[2], paddingBottom: spacing.spacing[20] }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
            accessibilityLabel="Refresh conversations"
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.spacing[2] }} />}
      />
    </Page>
  );
}

function ChatView({
  conversation,
  onBack,
  onSendMessage,
  isStreaming,
  onStop,
}: {
  conversation: Conversation;
  onBack: () => void;
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}) {
  const theme = useTheme();
  const spacing = useSpacing();
  const flatListRef = useRef<FlashList<any>>(null);
  const messages = conversation.messages;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const renderMessage = useCallback(
    ({ item }: { item: any }) => (
      <ChatBubble message={item} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.primary }}>
      <ChatHeader conversation={conversation} onBack={onBack} />
      {messages.length === 0 ? (
        <EmptyChat onStartNew={onBack} />
      ) : (
        <FlashList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          estimatedItemSize={80}
          inverted={false}
          contentContainerStyle={{ paddingHorizontal: spacing.spacing[4], paddingVertical: spacing.spacing[3] }}
          accessibilityLabel="Chat messages"
        />
      )}
      <ChatComposer
        onSend={onSendMessage}
        disabled={isStreaming}
        isStreaming={isStreaming}
        onStop={onStop}
      />
    </View>
  );
}

export function AIChatScreen() {
  const {
    conversations,
    activeConversation,
    isStreaming,
    createConversation,
    deleteConversation,
    togglePinConversation,
    toggleArchiveConversation,
    setActiveConversation,
    sendMessage,
    stopGeneration,
    searchConversations,
    getPinnedConversations,
  } = useChat();

  const router = useRouter();
  const theme = useTheme();
  const spacing = useSpacing();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [actionMenuConvId, setActionMenuConvId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleNewChat = useCallback(() => {
    const id = createConversation();
    setActiveConversation(id);
  }, [createConversation, setActiveConversation]);

  const handleSendMessage = useCallback(
    (text: string) => {
      sendMessage(text).catch(() => setHasError(true));
    },
    [sendMessage],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleConversationPress = useCallback(
    (id: string) => {
      setActiveConversation(id);
    },
    [setActiveConversation],
  );

  const handleConversationLongPress = useCallback(
    (id: string) => {
      setActionMenuConvId(id);
    },
    [],
  );

  const handleBack = useCallback(() => {
    setActiveConversation(null);
  }, [setActiveConversation]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteConversation(id);
    },
    [deleteConversation],
  );

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

  if (hasError) {
    return (
      <Page safeArea>
        <ErrorState
          title="Something went wrong"
          description="Failed to load conversations. Please try again."
          onRetry={() => {
            setHasError(false);
            setIsInitialLoading(true);
            setTimeout(() => setIsInitialLoading(false), 400);
          }}
          retryLabel="Retry"
          accessibilityLabel="Error loading conversations"
        />
      </Page>
    );
  }

  if (activeConversation) {
    return (
      <ChatView
        conversation={activeConversation}
        onBack={handleBack}
        onSendMessage={handleSendMessage}
        isStreaming={isStreaming}
        onStop={stopGeneration}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.primary }}>
      <ConversationListView
        conversations={conversations}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateNew={handleNewChat}
        onConversationPress={handleConversationPress}
        onConversationLongPress={handleConversationLongPress}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        isInitialLoading={isInitialLoading}
      />

      {isInitialLoading ? null : (
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
            onPress={handleNewChat}
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
            accessibilityLabel="Create new conversation"
            accessibilityRole="button"
          >
            <Text role="heading4" color="#FFFFFF">+</Text>
          </Pressable>
        </Animated.View>
      )}

      {actionMenuConvId && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(200)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setActionMenuConvId(null)}
            accessibilityLabel="Close menu"
            accessibilityRole="button"
          />
          <Surface variant="elevated" padding={spacing.spacing[6]}>
            <Stack spacing={spacing.spacing[4]} align="center">
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onPress={() => {
                  togglePinConversation(actionMenuConvId);
                  setActionMenuConvId(null);
                }}
                accessibilityLabel="Toggle pin conversation"
              >
                {conversations.find((c) => c.id === actionMenuConvId)?.pinned ? 'Unpin' : 'Pin'}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onPress={() => {
                  toggleArchiveConversation(actionMenuConvId);
                  setActionMenuConvId(null);
                }}
                accessibilityLabel="Toggle archive conversation"
              >
                {conversations.find((c) => c.id === actionMenuConvId)?.archived ? 'Unarchive' : 'Archive'}
              </Button>
              <Button
                variant="danger"
                size="lg"
                fullWidth
                onPress={() => {
                  deleteConversation(actionMenuConvId);
                  setActionMenuConvId(null);
                }}
                accessibilityLabel="Delete conversation"
              >
                Delete
              </Button>
            </Stack>
          </Surface>
        </Animated.View>
      )}
    </View>
  );
}
