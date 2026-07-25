import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme, AccessibilityInfo } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeContext, ThemeContextValue } from './ThemeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface ThemeProviderProps {
  children: ReactNode;
  initialColorScheme?: 'light' | 'dark';
  initialHighContrast?: boolean;
  initialDensityMode?: 'comfortable' | 'compact' | 'touch';
}

export function ThemeProvider({
  children,
  initialColorScheme,
  initialHighContrast,
  initialDensityMode,
}: ThemeProviderProps) {
  const systemScheme = useRNColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    initialColorScheme ?? (systemScheme as 'light' | 'dark') ?? 'light',
  );
  const [isHighContrast, setIsHighContrast] = useState(initialHighContrast ?? false);
  const [densityMode, setDensityMode] = useState<'comfortable' | 'compact' | 'touch'>(
    initialDensityMode ?? 'comfortable',
  );

  useReducedMotion();

  const toggleColorScheme = useCallback(() => {
    setColorScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      isHighContrast,
      densityMode,
      toggleColorScheme,
      setHighContrast: setIsHighContrast,
      setDensityMode,
    }),
    [colorScheme, isHighContrast, densityMode, toggleColorScheme],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
