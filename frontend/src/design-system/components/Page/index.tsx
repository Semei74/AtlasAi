import { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useSpacing } from '../../hooks/useSpacing';
import type { BaseProps } from '../shared';

export interface PageProps extends BaseProps {
  scroll?: boolean;
  flex?: number;
  safeArea?: boolean;
  bg?: string;
  children: React.ReactNode;
}

export function Page({
  scroll = false,
  flex = 1,
  safeArea = true,
  bg,
  children,
  testID,
  ...accessibilityProps
}: PageProps) {
  const theme = useTheme();
  const backgroundColor = bg ?? theme.colors.bg.primary;

  const contentStyle = useMemo(
    () => ({
      flex,
      backgroundColor,
    }),
    [flex, backgroundColor],
  );

  if (safeArea) {
    return (
      <SafeAreaView style={contentStyle} testID={testID} {...accessibilityProps}>
        {scroll ? (
          <ScrollView
            style={contentStyle}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </SafeAreaView>
    );
  }

  return (
    <View style={contentStyle} testID={testID} {...accessibilityProps}>
      {scroll ? (
        <ScrollView
          style={contentStyle}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );
}
