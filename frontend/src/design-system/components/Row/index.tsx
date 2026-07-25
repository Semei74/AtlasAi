import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useSpacing } from '../../hooks/useSpacing';
import type { BaseProps } from '../shared';

export interface RowProps extends BaseProps {
  spacing?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  flex?: number;
  reverse?: boolean;
  children: React.ReactNode;
}

export function Row({
  spacing,
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  flex,
  reverse = false,
  children,
  testID,
  ...accessibilityProps
}: RowProps) {
  const space = useSpacing();
  const gap = spacing ?? space.spacing[3];

  const containerStyle = useMemo(
    () => ({
      flexDirection: reverse ? ('row-reverse' as const) : ('row' as const),
      gap,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap ? ('wrap' as const) : undefined,
      flex,
    }),
    [gap, align, justify, wrap, flex, reverse],
  );

  return (
    <View style={containerStyle} testID={testID} {...accessibilityProps}>
      {children}
    </View>
  );
}
