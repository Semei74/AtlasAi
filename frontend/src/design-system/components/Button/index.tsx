import { useCallback, useMemo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { isReducedMotionEnabled } from '../../hooks/useReducedMotion';
import { Loader } from '../Loader';
import type { ButtonProps, ButtonVariant, ButtonSize } from './types';
import { BUTTON_SIZES } from './types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getButtonColors(variant: ButtonVariant, theme: ReturnType<typeof useTheme>) {
  const { colors } = theme;
  switch (variant) {
    case 'primary':
      return {
        bg: colors.primary[500],
        text: colors.text.onPrimary,
        hoverBg: colors.primary[600],
        activeBg: colors.primary[700],
        border: 'transparent',
      };
    case 'secondary':
      return {
        bg: 'transparent',
        text: colors.text.primary,
        hoverBg: colors.neutral[50],
        activeBg: colors.neutral[100],
        border: colors.neutral[300],
      };
    case 'outline':
      return {
        bg: 'transparent',
        text: colors.primary[500],
        hoverBg: colors.primary[50],
        activeBg: colors.primary[100],
        border: colors.primary[500],
      };
    case 'ghost':
      return {
        bg: 'transparent',
        text: colors.text.secondary,
        hoverBg: colors.neutral[100],
        activeBg: colors.neutral[200],
        border: 'transparent',
      };
    case 'danger':
      return {
        bg: colors.error.default,
        text: '#FFFFFF',
        hoverBg: colors.error.border,
        activeBg: '#991B1B',
        border: 'transparent',
      };
    default:
      return getButtonColors('primary', theme);
  }
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onPress,
  children,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const { colors, radius, opacity: opacityTokens, duration } = theme;
  const sizes = BUTTON_SIZES[size];
  const btnColors = getButtonColors(variant, theme);
  const reducedMotion = isReducedMotionEnabled();

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
    }
  }, [reducedMotion, scale]);

  const handlePressOut = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    }
  }, [reducedMotion, scale]);

  const containerStyle = useMemo(
    () => ({
      height: sizes.height,
      paddingHorizontal: sizes.paddingH,
      backgroundColor: btnColors.bg,
      borderWidth: variant === 'secondary' || variant === 'outline' ? 1 : 0,
      borderColor: btnColors.border,
      borderRadius: radius.md,
      opacity: disabled ? opacityTokens.disabled : 1,
      width: fullWidth ? '100%' : undefined,
      alignSelf: fullWidth ? 'stretch' : undefined,
    }),
    [sizes, btnColors, radius.md, opacityTokens.disabled, disabled, fullWidth, variant],
  );

  const textColor = useMemo(
    () => ({
      color: disabled ? colors.text.disabled : btnColors.text,
      fontSize: sizes.fontSize,
      fontFamily: theme.fontFamily.inter,
      fontWeight: theme.fontWeight.semiBold,
      lineHeight: sizes.height,
    }),
    [disabled, btnColors.text, colors.text.disabled, sizes, theme.fontFamily.inter, theme.fontWeight.semiBold, sizes.height],
  );

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[styles.container, containerStyle, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    >
      {loading ? (
        <Loader size={sizes.iconSize} color={btnColors.text} />
      ) : (
        <View style={[styles.content, { gap: sizes.iconGap }]}>
          {icon && iconPosition === 'left' && icon}
          {children ? (
            <Text style={textStyle}>{children}</Text>
          ) : null}
          {icon && iconPosition === 'right' && icon}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
