export type ScrapedOffer = {
  type: "HOTEL" | "FLIGHT" | "CAR_RENTAL" | "ACTIVITY";
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  region: string | null;
  image: string;
  price: number;
  stars: number | null;
  metadata: Record<string, unknown>;
  sourceKey: string;
};

const COUNTRY_REGION: Record<string, string> = {
  GB: "europe", DE: "europe", FR: "europe", ES: "europe", IT: "europe", NL: "europe",
  AT: "europe", CH: "europe", PT: "europe", GR: "europe", IE: "europe", BE: "europe",
  US: "north-america", CA: "north-america", MX: "north-america",
  BR: "south-america", AR: "south-america", CL: "south-america", CO: "south-america",
  JP: "asia", CN: "asia", KR: "asia", TH: "asia", SG: "asia", IN: "asia", ID: "asia",
  AE: "middle-east", SA: "middle-east", QA: "middle-east", IL: "middle-east",
  AU: "oceania", NZ: "oceania",
  ZA: "africa", EG: "africa", MA: "africa", KE: "africa",
  DO: "central-america", JM: "central-america", CR: "central-america",
};

const COUNTRY_NAMES: Record<string, string> = {
  GB: "United Kingdom", US: "United States", AE: "United Arab Emirates",
  KR: "South Korea", BR: "Brazil", AU: "Australia", DE: "Germany",
  FR: "France", ES: "Spain", IT: "Italy", JP: "Japan", TH: "Thailand",
  SG: "Singapore", NL: "Netherlands", CA: "Canada", MX: "Mexico",
};

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function estimatePrice(key: string, stars: number | null, type: ScrapedOffer["type"]): number {
  const h = hashString(key);
  if (type === "FLIGHT") return 60 + (h % 540);
  if (type === "CAR_RENTAL") return 28 + (h % 120);
  if (type === "ACTIVITY") return 18 + (h % 280);
  const s = stars ?? 3;
  const base = s >= 5 ? 180 : s >= 4 ? 95 : s >= 3 ? 65 : 45;
  return base + (h % 220);
}

export function regionFromCountry(code: string | null | undefined, countryName?: string): string | null {
  if (code && COUNTRY_REGION[code.toUpperCase()]) return COUNTRY_REGION[code.toUpperCase()];
  const n = (countryName || "").toLowerCase();
  if (/kingdom|germany|france|spain|italy|europe/.test(n)) return "europe";
  if (/states|canada|mexico/.test(n)) return "north-america";
  if (/japan|china|korea|thailand|singapore|asia/.test(n)) return "asia";
  if (/emirates|dubai|qatar|saudi/.test(n)) return "middle-east";
  if (/australia|zealand/.test(n)) return "oceania";
  if (/brazil|argentina|chile/.test(n)) return "south-america";
  if (/africa|south africa|egypt/.test(n)) return "africa";
  return null;
}

export function parseAddress(address: string): { city: string; country: string; countryCode: string | null } {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const code = parts[parts.length - 1].length === 2 ? parts[parts.length - 1].toUpperCase() : null;
    const country = code ? (COUNTRY_NAMES[code] || parts[parts.length - 1]) : parts[parts.length - 1];
    return { city: parts[0], country, countryCode: code };
  }
  return { city: address || "Unknown", country: "International", countryCode: null };
}

export async function fetchText(url: string, retries = 2): Promise<string> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(45000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === retries) throw e;
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error("unreachable");
}

export function extractNextData(html: string): Record<string, unknown> | null {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    const data = JSON.parse(m[1]) as { props?: { pageProps?: Record<string, unknown> } };
    return data.props?.pageProps ?? null;
  } catch {
    return null;
  }
}

