import type { Locale } from "../config";
import { deepMerge, type DeepPartial } from "../merge";
import en, { type Messages } from "./en";
import deOverrides from "./de";
import esOverrides from "./es";
import frOverrides from "./fr";
import itOverrides from "./it";
import ptOverrides from "./pt";
import nlOverrides from "./nl";
import jaOverrides from "./ja";
import zhOverrides from "./zh";
import koOverrides from "./ko";
import ruOverrides from "./ru";
import plOverrides from "./pl";
import trOverrides from "./tr";
import arOverrides from "./ar";

const CACHE: Partial<Record<Locale, Messages>> = { en };

function build(locale: Locale, overrides: DeepPartial<Messages>): Messages {
  return deepMerge(en, overrides);
}

const BUILDERS: Record<Locale, () => Messages> = {
  en: () => en,
  de: () => build("de", deOverrides),
  es: () => build("es", esOverrides),
  fr: () => build("fr", frOverrides),
  it: () => build("it", itOverrides),
  pt: () => build("pt", ptOverrides),
  nl: () => build("nl", nlOverrides),
  ja: () => build("ja", jaOverrides),
  zh: () => build("zh", zhOverrides),
  ko: () => build("ko", koOverrides),
  ru: () => build("ru", ruOverrides),
  pl: () => build("pl", plOverrides),
  tr: () => build("tr", trOverrides),
  ar: () => build("ar", arOverrides),
};

export function getMessages(locale: Locale): Messages {
  if (!CACHE[locale]) CACHE[locale] = BUILDERS[locale]();
  return CACHE[locale]!;
}

export type { Messages };
