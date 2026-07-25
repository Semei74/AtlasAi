import { useMemo, useState, useCallback } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useSpacing } from '../../hooks/useSpacing';
import { useTypography } from '../../hooks/useTypography';
import { Loader } from '../Loader';
import type { InputProps, InputSize, InputState, InputVariant } from './types';
import { INPUT_SIZES } from './types';

function getInputBorderColors(
  state: InputState,
  colors: ReturnType<typeof useTheme>['colors'],
) {
  switch (state) {
    case 'error':
      return { border: colors.border.error, focus: colors.error.default, ring: `${colors.error.default}33` };
    case 'success':
      return { border: colors.border.success, focus: colors.success.default, ring: `${colors.success.default}33` };
    case 'disabled':
      return { border: colors.border.disabled, focus: colors.border.disabled, ring: 'transparent' };
    case 'readonly':
      return { border: colors.neutral[200], focus: colors.neutral[200], ring: 'transparent' };
    default:
      return { border: colors.border.default, focus: colors.border.focus, ring: `${colors.border.focus}33` };
  }
}

export function Input({
  variant = 'outlined',
  size = 'md',
  type = 'text',
  state = 'default',
  label,
  placeholder,
  value,
  onChangeText,
  errorMessage,
  helperText,
  leftIcon,
  rightIcon,
  onBlur,
  onFocus,
  secureTextEntry,
  multiline = false,
  numberOfLines = 3,
  maxLength,
  autoComplete,
  keyboardType,
  textContentType,
  returnKeyType,
  onSubmitEditing,
  testID,
  ...accessibilityProps
}: InputProps) {
  const theme = useTheme();
  const { colors, radius } = theme;
  const spacing = useSpacing();
  const typography = useTypography();
  const sizes = INPUT_SIZES[size];
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColors = getInputBorderColors(state, colors);
  const isDisabled = state === 'disabled';
  const isReadonly = state === 'readonly';
  const isMultiline = type === 'multiline' || multiline;
  const isPassword = type === 'password' || secureTextEntry;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const containerStyle = useMemo(() => {
    const borderColor = isFocused ? borderColors.focus : borderColors.border;
    return {
      flexDirection: 'row' as const,
      alignItems: isMultiline ? 'flex-start' : 'center',
      height: isMultiline ? undefined : sizes.height,
      minHeight: isMultiline ? sizes.height * numberOfLines : sizes.height,
      paddingHorizontal: sizes.paddingH,
      paddingVertical: isMultiline ? spacing.spacing[3] : 0,
      backgroundColor: state === 'readonly' || variant === 'filled' ? colors.neutral[100] : colors.bg.primary,
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: variant === 'outlined' ? borderColor : 'transparent',
      borderRadius: radius.md,
      opacity: isDisabled ? theme.opacity.disabled : 1,
      borderBottomWidth: variant === 'filled' ? 2 : variant === 'outlined' ? 1 : 0,
      borderBottomColor: variant === 'filled' ? borderColor : undefined,
    };
  }, [isFocused, borderColors, sizes, isMultiline, numberOfLines, spacing, state, variant, colors, radius.md, isDisabled, theme.opacity.disabled]);

  const inputStyle = useMemo(
    () => ({
      flex: 1,
      fontSize: sizes.fontSize,
      fontFamily: theme.fontFamily.inter,
      fontWeight: theme.fontWeight.regular,
      color: isDisabled ? colors.text.disabled : colors.text.primary,
      lineHeight: sizes.fontSize * 1.5,
      padding: 0,
      margin: 0,
    }),
    [sizes, theme.fontFamily.inter, theme.fontWeight.regular, isDisabled, colors.text],
  );

  const renderLabel = () => {
    if (!label) return null;
    return (
      <Text
        style={{
          fontSize: typography.getRole('label').fontSize,
          fontWeight: theme.fontWeight.medium,
          color: colors.text.secondary,
          marginBottom: spacing.spacing[1],
          fontFamily: theme.fontFamily.inter,
        }}
      >
        {label}
      </Text>
    );
  };

  const renderHelperOrError = () => {
    if (state === 'error' && errorMessage) {
      return (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <Text
            style={{
              fontSize: 12,
              color: colors.text.error,
              marginTop: spacing.spacing[0_5],
              fontFamily: theme.fontFamily.inter,
            }}
            accessibilityRole="alert"
          >
            {errorMessage}
          </Text>
        </Animated.View>
      );
    }
    if (helperText) {
      return (
        <Text
          style={{
            fontSize: 12,
            color: colors.text.tertiary,
            marginTop: spacing.spacing[0_5],
            fontFamily: theme.fontFamily.inter,
          }}
        >
          {helperText}
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={styles.wrapper} testID={testID}>
      {renderLabel()}
      <View style={containerStyle}>
        {leftIcon && (
          <View style={{ marginRight: spacing.spacing[2], opacity: isDisabled ? theme.opacity.disabled : 1 }}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={inputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!isDisabled && !isReadonly}
          secureTextEntry={isPassword && !showPassword}
          multiline={isMultiline}
          numberOfLines={isMultiline ? numberOfLines : undefined}
          maxLength={maxLength}
          autoComplete={autoComplete}
          keyboardType={type === 'phone' ? 'phone-pad' : type === 'search' ? 'web-search' : keyboardType}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={label ?? placeholder}
          accessibilityState={{ disabled: isDisabled }}
        />
        {rightIcon && !isPassword && (
          <View style={{ marginLeft: spacing.spacing[2] }}>
            {rightIcon}
          </View>
        )}
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((p) => !p)}
            hitSlop={8}
            style={{ marginLeft: spacing.spacing[2], padding: spacing.spacing[1] }}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 14, color: colors.text.secondary }}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        )}
      </View>
      {renderHelperOrError()}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
});
