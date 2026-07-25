import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useSpacing } from '../../hooks/useSpacing';
import { useTypography } from '../../hooks/useTypography';
import type { BaseProps } from '../shared';

export interface SectionProps extends BaseProps {
  title?: string;
  description?: string;
  padding?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function Section({
  title,
  description,
  padding,
  children,
  action,
  testID,
  ...accessibilityProps
}: SectionProps) {
  const theme = useTheme();
  const { colors } = theme;
  const space = useSpacing();
  const typo = useTypography();

  const paddingVal = padding ?? space.spacing[4];

  return (
    <View style={{ padding: paddingVal }} testID={testID} {...accessibilityProps}>
      {(title || action) && (
        <View style={[styles.header, { marginBottom: space.spacing[4] }]}>
          <View style={{ flex: 1 }}>
            {title && (
              <Text
                style={{
                  fontSize: typo.getRole('heading6').fontSize,
                  fontWeight: theme.fontWeight.semiBold,
                  color: colors.text.primary,
                  fontFamily: theme.fontFamily.inter,
                }}
              >
                {title}
              </Text>
            )}
            {description && (
              <Text
                style={{
                  fontSize: typo.getRole('caption').fontSize,
                  color: colors.text.secondary,
                  marginTop: space.spacing[1],
                  fontFamily: theme.fontFamily.inter,
                }}
              >
                {description}
              </Text>
            )}
          </View>
          {action && <View style={{ marginLeft: space.spacing[4] }}>{action}</View>}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
});
