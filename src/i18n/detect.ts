import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { localeFromAcceptLanguage, localeFromCountry } from "./country-locale";

function countryFromHeaders(hdrs: Headers): string | null {
  return (
    hdrs.get("cf-ipcountry") ||
    hdrs.get("x-vercel-ip-country") ||
    hdrs.get("x-country-code") ||
    null
  );
}

async function countryFromIp(ip: string): Promise<string | null> {
  if (!ip || ip === "127.0.0.1" || ip.startsWith("::") || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return null;
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=countryCode`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { countryCode?: string };
    return data.countryCode || null;
  } catch {
    return null;
  }
}

export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const hdrs = await headers();
  let country = countryFromHeaders(hdrs);

  if (!country) {
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "";
    country = await countryFromIp(ip);
  }

  const fromCountry = localeFromCountry(country);
  if (fromCountry) return fromCountry;

  const fromLang = localeFromAcceptLanguage(hdrs.get("accept-language"));
  if (fromLang) return fromLang;

  return DEFAULT_LOCALE;
}

export function resolveLocaleFromRequest(request: {
  cookies: { get: (name: string) => { value: string } | undefined };
  headers: { get: (name: string) => string | null };
}): Locale | null {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const country = countryFromHeaders(request.headers as unknown as Headers);
  const fromCountry = localeFromCountry(country);
  if (fromCountry) return fromCountry;

  const fromLang = localeFromAcceptLanguage(request.headers.get("accept-language"));
  if (fromLang) return fromLang;

  return null;
}
