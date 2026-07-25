import { Platform } from 'react-native';

export const fontFamily = {
  inter: 'Inter',
  jetBrainsMono: 'JetBrains Mono',
  system: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  ui: `Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  mono: `'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace`,
} as const;

export const fontWeight = {
  regular: '400' as const,
  regularInter: '450' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export type FontWeight = (typeof fontWeight)[keyof typeof fontWeight];

export interface TypeRole {
  fontSize: number;
  fontWeight: FontWeight;
  lineHeight: number;
  letterSpacing?: number;
}

export const typeScale = {
  display: 72,
  h1: 60,
  h2: 48,
  h3: 36,
  h4: 30,
  h5: 24,
  h6: 20,
  lead: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  code: 13,
} as const;

export const mobileScale = {
  display: 40,
  h1: 36,
  h2: 32,
  h3: 28,
  h4: 24,
  h5: 20,
  h6: 18,
  lead: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  code: 13,
} as const;

export const typeRoles: Record<string, TypeRole> = {
  display: { fontSize: typeScale.display, fontWeight: fontWeight.bold, lineHeight: 1.1 },
  heading1: { fontSize: typeScale.h1, fontWeight: fontWeight.bold, lineHeight: 1.15 },
  heading2: { fontSize: typeScale.h2, fontWeight: fontWeight.bold, lineHeight: 1.2 },
  heading3: { fontSize: typeScale.h3, fontWeight: fontWeight.semiBold, lineHeight: 1.25 },
  heading4: { fontSize: typeScale.h4, fontWeight: fontWeight.semiBold, lineHeight: 1.3 },
  heading5: { fontSize: typeScale.h5, fontWeight: fontWeight.medium, lineHeight: 1.35 },
  heading6: { fontSize: typeScale.h6, fontWeight: fontWeight.medium, lineHeight: 1.4 },
  subtitle: { fontSize: typeScale.lead, fontWeight: fontWeight.medium, lineHeight: 1.5 },
  body: { fontSize: typeScale.body, fontWeight: fontWeight.regular, lineHeight: 1.6 },
  bodySmall: { fontSize: typeScale.bodySmall, fontWeight: fontWeight.regular, lineHeight: 1.5 },
  caption: { fontSize: typeScale.caption, fontWeight: fontWeight.regular, lineHeight: 1.4 },
  label: { fontSize: typeScale.bodySmall, fontWeight: fontWeight.medium, lineHeight: 1.4 },
  labelSmall: { fontSize: typeScale.caption, fontWeight: fontWeight.medium, lineHeight: 1.4 },
  button: { fontSize: typeScale.bodySmall, fontWeight: fontWeight.semiBold, lineHeight: 1 },
  buttonLarge: { fontSize: typeScale.body, fontWeight: fontWeight.semiBold, lineHeight: 1 },
  link: { fontSize: typeScale.body, fontWeight: fontWeight.medium, lineHeight: 1.6 },
  code: { fontSize: typeScale.code, fontWeight: fontWeight.regular, lineHeight: 1.6 },
  codeInline: { fontSize: typeScale.code, fontWeight: fontWeight.regular, lineHeight: 1.4 },
  data: { fontSize: typeScale.bodySmall, fontWeight: fontWeight.regular, lineHeight: 1.3 },
  dataLarge: { fontSize: typeScale.h5, fontWeight: fontWeight.bold, lineHeight: 1.2 },
};

export function getTypeRole(role: keyof typeof typeRoles, isMobile?: boolean): TypeRole {
  const base = typeRoles[role];
  if (!isMobile) return base;
  const mobileSize = mobileScale[role as keyof typeof mobileScale];
  if (mobileSize) {
    return { ...base, fontSize: mobileSize };
  }
  return base;
}

export const letterSpacing = {
  normal: 0,
  uppercase: 0.05,
  display: -0.02,
  heading: -0.01,
  button: 0.01,
} as const;
