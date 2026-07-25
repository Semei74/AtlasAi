import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useSpacing } from '../../hooks/useSpacing';
import { isDesktop, isTablet } from '../../theme/breakpoints';
import { layout } from '../../theme/spacing';
import type { BaseProps } from '../shared';

export interface ContainerProps extends BaseProps {
  flex?: number;
  center?: boolean;
  maxWidth?: number;
  children: React.ReactNode;
}

export function Container({
  flex = 1,
  center = false,
  maxWidth,
  children,
  testID,
  ...accessibilityProps
}: ContainerProps) {
  const { width } = useWindowDimensions();
  const space = useSpacing();
  const desktop = isDesktop(width);
  const tablet = isTablet(width);

  const padding = useMemo(() => {
    if (desktop) return space.spacing[8];
    if (tablet) return space.spacing[6];
    return space.spacing[4];
  }, [desktop, tablet, space]);

  const containerStyle = useMemo(
    () => ({
      flex,
      paddingHorizontal: padding,
      paddingVertical: padding,
      alignSelf: center ? ('center' as const) : undefined,
      width: '100%' as const,
      maxWidth: maxWidth ?? (desktop ? layout.contentMaxWidth : undefined),
    }),
    [flex, padding, center, maxWidth, desktop],
  );

  return (
    <View style={containerStyle} testID={testID} {...accessibilityProps}>
      {children}
    </View>
  );
}
