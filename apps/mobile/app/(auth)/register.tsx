import { ReactElement, useCallback } from 'react';
import { router } from 'expo-router';
import { RegisterScreen } from '../../../../frontend/src/auth/screens';

export default function RegisterRoute(): ReactElement {
  const handleNavigateLogin = useCallback(() => {
    router.back();
  }, []);

  const handleSuccess = useCallback(() => {
    router.replace('/');
  }, []);

  return (
    <RegisterScreen
      onNavigateLogin={handleNavigateLogin}
      onSuccess={handleSuccess}
    />
  );
}
