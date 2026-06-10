/** Browser-like headers so Travala API and HTML endpoints accept server-side requests. */
export const TRAVALA_BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export function travalaApiHeaders(extra?: Record<string, string>): HeadersInit {
  return {
    Accept: "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": TRAVALA_BROWSER_UA,
    platformVersion: "web",
    Origin: "https://www.travala.com",
    Referer: "https://www.travala.com/",
    ...extra,
  };
}

export function travalaHtmlHeaders(extra?: Record<string, string>): HeadersInit {
  return {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": TRAVALA_BROWSER_UA,
    Referer: "https://www.travala.com/",
    ...extra,
  };
}
