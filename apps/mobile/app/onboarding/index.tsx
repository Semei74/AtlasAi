import { ReactElement, useCallback } from 'react';
import { router } from 'expo-router';
import { OnboardingScreen } from '../../../../frontend/src/auth/screens';
import { tokenStorage } from '../../../../frontend/src/auth';

export default function OnboardingRoute(): ReactElement {
  const handleComplete = useCallback(async () => {
    await tokenStorage.setOnboardingComplete(true);
    router.replace('/');
  }, []);

  const handleSkip = useCallback(async () => {
    await tokenStorage.setOnboardingComplete(true);
    router.replace('/');
  }, []);

  return <OnboardingScreen onComplete={handleComplete} onSkip={handleSkip} />;
}
