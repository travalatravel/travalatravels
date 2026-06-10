export const LOCALES = [
  "en",
  "de",
  "es",
  "fr",
  "it",
  "pt",
  "nl",
  "ja",
  "zh",
  "ko",
  "ru",
  "pl",
  "tr",
  "ar",
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "locale";

export type LocaleMeta = {
  code: Locale;
  label: string;
  flag: string;
  dir: "ltr" | "rtl";
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { code: "en", label: "English", flag: "GB", dir: "ltr" },
  de: { code: "de", label: "Deutsch", flag: "DE", dir: "ltr" },
  es: { code: "es", label: "Español", flag: "ES", dir: "ltr" },
  fr: { code: "fr", label: "Français", flag: "FR", dir: "ltr" },
  it: { code: "it", label: "Italiano", flag: "IT", dir: "ltr" },
  pt: { code: "pt", label: "Português", flag: "PT", dir: "ltr" },
  nl: { code: "nl", label: "Nederlands", flag: "NL", dir: "ltr" },
  ja: { code: "ja", label: "日本語", flag: "JP", dir: "ltr" },
  zh: { code: "zh", label: "中文", flag: "CN", dir: "ltr" },
  ko: { code: "ko", label: "한국어", flag: "KR", dir: "ltr" },
  ru: { code: "ru", label: "Русский", flag: "RU", dir: "ltr" },
  pl: { code: "pl", label: "Polski", flag: "PL", dir: "ltr" },
  tr: { code: "tr", label: "Türkçe", flag: "TR", dir: "ltr" },
  ar: { code: "ar", label: "العربية", flag: "SA", dir: "rtl" },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && LOCALES.includes(value as Locale));
}
