export {
  lightColors,
  darkColors,
  highContrastLight,
  highContrastDark,
  resolveColors,
} from '../theme/colors';
export type { ThemeColors, ColorPalette, SemanticColors } from '../theme/colors';

export {
  spacing,
  inset,
  stack,
  inline,
  gap,
  density,
  layout,
  contentPadding,
} from '../theme/spacing';
export type { SpacingKey, SpacingValue } from '../theme/spacing';

export {
  fontFamily,
  fontWeight,
  typeScale,
  mobileScale,
  typeRoles,
  getTypeRole,
  letterSpacing,
} from '../theme/typography';
export type { FontWeight, TypeRole } from '../theme/typography';

export { radius } from '../theme/radius';
export type { RadiusKey, RadiusValue } from '../theme/radius';

export { elevation, darkElevation, createShadow } from '../theme/shadows';
export type { ShadowValue, ElevationKey } from '../theme/shadows';

export { opacity } from '../theme/opacity';
export type { OpacityKey } from '../theme/opacity';

export { zIndex } from '../theme/zIndex';
export type { ZIndexKey } from '../theme/zIndex';

export { duration, easing, reanimatedEasing, springConfig, scaleTransform, skeleton } from '../theme/motion';
export type { DurationKey } from '../theme/motion';

export { breakpoints, getCurrentBreakpoint, isMobile, isTablet, isDesktop, breakpointNames } from '../theme/breakpoints';
export type { Breakpoint, BreakpointName } from '../theme/breakpoints';
