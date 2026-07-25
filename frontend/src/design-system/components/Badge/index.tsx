import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { BaseProps } from '../shared';

export type BadgeColor = 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends BaseProps {
  color?: BadgeColor;
  size?: BadgeSize;
  label?: string;
  dot?: boolean;
  count?: number;
  maxCount?: number;
}

const BADGE_SIZES: Record<BadgeSize, { height: number; fontSize: number; paddingH: number }> = {
  sm: { height: 18, fontSize: 11, paddingH: 6 },
  md: { height: 20, fontSize: 12, paddingH: 8 },
  lg: { height: 24, fontSize: 14, paddingH: 10 },
};

function getBadgeColors(color: BadgeColor, colors: ReturnType<typeof useTheme>['colors']) {
  switch (color) {
    case 'success':
      return { bg: colors.success.default, text: '#FFFFFF' };
    case 'warning':
      return { bg: colors.warning.default, text: '#FFFFFF' };
    case 'error':
      return { bg: colors.error.default, text: '#FFFFFF' };
    case 'info':
      return { bg: colors.info.default, text: '#FFFFFF' };
    case 'neutral':
      return { bg: colors.neutral[500], text: '#FFFFFF' };
    case 'outline':
      return { bg: 'transparent', text: colors.text.secondary, border: colors.neutral[300] };
    default:
      return { bg: colors.primary[500], text: '#FFFFFF' };
  }
}

export function Badge({
  color = 'default',
  size = 'md',
  label,
  dot = false,
  count,
  maxCount = 99,
  testID,
  ...accessibilityProps
}: BadgeProps) {
  const theme = useTheme();
  const { colors, radius } = theme;
  const sizes = BADGE_SIZES[size];
  const badgeColors = getBadgeColors(color, colors);
  const isOutline = color === 'outline';

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: badgeColors.bg,
          },
        ]}
        testID={testID}
        {...accessibilityProps}
      />
    );
  }

  const displayLabel = count !== undefined
    ? (count > maxCount ? `+${maxCount}` : `${count}`)
    : label;

  if (!displayLabel) return null;

  const containerStyle = useMemo(
    () => ({
      height: sizes.height,
      paddingHorizontal: sizes.paddingH,
      backgroundColor: badgeColors.bg,
      borderRadius: sizes.height / 2,
      borderWidth: isOutline ? 1 : 0,
      borderColor: isOutline ? (badgeColors as any).border : undefined,
    }),
    [sizes, badgeColors, isOutline],
  );

  return (
    <View style={[styles.container, containerStyle]} testID={testID} {...accessibilityProps}>
      <Text
        style={{
          fontSize: sizes.fontSize,
          fontWeight: theme.fontWeight.semiBold,
          color: badgeColors.text,
          fontFamily: theme.fontFamily.inter,
        }}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {},
});
