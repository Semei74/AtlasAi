import { ReactElement, useCallback } from 'react';
import { router } from 'expo-router';
import { ForgotPasswordScreen } from '../../../../frontend/src/auth/screens';

export default function ForgotPasswordRoute(): ReactElement {
  const handleBackToLogin = useCallback(() => {
    router.back();
  }, []);

  return <ForgotPasswordScreen onBackToLogin={handleBackToLogin} />;
}
