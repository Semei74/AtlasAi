import { useContext } from 'react';
import { ThemeContext } from '../components/Provider/ThemeContext';
import { ThemeColors, resolveColors } from '../theme/colors';
import {
  spacing,
  inset,
  stack,
  inline,
  gap,
  density,
  layout,
  contentPadding,
} from '../theme/spacing';
import {
  fontFamily,
  fontWeight,
  typeRoles,
  getTypeRole,
  letterSpacing,
} from '../theme/typography';
import { radius } from '../theme/radius';
import { elevation, darkElevation } from '../theme/shadows';
import { opacity } from '../theme/opacity';
import { zIndex } from '../theme/zIndex';
import { duration, springConfig, skeleton } from '../theme/motion';
import { getCurrentBreakpoint, isMobile, isTablet, isDesktop } from '../theme/breakpoints';

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  inset: typeof inset;
  stack: typeof stack;
  inline: typeof inline;
  gap: typeof gap;
  density: typeof density;
  layout: typeof layout;
  contentPadding: typeof contentPadding;
  fontFamily: typeof fontFamily;
  fontWeight: typeof fontWeight;
  typeRoles: typeof typeRoles;
  getTypeRole: typeof getTypeRole;
  letterSpacing: typeof letterSpacing;
  radius: typeof radius;
  elevation: typeof elevation;
  darkElevation: typeof darkElevation;
  opacity: typeof opacity;
  zIndex: typeof zIndex;
  duration: typeof duration;
  springConfig: typeof springConfig;
  skeleton: typeof skeleton;
  getCurrentBreakpoint: typeof getCurrentBreakpoint;
  isMobile: typeof isMobile;
  isTablet: typeof isTablet;
  isDesktop: typeof isDesktop;
  colorScheme: 'light' | 'dark';
  isHighContrast: boolean;
  densityMode: 'comfortable' | 'compact' | 'touch';
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  const { colorScheme, isHighContrast, densityMode } = ctx;
  const colors = resolveColors(colorScheme, isHighContrast);

  return {
    colors,
    spacing,
    inset,
    stack,
    inline,
    gap,
    density,
    layout,
    contentPadding,
    fontFamily,
    fontWeight,
    typeRoles,
    getTypeRole,
    letterSpacing,
    radius,
    elevation,
    darkElevation,
    opacity,
    zIndex,
    duration,
    springConfig,
    skeleton,
    getCurrentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    colorScheme,
    isHighContrast,
    densityMode,
  };
}

export function useThemeColors(): ThemeColors {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeColors must be used within a ThemeProvider');
  }
  return resolveColors(ctx.colorScheme, ctx.isHighContrast);
}

export function useColorScheme(): 'light' | 'dark' {
  const ctx = useContext(ThemeContext);
  if (!ctx) return 'light';
  return ctx.colorScheme;
}
