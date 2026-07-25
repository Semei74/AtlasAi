import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

const reducedMotionContext: { enabled: boolean } = { enabled: false };

export function isReducedMotionEnabled(): boolean {
  return reducedMotionContext.enabled;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduced(enabled);
      reducedMotionContext.enabled = enabled;
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setReduced(enabled);
        reducedMotionContext.enabled = enabled;
      },
    );
    return () => subscription.remove();
  }, []);

  return reduced;
}
