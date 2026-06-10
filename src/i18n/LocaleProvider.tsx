"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import { LOCALE_META } from "./config";
import { getMessages, type Messages } from "./messages";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
  dir: "ltr" | "rtl";
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(
    () => ({
      locale,
      messages: getMessages(locale),
      dir: LOCALE_META[locale].dir,
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocaleContext must be used within LocaleProvider");
  return ctx;
}
