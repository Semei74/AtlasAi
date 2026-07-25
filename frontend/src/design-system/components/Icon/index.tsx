import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import type { BaseProps } from '../shared';

export interface IconProps extends BaseProps {
  name?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
} as const;

export type IconSizeName = keyof typeof ICON_SIZES;

export function Icon({
  size = ICON_SIZES.md,
  color,
  strokeWidth = 1.5,
  children,
  testID,
  ...accessibilityProps
}: IconProps & { children?: React.ReactNode }) {
  const theme = useTheme();
  const iconColor = color ?? theme.colors.text.secondary;
  const hitArea = size < 44 ? { padding: (44 - size) / 2 } : {};

  const containerStyle = useMemo(
    () => ({
      width: size,
      height: size,
      ...hitArea,
    }),
    [size, hitArea],
  );

  return (
    <View
      style={[styles.container, containerStyle]}
      testID={testID}
      accessibilityRole="image"
      {...accessibilityProps}
    >
      {children ?? (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 16v-4" />
          <Path d="M12 8h.01" />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
