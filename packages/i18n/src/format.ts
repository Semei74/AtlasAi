import { useTranslation } from "react-i18next";

interface FormatFunctions {
  date: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  number: (n: number, options?: Intl.NumberFormatOptions) => string;
  currency: (amount: number, currency?: string) => string;
  relativeTime: (ms: number) => string;
}

export function useFormat(): FormatFunctions {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return {
    date: (date: Date, options?: Intl.DateTimeFormatOptions): string =>
      new Intl.DateTimeFormat(lang, options).format(date),

    number: (n: number, options?: Intl.NumberFormatOptions): string =>
      new Intl.NumberFormat(lang, options).format(n),

    currency: (amount: number, currency = "USD"): string =>
      new Intl.NumberFormat(lang, {
        style: "currency",
        currency,
      }).format(amount),

    relativeTime: (ms: number): string => {
      const rtf = new Intl.RelativeTimeFormat(lang, {
        numeric: "auto",
      });
      const seconds = Math.round((Date.now() - ms) / 1000);
      if (seconds < 60) return rtf.format(-seconds, "second");
      if (seconds < 3600)
        return rtf.format(-Math.round(seconds / 60), "minute");
      if (seconds < 86400)
        return rtf.format(-Math.round(seconds / 3600), "hour");
      return rtf.format(-Math.round(seconds / 86400), "day");
    },
  };
}
