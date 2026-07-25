export const opacity = {
  disabled: 0.4,
  disabledHighContrast: 0.65,
  hover: 0.92,
  active: 0.84,
  overlay: 0.4,
  overlayHeavy: 0.6,
  glass: 0.8,
  skeleton: 0.1,
  skeletonHighlight: 0.05,
  shimmer: 0.15,
  border: 0.06,
  borderHeavy: 0.08,
  borderFloating: 0.12,
  borderCosmic: 0.16,
} as const;

export type OpacityKey = keyof typeof opacity;
