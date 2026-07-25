import { ReactElement, useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { SplashScreen as CustomSplash } from '../../../frontend/src/auth';
import { tokenStorage } from '../../../frontend/src/auth';

export default function Index(): ReactElement {
  const [destination, setDestination] = useState<'loading' | 'login' | 'onboarding' | 'tabs'>('loading');

  useEffect(() => {
    async function init() {
      try {
        const onboardingDone = await tokenStorage.getOnboardingComplete();
        // Auth session restore is handled by AuthProvider
        // This just determines initial route
        setDestination(onboardingDone ? 'login' : 'onboarding');
      } catch {
        setDestination('login');
      }
    }
    init();
  }, []);

  if (destination === 'loading') {
    return <CustomSplash onComplete={() => setDestination('login')} />;
  }

  if (destination === 'tabs') {
    return <Redirect href="/(tabs)" />;
  }

  if (destination === 'onboarding') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(auth)/login" />;
}
