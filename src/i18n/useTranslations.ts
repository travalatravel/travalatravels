"use client";

import { useLocaleContext } from "./LocaleProvider";

export function formatMessage(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

export function useTranslations() {
  const { locale, messages, dir } = useLocaleContext();
  return {
    locale,
    messages,
    dir,
    t: (path: string, params?: Record<string, string | number>) => {
      const parts = path.split(".");
      let cur: unknown = messages;
      for (const part of parts) {
        if (cur == null || typeof cur !== "object") return path;
        cur = (cur as Record<string, unknown>)[part];
      }
      if (typeof cur !== "string") return path;
      return formatMessage(cur, params);
    },
    fmt: formatMessage,
  };
}
