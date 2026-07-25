import { ReactElement, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { OTPVerificationScreen } from '../../../../frontend/src/auth/screens';

export default function VerifyOTPRoute(): ReactElement {
  const { email = '', context = 'registration' } = useLocalSearchParams<{
    email?: string;
    context?: 'registration' | 'password_reset';
  }>();

  const handleVerified = useCallback(() => {
    if (context === 'password_reset') {
      router.replace('/(auth)/login');
    } else {
      router.replace('/onboarding');
    }
  }, [context]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  return (
    <OTPVerificationScreen
      email={email}
      context={context}
      onVerified={handleVerified}
      onBack={handleBack}
    />
  );
}
