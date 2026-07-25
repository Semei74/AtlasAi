import { ReactElement } from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../../frontend/src/design-system';

export default function ModalsLayout(): ReactElement {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
        contentStyle: { backgroundColor: theme.colors.bg.primary },
      }}
    >
      <Stack.Screen name="command-palette" />
      <Stack.Screen name="qr-scanner" />
      <Stack.Screen name="app-update" />
    </Stack>
  );
}