export function parseXmlLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R | null | undefined>
): Promise<R[]> {
  const results: R[] = [];
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      const r = await fn(items[i], i);
      if (r != null) results.push(r);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

export function hotelIdFromSlug(slug: string): string {
  const m = slug.match(/-(\d+)$/);
  return m ? m[1] : slug;
}

export function isRealHotelImage(url: string): boolean {
  return Boolean(url && url.includes("i.travelapi.com"));
}

export async function fetchHotelImageUrl(slug: string): Promise<string | null> {
  try {
    const html = await fetchText(`${process.env.TRAVALA_BASE || "https://www.travala.com"}/hotel/${slug}`);
    const props = extractNextData(html);
    const hotel = props?.hotelInformationProps as { photos?: string[] } | undefined;
    return hotel?.photos?.[0] ?? null;
  } catch {
    return null;
  }
}

export function hotelFromProperty(
  p: Record<string, unknown>,
  ctx: { city: string; country: string; countryCode?: string | null; region?: string | null }
): ScrapedOffer | null {
  const slug = String(p.slug || "");
  const name = String(p.name || "");
  if (!slug || !name) return null;

  const id = String(p.id || p.hotel_id || hotelIdFromSlug(slug));
  const stars = typeof p.star === "number" ? p.star : typeof p.star_rating === "number" ? p.star_rating : null;
  const thumbnail = String(p.thumbnail || p.photo || "");
  const address = String(p.address || p.street_address || `${ctx.city}, ${ctx.country}`);
  const parsed = p.city_name
    ? { city: String(p.city_name), country: String(p.country_name || ctx.country), countryCode: String(p.country_code || ctx.countryCode || "") || null }
    : parseAddress(address);

  const sourceKey = `hotel:${hotelIdFromSlug(slug)}`;
  const description = String(
    p.description ||
      `${name} in ${parsed.city}, ${parsed.country}. Book with crypto or card on Travala and save up to 60% on your stay.`
  ).slice(0, 2000);

  return {
    type: "HOTEL",
    title: name,
    description,
    location: `${parsed.city}, ${parsed.country}`,
    city: parsed.city,
    country: parsed.country,
    region: ctx.region ?? regionFromCountry(parsed.countryCode, parsed.country),
    image: thumbnail || `https://static.travala.com/destination/europe/london.jpg`,
    price: estimatePrice(sourceKey, stars, "HOTEL"),
    stars,
    metadata: {
      travalaSlug: slug,
      travalaId: id,
      address,
      source: "travala.com",
      url: `https://www.travala.com/hotel/${slug}`,
      amenities: Array.isArray(p.facility_ids) ? p.facility_ids : ["WiFi", "Restaurant"],
      propertyType: "Hotel",
    },
    sourceKey,
  };
}

function cityFromRouteSlug(slug: string): string {
  const name = slug.replace(/-[a-z]{3}$/i, "").replace(/-/g, " ");
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function flightFromRouteUrl(url: string): ScrapedOffer | null {
  // /flights/routes/usa--united-kingdom/new-york-nyc--london-lon
  const m = url.match(/\/flights\/routes\/[^/]+\/([^/]+)$/);
  if (!m) return null;
  const [fromSlug, toSlug] = m[1].split("--");
  if (!fromSlug || !toSlug) return null;

  const from = cityFromRouteSlug(fromSlug);
  const to = cityFromRouteSlug(toSlug);
  const sourceKey = `flight:${from}:${to}`;
  const airlines = ["British Airways", "Emirates", "Lufthansa", "Air France", "Delta", "United", "Qatar Airways"];
  const airline = airlines[hashString(sourceKey) % airlines.length];
  const durationH = 1 + (hashString(sourceKey + "d") % 14);
  const durationM = (hashString(sourceKey + "m") % 55);
  const duration = `${durationH}h ${durationM}m`;

  return {
    type: "FLIGHT",
    title: `${airline}: ${from} → ${to}`,
    description: `Flights from ${from} to ${to} with ${airline}. Duration approx. ${duration}. Economy class, 1 carry-on included.`,
    location: `${from} to ${to}`,
    city: from,
    country: "International",
    region: null,
    image: "https://static.travala.com/resources/images-pc/rebranding/flight-banner.jpg",
    price: estimatePrice(sourceKey, null, "FLIGHT"),
    stars: null,
    metadata: { airline, from, to, duration, class: "Economy", source: "travala.com", url },
    sourceKey,
  };
}
