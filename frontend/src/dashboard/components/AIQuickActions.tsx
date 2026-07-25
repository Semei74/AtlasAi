import { useMemo, useCallback } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme, Text, Stack, Row } from '../../design-system';
import { isReducedMotionEnabled } from '../../design-system';
import type { QuickAction } from '../types';

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-chat',
    label: 'New Chat',
    description: 'Start a conversation with AI',
    icon: '💬',
    route: '/ai/chat',
    color: '#4F46E5',
  },
  {
    id: 'prompts',
    label: 'Prompt Library',
    description: 'Browse saved prompts',
    icon: '📚',
    route: '/ai/prompts',
    color: '#059669',
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    description: 'Search knowledge base',
    icon: '🧠',
    route: '/ai/knowledge',
    color: '#D97706',
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Manage your projects',
    icon: '📁',
    route: '/projects',
    color: '#2563EB',
  },
  {
    id: 'agents',
    label: 'Agents',
    description: 'Configure AI agents',
    icon: '🤖',
    route: '/ai',
    color: '#7C3AED',
  },
  {
    id: 'activity',
    label: 'Activity',
    description: 'View recent activity',
    icon: '📊',
    route: '/notifications',
    color: '#DC2626',
  },
];

interface AIQuickActionsProps {
  onAction?: (action: QuickAction) => void;
  disabled?: boolean;
}

function QuickActionCard({
  action,
  index,
  onPress,
  disabled,
}: {
  action: QuickAction;
  index: number;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const reducedMotion = isReducedMotionEnabled();

  const handlePressIn = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(0.95, { damping: 20, stiffness: 300 });
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

  return (
    <Animated.View
      entering={FadeInDown.duration(theme.duration.normal).delay(index * 50).springify()}
      style={[
        styles.cardWrapper,
        { width: index % 3 === 0 || index % 3 === 2 ? '31%' : '38%' },
      ]}
    >
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${action.label}: ${action.description}`}
        accessibilityState={{ disabled: !!disabled }}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border.default,
              borderRadius: theme.radius.md,
              opacity: disabled ? theme.opacity.disabled : 1,
            },
            animatedStyle,
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: `${action.color}15`,
                borderRadius: theme.radius.full,
              },
            ]}
          >
            <Text role="heading4">{action.icon}</Text>
          </View>
          <Stack spacing={2} style={{ marginTop: theme.spacing[2] }}>
            <Text role="label" numberOfLines={1}>
              {action.label}
            </Text>
            <Text role="caption" color={theme.colors.text.tertiary} numberOfLines={2}>
              {action.description}
            </Text>
          </Stack>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function AIQuickActions({ onAction, disabled }: AIQuickActionsProps) {
  const theme = useTheme();

  const handleAction = useCallback(
    (action: QuickAction) => {
      onAction?.(action);
    },
    [onAction],
  );

  return (
    <View
      style={[
        styles.section,
        { paddingHorizontal: theme.contentPadding.md },
      ]}
      accessibilityLabel="Quick actions"
    >
      <Row spacing={12} align="center" style={{ marginBottom: theme.spacing[3] }}>
        <Text role="heading4">Quick Actions</Text>
      </Row>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action, index) => (
          <QuickActionCard
            key={action.id}
            action={action}
            index={index}
            onPress={() => handleAction(action)}
            disabled={disabled}
          />
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
  cardWrapper: {
    marginBottom: 8,
  },
  card: {
    padding: 12,
    borderWidth: 1,
    minHeight: 120,
  },
  iconCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
