import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useSpacing } from '../../hooks/useSpacing';
import { useTypography } from '../../hooks/useTypography';
import { Button } from '../Button';
import type { BaseProps } from '../shared';

export interface ErrorStateProps extends BaseProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  errorId?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  retryLabel?: string;
  supportLabel?: string;
}

export function ErrorState({
  icon,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again or contact support.',
  errorId,
  onRetry,
  onContactSupport,
  retryLabel = 'Try Again',
  supportLabel = 'Contact Support',
  testID,
  ...accessibilityProps
}: ErrorStateProps) {
  const theme = useTheme();
  const { colors } = theme;
  const spacing = useSpacing();
  const typography = useTypography();

  return (
    <View
      style={[
        styles.container,
        { padding: spacing.spacing[8] },
      ]}
      testID={testID}
      accessibilityRole="alert"
      {...accessibilityProps}
    >
      {icon && (
        <View style={{ marginBottom: spacing.spacing[4] }}>
          {icon}
        </View>
      )}
      <Text
        style={{
          fontSize: typography.getRole('heading6').fontSize,
          fontWeight: theme.fontWeight.semiBold,
          color: colors.text.primary,
          textAlign: 'center',
          fontFamily: theme.fontFamily.inter,
          marginBottom: spacing.spacing[2],
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: typography.getRole('bodySmall').fontSize,
          fontWeight: theme.fontWeight.regular,
          color: colors.text.secondary,
          textAlign: 'center',
          fontFamily: theme.fontFamily.inter,
          lineHeight: 20,
          marginBottom: spacing.spacing[6],
        }}
      >
        {description}
      </Text>
      <View style={styles.actions}>
        {onRetry && (
          <Button variant="primary" size="md" onPress={onRetry}>
            {retryLabel}
          </Button>
        )}
        {onContactSupport && (
          <Button variant="ghost" size="md" onPress={onContactSupport}>
            {supportLabel}
          </Button>
        )}
      </View>
      {errorId && (
        <Text
          style={{
            marginTop: spacing.spacing[4],
            fontSize: 12,
            fontWeight: theme.fontWeight.regular,
            color: colors.text.tertiary,
            fontFamily: theme.fontFamily.inter,
          }}
        >
          Error ID: {errorId}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
});
