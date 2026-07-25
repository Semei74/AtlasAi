import { useState, useCallback } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme, Text } from '../../design-system';
import { isReducedMotionEnabled } from '../../design-system';

interface FABAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  mainIcon?: string;
  onVisibilityChange?: (visible: boolean) => void;
}

const ACTION_SIZE = 48;
const FAB_SIZE = 56;
const ACTION_GAP = 12;

export function FloatingActionButton({
  actions,
  mainIcon = '+',
  onVisibilityChange,
}: FloatingActionButtonProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const reducedMotion = isReducedMotionEnabled();

  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  const fabScale = useSharedValue(1);

  const toggleMenu = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);

    if (reducedMotion) {
      rotation.value = withTiming(next ? 45 : 0, { duration: 100 });
      scale.value = withTiming(next ? 1 : 0, { duration: 100 });
    } else {
      rotation.value = withSpring(next ? 45 : 0, {
        damping: 14,
        stiffness: 200,
        mass: 0.5,
      });

      if (next) {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      } else {
        scale.value = withTiming(0, { duration: 150 });
      }

      fabScale.value = withSequence(
        withTiming(0.9, { duration: 50 }),
        withSpring(1, { damping: 12, stiffness: 200 }),
      );
    }

    onVisibilityChange?.(next);
  }, [isOpen, reducedMotion, rotation, scale, fabScale, onVisibilityChange]);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      toggleMenu();
    })
    .runOnJS(true);

  const composedGesture = Gesture.Exclusive(tapGesture);

  const actionAnimatedStyle = (index: number) =>
    useAnimatedStyle(() => ({
      opacity: interpolate(
        scale.value,
        [0, 0.5, 1],
        [0, 0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            scale.value,
            [0, 1],
            [40, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }));

  return (
    <View
      style={styles.container}
      pointerEvents="box-none"
      accessibilityLabel="Floating action menu"
      accessibilityRole="menu"
    >
      {isOpen && (
        <Pressable
          style={styles.overlay}
          onPress={toggleMenu}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
        />
      )}

      {isOpen && (
        <Animated.View
          entering={reducedMotion ? undefined : FadeIn.duration(200)}
          exiting={reducedMotion ? undefined : FadeOut.duration(150)}
          style={styles.actionsContainer}
        >
          {actions.map((action, index) => {
            const AnimatedAction = ({ item }: { item: FABAction }) => (
              <Animated.View
                key={item.id}
                style={[styles.actionItem, actionAnimatedStyle(index)]}
              >
                <Pressable
                  onPress={() => {
                    item.onPress();
                    toggleMenu();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  hitSlop={8}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: item.color,
                      borderRadius: theme.radius.full,
                      width: ACTION_SIZE,
                      height: ACTION_SIZE,
                    },
                  ]}
                >
                  <Text
                    role="body"
                    color="#FFFFFF"
                    style={{ textAlign: 'center' }}
                  >
                    {item.icon}
                  </Text>
                </Pressable>
                <View
                  style={[
                    styles.actionLabel,
                    {
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                >
                  <Text
                    role="caption"
                    color={theme.colors.text.primary}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </View>
              </Animated.View>
            );

            return <AnimatedAction key={action.id} item={action} />;
          })}
        </Animated.View>
      )}

      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.fab,
            {
              width: FAB_SIZE,
              height: FAB_SIZE,
              borderRadius: FAB_SIZE / 2,
              backgroundColor: theme.colors.primary[500],
              shadowColor: theme.colors.primary[500],
            },
            fabAnimatedStyle,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isOpen ? 'Close quick actions' : 'Open quick actions'}
          accessibilityState={{ expanded: isOpen }}
        >
          <Animated.View style={iconAnimatedStyle}>
            <Text
              role="heading4"
              color="#FFFFFF"
              style={{ textAlign: 'center', lineHeight: FAB_SIZE }}
            >
              {mainIcon}
            </Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    top: -2000,
    left: -2000,
    right: -2000,
    bottom: -200,
  },
  actionsContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
    gap: ACTION_GAP,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
