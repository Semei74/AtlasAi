import { ReactElement } from 'react';
import { Stack, Redirect } from 'expo-router';
import { useTheme } from '../../../../frontend/src/design-system';
import { useAuth } from '../../../../frontend/src/auth';

export default function AuthLayout(): ReactElement {
  const theme = useTheme();
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) return null;
  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.bg.primary },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}
