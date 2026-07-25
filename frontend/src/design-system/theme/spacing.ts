export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingKey];

export const inset = {
  xs: spacing[2],
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
} as const;

export const stack = {
  xs: spacing[2],
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
} as const;

export const inline = {
  xs: spacing[2],
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
} as const;

export const gap = {
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[3],
  lg: spacing[4],
} as const;

export const density = {
  comfortable: {
    cardPadding: spacing[4],
    formFieldGap: spacing[5],
    tableRowHeight: 56,
    listItemPadding: spacing[3],
    modalPadding: spacing[6],
    sectionGap: spacing[8],
  },
  compact: {
    cardPadding: spacing[3],
    formFieldGap: spacing[3],
    tableRowHeight: 40,
    listItemPadding: spacing[2],
    modalPadding: spacing[4],
    sectionGap: spacing[6],
  },
  touch: {
    cardPadding: spacing[4],
    formFieldGap: spacing[6],
    tableRowHeight: 60,
    listItemPadding: spacing[4],
    modalPadding: spacing[6],
    sectionGap: spacing[8],
  },
} as const;

export type DensityMode = keyof typeof density;

export const layout = {
  topBarHeight: 56,
  sidebarExpandedWidth: 240,
  sidebarCollapsedWidth: 52,
  bottomTabBarHeight: 56,
  contentMaxWidth: 1440,
  readingMaxWidth: 720,
  safeAreaTop: 44,
  safeAreaBottom: 34,
} as const;

export const contentPadding = {
  desktop: spacing[8],
  tablet: spacing[6],
  mobile: spacing[4],
} as const;
