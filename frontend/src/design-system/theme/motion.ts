export const duration = {
  instant: 0,
  micro: 100,
  fast: 150,
  normal: 200,
  medium: 250,
  slow: 300,
  slower: 350,
  deliberate: 400,
  transition: 500,
  loading: 800,
  skeleton: 1500,
  toast: 4000,
  snackbar: 6000,
  tooltipShow: 300,
  hoverCardShow: 500,
  hoverCardHide: 300,
} as const;

export type DurationKey = keyof typeof duration;

export const easing = {
  ease: 'ease' as const,
  easeIn: 'ease-in' as const,
  easeOut: 'ease-out' as const,
  easeInOut: 'ease-in-out' as const,
  linear: 'linear' as const,
  spring: 'spring' as const,
};

export const reanimatedEasing = {
  ease: 0.25 as const,
  easeIn: 0.4 as const,
  easeOut: 0.2 as const,
  easeInOut: 0.4 as const,
};

export const springConfig = {
  default: { damping: 20, stiffness: 300, mass: 1 },
  gentle: { damping: 24, stiffness: 200, mass: 1 },
  snappy: { damping: 14, stiffness: 400, mass: 0.5 },
  wobbly: { damping: 8, stiffness: 150, mass: 1 },
} as const;

export const scaleTransform = {
  pressed: 0.97,
  modalEnter: 0.95,
} as const;

export const skeleton = {
  shimmerDuration: duration.skeleton,
  shimmerLoop: true,
  fadeOutDuration: duration.normal,
} as const;
