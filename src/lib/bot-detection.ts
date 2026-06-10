/** Detect automated clients so we never interfere with crawlers, scripts, or API tools. */
export function isAutomatedClient(userAgent: string | null): boolean {
  const ua = (userAgent || "").toLowerCase();
  if (!ua) return true;

  return /bot|crawl|spider|slurp|curl|wget|python-requests|python\/|java\/|httpclient|scrapy|headless|phantom|selenium|playwright|puppeteer|postman|insomnia|axios|go-http|ruby|libwww|okhttp|fetch\/|node-fetch|undici|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|semrush|ahrefs|petalbot|gptbot|claudebot|bytespider/i.test(
    ua,
  );
}
