export const SUPPORTED_LOCALES = ["en-US", "ru-RU", "de-DE", "fr-FR", "ja-JP", "zh-CN"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type ThemeMode = "light" | "dark" | "system";

export interface UserPreferencesParams {
  readonly theme?: ThemeMode | undefined;
  readonly locale?: string | undefined;
  readonly emailNotifications?: boolean | undefined;
  readonly pushNotifications?: boolean | undefined;
}

export interface UserPreferences {
  readonly theme: ThemeMode;
  readonly locale: Locale;
  readonly emailNotifications: boolean;
  readonly pushNotifications: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  locale: "en-US",
  emailNotifications: true,
  pushNotifications: true,
};

export function createUserPreferences(params?: Partial<UserPreferencesParams>): UserPreferences {
  const theme = params?.theme ?? DEFAULT_PREFERENCES.theme;
  const localeRaw = params?.locale ?? DEFAULT_PREFERENCES.locale;

  if (!SUPPORTED_LOCALES.includes(localeRaw as Locale)) {
    throw new Error(`Unsupported locale: '${localeRaw}'`);
  }

  const locale = localeRaw as Locale;

  return {
    theme,
    locale,
    emailNotifications: params?.emailNotifications ?? DEFAULT_PREFERENCES.emailNotifications,
    pushNotifications: params?.pushNotifications ?? DEFAULT_PREFERENCES.pushNotifications,
  };
}
