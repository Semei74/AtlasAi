import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useSpacing } from '../../hooks/useSpacing';
import { useTypography } from '../../hooks/useTypography';
import type { BaseProps } from '../shared';

export interface EmptyStateProps extends BaseProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  testID,
  ...accessibilityProps
}: EmptyStateProps) {
  const theme = useTheme();
  const { colors } = theme;
  const spacing = useSpacing();
  const typography = useTypography();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: spacing.spacing[20],
          paddingBottom: spacing.spacing[20],
          paddingHorizontal: spacing.spacing[4],
        },
      ]}
      testID={testID}
      accessibilityRole="alert"
      {...accessibilityProps}
    >
      {icon && (
        <View style={{ marginBottom: spacing.spacing[6], opacity: 0.6 }}>
          {icon}
        </View>
      )}
      <Text
        style={{
          fontSize: typography.getRole('heading5').fontSize,
          fontWeight: theme.fontWeight.semiBold,
          color: colors.text.primary,
          textAlign: 'center',
          fontFamily: theme.fontFamily.inter,
          marginBottom: spacing.spacing[2],
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: typography.getRole('bodySmall').fontSize,
            fontWeight: theme.fontWeight.regular,
            color: colors.text.secondary,
            textAlign: 'center',
            fontFamily: theme.fontFamily.inter,
            lineHeight: 20,
            maxWidth: 360,
          }}
        >
          {description}
        </Text>
      )}
      {action && (
        <View style={{ marginTop: spacing.spacing[6] }}>
          {action}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
