import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useSpacing } from '../../hooks/useSpacing';
import type { BaseProps } from '../shared';

export interface StackProps extends BaseProps {
  spacing?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  flex?: number;
  children: React.ReactNode;
}

export function Stack({
  spacing,
  align = 'stretch',
  justify = 'flex-start',
  wrap = false,
  flex,
  children,
  testID,
  ...accessibilityProps
}: StackProps) {
  const space = useSpacing();
  const gap = spacing ?? space.spacing[4];

  const containerStyle = useMemo(
    () => ({
      gap,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap ? ('wrap' as const) : undefined,
      flex,
    }),
    [gap, align, justify, wrap, flex],
  );

  return (
    <View style={containerStyle} testID={testID} {...accessibilityProps}>
      {children}
    </View>
  );
}
