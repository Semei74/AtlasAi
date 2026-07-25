import { Platform } from 'react-native';

export interface ShadowValue {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export function createShadow(
  height: number,
  radius: number,
  opacity: number,
  elevation: number,
): ShadowValue {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height },
    shadowOpacity,
    shadowRadius: radius,
    elevation: Platform.select({ android: elevation, default: 0 }),
  };
}

export const elevation = {
  flat: {},
  raised: createShadow(1, 2, 0.06, 2),
  overlay: createShadow(4, 12, 0.08, 4),
  floating: createShadow(8, 24, 0.12, 8),
  cosmic: createShadow(16, 48, 0.16, 12),
} as const;

export type ElevationKey = keyof typeof elevation;

export const darkElevation = {
  flat: {},
  raised: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  overlay: {
    ...createShadow(4, 12, 0.4, 4),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  floating: {
    ...createShadow(8, 24, 0.5, 8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  cosmic: createShadow(16, 48, 0.6, 12),
} as const;
