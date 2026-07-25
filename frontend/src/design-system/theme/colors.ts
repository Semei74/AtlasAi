import { ColorSchemeName } from 'react-native';

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface SemanticColors {
  default: string;
  bg: string;
  border: string;
  text: string;
}

export interface SurfaceColors {
  primary: string;
  secondary: string;
  tertiary: string;
}

export interface BorderColors {
  default: string;
  hover: string;
  focus: string;
  active: string;
  error: string;
  success: string;
  disabled: string;
}

export interface ThemeColors {
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  success: SemanticColors;
  warning: SemanticColors;
  error: SemanticColors;
  info: SemanticColors;
  bg: SurfaceColors;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  surfaceElevated: string;
  overlay: string;
  glass: string;
  border: BorderColors;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    link: string;
    linkHover: string;
    success: string;
    warning: string;
    error: string;
    disabled: string;
    onPrimary: string;
    onSecondary: string;
  };
}

export const lightColors: ThemeColors = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#4F46E5',
    600: '#4338CA',
    700: '#3730A3',
    800: '#312E81',
    900: '#1E1B4B',
  },
  secondary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  neutral: {
    50: '#F8F9FA',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  success: {
    default: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
  },
  warning: {
    default: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
  },
  error: {
    default: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
  },
  info: {
    default: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1E40AF',
  },
  bg: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F3F4F6',
  },
  surface: '#FFFFFF',
  surfaceHover: '#F9FAFB',
  surfaceActive: '#F3F4F6',
  surfaceElevated: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.4)',
  glass: 'rgba(255,255,255,0.8)',
  border: {
    default: '#E5E7EB',
    hover: '#D1D5DB',
    focus: '#4F46E5',
    active: '#4338CA',
    error: '#DC2626',
    success: '#059669',
    disabled: '#F3F4F6',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#4F46E5',
    linkHover: '#4338CA',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    disabled: '#D1D5DB',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
  },
};

export const darkColors: ThemeColors = {
  primary: {
    50: '#1E1B4B',
    100: '#312E81',
    200: '#3730A3',
    300: '#4338CA',
    400: '#6366F1',
    500: '#818CF8',
    600: '#A5B4FC',
    700: '#C7D2FE',
    800: '#E0E7FF',
    900: '#EEF2FF',
  },
  secondary: {
    50: '#134E4A',
    100: '#115E59',
    200: '#0F766E',
    300: '#0D9488',
    400: '#14B8A6',
    500: '#2DD4BF',
    600: '#5EEAD4',
    700: '#99F6E4',
    800: '#CCFBF1',
    900: '#F0FDFA',
  },
  accent: {
    50: '#78350F',
    100: '#92400E',
    200: '#B45309',
    300: '#D97706',
    400: '#F59E0B',
    500: '#FBBF24',
    600: '#FCD34D',
    700: '#FDE68A',
    800: '#FEF3C7',
    900: '#FFFBEB',
  },
  neutral: {
    50: '#0F1117',
    100: '#141620',
    200: '#1A1D27',
    300: '#1E2030',
    400: '#2D3045',
    500: '#4B5563',
    600: '#6B7280',
    700: '#9CA3AF',
    800: '#D1D5DB',
    900: '#F3F4F6',
  },
  success: {
    default: '#34D399',
    bg: '#064E3B',
    border: '#065F46',
    text: '#A7F3D0',
  },
  warning: {
    default: '#FBBF24',
    bg: '#451A03',
    border: '#78350F',
    text: '#FDE68A',
  },
  error: {
    default: '#F87171',
    bg: '#450A0A',
    border: '#7F1D1D',
    text: '#FECACA',
  },
  info: {
    default: '#60A5FA',
    bg: '#172554',
    border: '#1E3A5F',
    text: '#BFDBFE',
  },
  bg: {
    primary: '#0F1117',
    secondary: '#141620',
    tertiary: '#1A1D27',
  },
  surface: '#1E2030',
  surfaceHover: '#252840',
  surfaceActive: '#2D3045',
  surfaceElevated: '#252840',
  overlay: 'rgba(0,0,0,0.6)',
  glass: 'rgba(15,17,23,0.8)',
  border: {
    default: '#2D3045',
    hover: '#4B5563',
    focus: '#818CF8',
    active: '#A5B4FC',
    error: '#F87171',
    success: '#34D399',
    disabled: '#1A1D27',
  },
  text: {
    primary: '#F3F4F6',
    secondary: '#9CA3AF',
    tertiary: '#6B7280',
    inverse: '#0F1117',
    link: '#818CF8',
    linkHover: '#A5B4FC',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    disabled: '#4B5563',
    onPrimary: '#FFFFFF',
    onSecondary: '#0F1117',
  },
};

export const highContrastLight: ThemeColors = {
  ...lightColors,
  border: {
    ...lightColors.border,
    default: '#6B7280',
    disabled: '#9CA3AF',
  },
  text: {
    ...lightColors.text,
    tertiary: '#6B7280',
    disabled: '#6B7280',
  },
};

export const highContrastDark: ThemeColors = {
  ...darkColors,
  border: {
    ...darkColors.border,
    default: '#9CA3AF',
    disabled: '#6B7280',
  },
  text: {
    ...darkColors.text,
    tertiary: '#9CA3AF',
    disabled: '#6B7280',
  },
};

export function resolveColors(scheme: ColorSchemeName, highContrast?: boolean): ThemeColors {
  if (highContrast) {
    return scheme === 'dark' ? highContrastDark : highContrastLight;
  }
  return scheme === 'dark' ? darkColors : lightColors;
}
