export interface RegionalSettings {
  readonly defaultLocale: string;
  readonly defaultTimezone: string;
  readonly allowedLocales: readonly string[];
  readonly dateFormat: string;
  readonly timeFormat: "12h" | "24h";
  readonly firstDayOfWeek: number;
  readonly country: string;
  readonly region: string;
  readonly currency: string;
  readonly language: string;
  readonly legalRegion: string;
  readonly billingRegion: string;
  readonly paymentRegion: string;
  readonly privacyRegion: string;
  readonly dataResidencyRegion: string;
}
