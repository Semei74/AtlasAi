import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useSpacing } from '../../hooks/useSpacing';
import type { BaseProps } from '../shared';

export interface ColumnProps extends BaseProps {
  spacing?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  flex?: number;
  reverse?: boolean;
  children: React.ReactNode;
}

export function Column({
  spacing,
  align = 'stretch',
  justify = 'flex-start',
  flex,
  reverse = false,
  children,
  testID,
  ...accessibilityProps
}: ColumnProps) {
  const space = useSpacing();
  const gap = spacing ?? space.spacing[3];

  const containerStyle = useMemo(
    () => ({
      flexDirection: reverse ? ('column-reverse' as const) : ('column' as const),
      gap,
      alignItems: align,
      justifyContent: justify,
      flex,
    }),
    [gap, align, justify, flex, reverse],
  );

  return (
    <View style={containerStyle} testID={testID} {...accessibilityProps}>
      {children}
    </View>
  );
}
