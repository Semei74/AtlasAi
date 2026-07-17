import { createTamagui, createTokens } from "tamagui";
import { createInterFont } from "@tamagui/font-inter";
import { createAnimations } from "@tamagui/animations-css";

const animations = createAnimations({
  fast: "ease-in-out 150ms",
  medium: "ease-in-out 300ms",
  slow: "ease-in-out 500ms",
});

const headingFont = createInterFont();
const bodyFont = createInterFont();

const tokens = createTokens({
  color: {
    white: "#ffffff",
    black: "#000000",
    primary: "#2563eb",
    primaryLight: "#3b82f6",
    primaryDark: "#1d4ed8",
    secondary: "#6366f1",
    accent: "#8b5cf6",
    background: "#ffffff",
    backgroundMuted: "#f8fafc",
    surface: "#f1f5f9",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
    borderLight: "#f1f5f9",
    error: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
    info: "#3b82f6",
  },
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    true: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },
  size: {
    xs: 20,
    sm: 24,
    md: 32,
    true: 32,
    lg: 40,
    xl: 48,
    "2xl": 64,
  },
  radius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  zIndex: {
    xs: 0,
    sm: 100,
    md: 200,
    lg: 300,
    xl: 400,
    "2xl": 500,
  },
});

const lightTheme = {
  background: tokens.color.background,
  backgroundMuted: tokens.color.backgroundMuted,
  surface: tokens.color.surface,
  border: tokens.color.border,
  borderLight: tokens.color.borderLight,
  color: tokens.color.text,
  colorMuted: tokens.color.textMuted,
  primary: tokens.color.primary,
  primaryLight: tokens.color.primaryLight,
  primaryDark: tokens.color.primaryDark,
  secondary: tokens.color.secondary,
  accent: tokens.color.accent,
  error: tokens.color.error,
  success: tokens.color.success,
  warning: tokens.color.warning,
  info: tokens.color.info,
  white: tokens.color.white,
  black: tokens.color.black,
};

const darkTheme = {
  ...lightTheme,
  background: "#0f172a",
  backgroundMuted: "#1e293b",
  surface: "#334155",
  border: "#475569",
  borderLight: "#334155",
  color: "#f8fafc",
  colorMuted: "#94a3b8",
  primary: "#3b82f6",
  primaryLight: "#60a5fa",
  primaryDark: "#2563eb",
  secondary: "#818cf8",
  accent: "#a78bfa",
  error: "#f87171",
  success: "#4ade80",
  warning: "#fbbf24",
  info: "#60a5fa",
};

export const tamaguiConfig = createTamagui({
  defaultTheme: "light",
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  settings: {},
  animations,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
});

export type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
