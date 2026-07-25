import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme, Text, Stack, Row, Badge } from '../../design-system';
import { useAuth } from '../../auth/auth-context';
import type { Greeting } from '../types';

function getGreeting(): Greeting {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good morning', emoji: '🌅' };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon', emoji: '☀️' };
  if (hour >= 17 && hour < 22) return { text: 'Good evening', emoji: '🌆' };
  return { text: 'Good night', emoji: '🌙' };
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface WelcomeBlockProps {
  workspaceName?: string | null;
}

export function WelcomeBlock({ workspaceName }: WelcomeBlockProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const greeting = useMemo(() => getGreeting(), []);
  const todayDate = useMemo(() => formatDate(), []);
  const displayName = user?.displayName ?? 'there';

  return (
    <Animated.View
      entering={FadeInDown.duration(theme.duration.normal).springify()}
      style={[
        styles.container,
        {
          paddingHorizontal: theme.contentPadding.md,
          paddingVertical: theme.spacing[4],
          backgroundColor: theme.colors.bg.primary,
        },
      ]}
      accessibilityLabel={`${greeting.text}, ${displayName}. ${todayDate}`}
    >
      <Stack spacing={4}>
        <Text role="heading2" numberOfLines={1}>
          {greeting.text}, {displayName}
        </Text>
        <Row spacing={8} align="center">
          <Text role="bodySmall" color={theme.colors.text.secondary}>
            {todayDate}
          </Text>
          {workspaceName && (
            <>
              <View
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: theme.colors.text.tertiary,
                }}
              />
              <Badge color="info" size="sm" label={workspaceName} />
            </>
          )}
        </Row>
      </Stack>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
});
