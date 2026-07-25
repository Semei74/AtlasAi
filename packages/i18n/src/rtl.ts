import { useTranslation } from "react-i18next";

const RTL_LOCALES = ["ar", "he", "fa", "ur"];

export function useIsRTL(): boolean {
  const { i18n } = useTranslation();
  return RTL_LOCALES.some((rtl) => i18n.language.startsWith(rtl));
}
