import { isReducedMotionEnabled } from '../../design-system';

export const screenAnimationConfig = {
  slideFromRight: {
    animation: 'slide_from_right' as const,
    duration: isReducedMotionEnabled() ? 0 : 300,
  },
  slideFromBottom: {
    animation: 'slide_from_bottom' as const,
    duration: isReducedMotionEnabled() ? 0 : 350,
  },
  fade: {
    animation: 'fade' as const,
    duration: isReducedMotionEnabled() ? 0 : 200,
  },
  none: {
    animation: 'none' as const,
  },
};

export const tabAnimationConfig = {
  crossFade: {
    animation: 'fade' as const,
    tabBarAnimation: 'fade' as const,
  },
  instant: {
    animation: 'none' as const,
    tabBarAnimation: 'none' as const,
  },
};
