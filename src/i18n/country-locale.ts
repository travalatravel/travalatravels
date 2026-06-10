import type { Locale } from "./config";

/** Map ISO 3166-1 alpha-2 country codes to primary site locale */
export const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  DE: "de",
  AT: "de",
  CH: "de",
  LI: "de",
  LU: "de",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  FR: "fr",
  BE: "fr",
  MC: "fr",
  SN: "fr",
  CI: "fr",
  CM: "fr",
  IT: "it",
  SM: "it",
  VA: "it",
  PT: "pt",
  BR: "pt",
  AO: "pt",
  MZ: "pt",
  NL: "nl",
  SR: "nl",
  JP: "ja",
  CN: "zh",
  TW: "zh",
  HK: "zh",
  MO: "zh",
  SG: "zh",
  KR: "ko",
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  PL: "pl",
  TR: "tr",
  SA: "ar",
  AE: "ar",
  EG: "ar",
  QA: "ar",
  KW: "ar",
  BH: "ar",
  OM: "ar",
  JO: "ar",
  LB: "ar",
  IQ: "ar",
  MA: "ar",
  DZ: "ar",
  TN: "ar",
  LY: "ar",
  YE: "ar",
  SY: "ar",
  GB: "en",
  US: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  ZA: "en",
  IN: "en",
  PH: "en",
  MY: "en",
  NG: "en",
  KE: "en",
  GH: "en",
  PK: "en",
  BD: "en",
  TH: "en",
  VN: "en",
  ID: "en",
};

export function localeFromCountry(countryCode: string | null | undefined): Locale | null {
  if (!countryCode) return null;
  return COUNTRY_TO_LOCALE[countryCode.toUpperCase()] ?? null;
}

export function localeFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const parts = header.split(",").map((p) => p.trim().split(";")[0].toLowerCase());
  for (const part of parts) {
    const base = part.split("-")[0];
    if (base === "de") return "de";
    if (base === "es") return "es";
    if (base === "fr") return "fr";
    if (base === "it") return "it";
    if (base === "pt") return "pt";
    if (base === "nl") return "nl";
    if (base === "ja") return "ja";
    if (base === "zh") return "zh";
    if (base === "ko") return "ko";
    if (base === "ru") return "ru";
    if (base === "pl") return "pl";
    if (base === "tr") return "tr";
    if (base === "ar") return "ar";
    if (base === "en") return "en";
  }
  return null;
}
