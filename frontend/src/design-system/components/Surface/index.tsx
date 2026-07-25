import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useSpacing } from '../../hooks/useSpacing';
import type { BaseProps } from '../shared';

export interface SurfaceProps extends BaseProps {
  variant?: 'default' | 'elevated' | 'active' | 'hover';
  padding?: number;
  flex?: number;
  children: React.ReactNode;
}

export function Surface({
  variant = 'default',
  padding,
  flex,
  children,
  testID,
  ...accessibilityProps
}: SurfaceProps) {
  const theme = useTheme();
  const { colors, radius } = theme;
  const space = useSpacing();

  const surfacePadding = padding ?? space.spacing[4];

  const bgColor = useMemo(() => {
    switch (variant) {
      case 'elevated':
        return colors.surfaceElevated;
      case 'active':
        return colors.surfaceActive;
      case 'hover':
        return colors.surfaceHover;
      default:
        return colors.surface;
    }
  }, [variant, colors]);

  const surfaceStyle = useMemo(
    () => ({
      backgroundColor: bgColor,
      borderRadius: radius.md,
      padding: surfacePadding,
      flex,
    }),
    [bgColor, radius.md, surfacePadding, flex],
  );

  return (
    <View style={surfaceStyle} testID={testID} {...accessibilityProps}>
      {children}
    </View>
  );
}
