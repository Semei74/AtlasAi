import { ReactElement } from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../../frontend/src/design-system';

export default function SettingsLayout(): ReactElement {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.bg.primary },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="security" />
    </Stack>
  );
}
