import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const NAMESPACES = [
  "common",
  "auth",
  "chat",
  "knowledge",
  "prompts",
  "settings",
  "errors",
  "extension",
] as const;

const LOCALES = [
  "en-US",
  "ru-RU",
  "de-DE",
  "fr-FR",
  "ja-JP",
  "zh-CN",
] as const;

void i18n.use(initReactI18next).use(LanguageDetector).init({
  fallbackLng: "en-US" as const,
  supportedLngs: [...LOCALES],
  ns: [...NAMESPACES],
  defaultNS: "common" as const,
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
});

export { i18n, LOCALES, NAMESPACES };
export type Locale = (typeof LOCALES)[number];
export type Namespace = (typeof NAMESPACES)[number];
