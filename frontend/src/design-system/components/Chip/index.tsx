import { useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import type { BaseProps } from '../shared';

export type ChipColor = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline';

export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps extends BaseProps {
  color?: ChipColor;
  size?: ChipSize;
  label: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  onPress?: () => void;
  icon?: React.ReactNode;
}

const CHIP_SIZES: Record<ChipSize, { height: number; fontSize: number; paddingH: number; iconSize: number }> = {
  sm: { height: 20, fontSize: 11, paddingH: 6, iconSize: 12 },
  md: { height: 24, fontSize: 12, paddingH: 8, iconSize: 14 },
  lg: { height: 28, fontSize: 13, paddingH: 10, iconSize: 16 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getChipColors(color: ChipColor, colors: ReturnType<typeof useTheme>['colors']) {
  switch (color) {
    case 'primary':
      return { bg: colors.primary[50], text: colors.primary[700], border: colors.primary[200] };
    case 'success':
      return { bg: colors.success.bg, text: colors.success.text, border: colors.success.border };
    case 'warning':
      return { bg: colors.warning.bg, text: colors.warning.text, border: colors.warning.border };
    case 'error':
      return { bg: colors.error.bg, text: colors.error.text, border: colors.error.border };
    case 'info':
      return { bg: colors.info.bg, text: colors.info.text, border: colors.info.border };
    case 'outline':
      return { bg: 'transparent', text: colors.text.secondary, border: colors.neutral[300] };
    default:
      return { bg: colors.neutral[100], text: colors.text.primary, border: 'transparent' };
  }
}

export function Chip({
  color = 'default',
  size = 'md',
  label,
  dismissible = false,
  onDismiss,
  onPress,
  icon,
  testID,
  ...accessibilityProps
}: ChipProps) {
  const theme = useTheme();
  const { colors, radius } = theme;
  const sizes = CHIP_SIZES[size];
  const chipColors = getChipColors(color, colors);

  const containerStyle = useMemo(
    () => ({
      height: sizes.height,
      paddingHorizontal: sizes.paddingH,
      backgroundColor: chipColors.bg,
      borderRadius: radius.full,
      borderWidth: color === 'outline' ? 1 : 0,
      borderColor: color === 'outline' ? colors.neutral[300] : chipColors.border,
      gap: 4,
    }),
    [sizes, chipColors, radius.full, color, colors.neutral],
  );

  const labelStyle = useMemo(
    () => ({
      fontSize: sizes.fontSize,
      fontWeight: theme.fontWeight.medium,
      color: chipColors.text,
      fontFamily: theme.fontFamily.inter,
    }),
    [sizes, theme.fontWeight.medium, chipColors.text, theme.fontFamily.inter],
  );

  const content = (
    <View style={[styles.container, containerStyle]}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={labelStyle}>{label}</Text>
      {dismissible && (
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          accessibilityLabel={`Remove ${label}`}
          accessibilityRole="button"
        >
          <Text style={[labelStyle, { fontSize: sizes.iconSize }]}>×</Text>
        </Pressable>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} testID={testID} {...accessibilityProps}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={styles.wrapper} testID={testID} {...accessibilityProps}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    marginRight: 2,
  },
});
