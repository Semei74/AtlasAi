import { ReactElement, useCallback } from 'react';
import { router } from 'expo-router';
import { LoginScreen } from '../../../../frontend/src/auth/screens';

export default function LoginRoute(): ReactElement {
  const handleNavigateRegister = useCallback(() => {
    router.push('/(auth)/register');
  }, []);

  const handleNavigateForgotPassword = useCallback(() => {
    router.push('/(auth)/forgot-password');
  }, []);

  const handleSuccess = useCallback(() => {
    // Reset navigation stack: replace root, index.tsx will redirect to tabs
    router.replace('/');
  }, []);

  return (
    <LoginScreen
      onNavigateRegister={handleNavigateRegister}
      onNavigateForgotPassword={handleNavigateForgotPassword}
      onSuccess={handleSuccess}
    />
  );
}
