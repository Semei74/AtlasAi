import { View, StyleSheet } from 'react-native';
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

interface SkeletonLineProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

function SkeletonLine({ width = '100%', height = 14, borderRadius = 4 }: SkeletonLineProps) {
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

interface SkeletonCardProps {
  lines?: number;
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <View style={styles.card}>
      <SkeletonLine width="40%" height={14} />
      <View style={{ height: 8 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={{ marginBottom: 6 }}>
          <SkeletonLine
            width={i === lines - 1 ? '60%' : '100%'}
            height={12}
          />
        </View>
      ))}
    </View>
  );
}

interface SkeletonListProps {
  count?: number;
}

export function SkeletonList({ count = 5 }: SkeletonListProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.row}>
          <SkeletonLine width={40} height={40} borderRadius={20} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonLine width="60%" height={14} />
            <View style={{ height: 6 }} />
            <SkeletonLine width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

export { SkeletonLine };
export type { SkeletonLineProps };

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  list: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
});
