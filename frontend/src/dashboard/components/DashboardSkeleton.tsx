import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
  useEffect,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { isReducedMotionEnabled } from '../../design-system';

interface SkeletonBlockProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

function SkeletonBlock({ width = '100%', height = 14, borderRadius = 4 }: SkeletonBlockProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);
  const reducedMotion = isReducedMotionEnabled();

  useEffect(() => {
    if (!reducedMotion) {
      opacity.value = withRepeat(
        withTiming(0.7, { duration: 1000, easing: Easing.ease }),
        -1,
        true,
      );
    }
    return () => cancelAnimation(opacity);
  }, [reducedMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.colors.neutral[200],
        },
        animatedStyle,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  const theme = useTheme();

  return (
    <View style={{ padding: 16 }}>
      <SkeletonBlock width={200} height={24} />
      <View style={{ height: 8 }} />
      <SkeletonBlock width={140} height={14} />
      <View style={{ height: 24 }} />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[1, 2].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
            }}
          >
            <SkeletonBlock width={40} height={40} borderRadius={20} />
            <View style={{ height: 8 }} />
            <SkeletonBlock width="70%" height={14} />
            <View style={{ height: 4 }} />
            <SkeletonBlock width="50%" height={12} />
          </View>
        ))}
      </View>

      <View style={{ height: 24 }} />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
            }}
          >
            <SkeletonBlock width={24} height={24} borderRadius={12} />
            <View style={{ height: 8 }} />
            <SkeletonBlock width="60%" height={14} />
            <View style={{ height: 4 }} />
            <SkeletonBlock width="40%" height={12} />
          </View>
        ))}
      </View>

      <View style={{ height: 24 }} />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[1, 2].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
            }}
          >
            <SkeletonBlock width="80%" height={24} />
            <View style={{ height: 8 }} />
            <SkeletonBlock width="60%" height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}
