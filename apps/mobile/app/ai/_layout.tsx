import { ReactElement } from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../../frontend/src/design-system';
import { ChatProvider } from '../../../../frontend/src/ai';

export default function AILayout(): ReactElement {
  const theme = useTheme();

  return (
    <ChatProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.colors.bg.primary },
        }}
      >
        <Stack.Screen name="chat" />
        <Stack.Screen name="prompts" />
        <Stack.Screen name="knowledge" />
      </Stack>
    </ChatProvider>
  );
}
