import { createContext } from 'react';

export interface ThemeContextValue {
  colorScheme: 'light' | 'dark';
  isHighContrast: boolean;
  densityMode: 'comfortable' | 'compact' | 'touch';
  toggleColorScheme: () => void;
  setHighContrast: (value: boolean) => void;
  setDensityMode: (mode: 'comfortable' | 'compact' | 'touch') => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
