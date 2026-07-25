import { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  FadeIn,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { isReducedMotionEnabled } from '../../hooks/useReducedMotion';
import type { BaseProps } from '../shared';

export interface LoaderProps extends BaseProps {
  size?: number;
  color?: string;
  trackColor?: string;
  strokeWidth?: number;
}

export const LOADER_SIZES = [16, 20, 24, 32, 40, 48] as const;

export function Loader({
  size = 24,
  color,
  trackColor,
  strokeWidth,
  testID,
  ...accessibilityProps
}: LoaderProps) {
  const theme = useTheme();
  const { colors } = theme;
  const spinnerColor = color ?? colors.primary[500];
  const track = trackColor ?? colors.neutral[300];
  const sw = strokeWidth ?? Math.max(2, Math.round(size / 12));
  const reducedMotion = isReducedMotionEnabled();

  const rotation = useSharedValue(reducedMotion ? 360 : 0);

  useEffect(() => {
    if (!reducedMotion) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 800,
          easing: Easing.linear,
        }),
        -1,
      );
    }
    return () => cancelAnimation(rotation);
  }, [reducedMotion, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const spinnerSize = useMemo(
    () => ({
      width: size,
      height: size,
    }),
    [size],
  );

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      style={[styles.container, spinnerSize, animatedStyle]}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      {...accessibilityProps}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: sw,
          borderColor: track,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: sw,
          borderColor: 'transparent',
          borderTopColor: spinnerColor,
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
