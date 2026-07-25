import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { BaseProps } from '../shared';

export interface DividerProps extends BaseProps {
  variant?: 'horizontal' | 'vertical';
  label?: string;
  thickness?: number;
  color?: string;
}

export function Divider({
  variant = 'horizontal',
  label,
  thickness = 1,
  color,
  testID,
  ...accessibilityProps
}: DividerProps) {
  const theme = useTheme();
  const { colors } = theme;
  const dividerColor = color ?? colors.neutral[200];

  if (variant === 'vertical') {
    return (
      <View
        style={{
          width: thickness,
          height: '100%',
          backgroundColor: dividerColor,
        }}
        testID={testID}
        {...accessibilityProps}
      />
    );
  }

  if (label) {
    return (
      <View style={styles.withLabel} testID={testID} {...accessibilityProps}>
        <View style={[styles.line, { flex: 1, height: thickness, backgroundColor: dividerColor }]} />
        <Text
          style={{
            marginHorizontal: 24,
            fontSize: 12,
            fontWeight: theme.fontWeight.medium,
            color: colors.text.secondary,
          }}
        >
          {label}
        </Text>
        <View style={[styles.line, { flex: 1, height: thickness, backgroundColor: dividerColor }]} />
      </View>
    );
  }

  return (
    <View
      style={{
        height: thickness,
        width: '100%',
        backgroundColor: dividerColor,
      }}
      testID={testID}
      {...accessibilityProps}
    />
  );
}

const styles = StyleSheet.create({
  withLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  line: {},
});
