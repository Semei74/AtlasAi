import { useWindowDimensions } from 'react-native';
import {
  fontFamily,
  fontWeight,
  typeScale,
  typeRoles,
  getTypeRole,
  letterSpacing,
} from '../theme/typography';
import { isMobile } from '../theme/breakpoints';
import type { FontWeight, TypeRole } from '../theme/typography';

export function useTypography(): {
  fontFamily: typeof fontFamily;
  fontWeight: typeof fontWeight;
  typeScale: typeof typeScale;
  typeRoles: typeof typeRoles;
  letterSpacing: typeof letterSpacing;
  getRole: (role: keyof typeof typeRoles) => TypeRole;
} {
  const { width } = useWindowDimensions();
  const mobile = isMobile(width);
  return {
    fontFamily,
    fontWeight,
    typeScale,
    typeRoles,
    letterSpacing,
    getRole: (role: keyof typeof typeRoles) => getTypeRole(role, mobile),
  };
}
