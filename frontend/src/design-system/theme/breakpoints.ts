import { Dimensions, ScaledSize } from 'react-native';

export interface Breakpoint {
  minWidth: number;
  name: string;
  columns: number;
  gutter: number;
  margin: number;
  containerMax?: number;
}

export const breakpoints: Record<string, Breakpoint> = {
  xs: { minWidth: 0, name: 'xs', columns: 4, gutter: 16, margin: 16 },
  sm: { minWidth: 640, name: 'sm', columns: 8, gutter: 16, margin: 24 },
  md: { minWidth: 768, name: 'md', columns: 12, gutter: 24, margin: 24 },
  lg: { minWidth: 1024, name: 'lg', columns: 12, gutter: 24, margin: 24, containerMax: 1200 },
  xl: { minWidth: 1280, name: 'xl', columns: 12, gutter: 24, margin: 32, containerMax: 1440 },
  '2xl': {
    minWidth: 1536,
    name: '2xl',
    columns: 12,
    gutter: 24,
    margin: 32,
    containerMax: 1600,
  },
};

export function getCurrentBreakpoint(window?: ScaledSize): string {
  const { width } = window ?? Dimensions.get('window');
  const sorted = Object.entries(breakpoints)
    .sort(([, a], [, b]) => b.minWidth - a.minWidth);
  for (const [key, bp] of sorted) {
    if (width >= bp.minWidth) return key;
  }
  return 'xs';
}

export function isMobile(width: number): boolean {
  return width < 768;
}

export function isTablet(width: number): boolean {
  return width >= 768 && width < 1024;
}

export function isDesktop(width: number): boolean {
  return width >= 1024;
}

export const breakpointNames = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export type BreakpointName = (typeof breakpointNames)[number];
