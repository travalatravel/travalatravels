import { travalaApiHeaders, travalaHtmlHeaders } from "./travala-headers";
import { prisma } from "./prisma";
import { estimateHotelNightlyPrice } from "./hotel-pricing";
import { normalizeSearchQuery } from "./search-query";
import { liveUrlForDestination, resolveDestinationFromAutocomplete } from "./city-destinations";

const TRAVALA_BASE = "https://www.travala.com";
const FETCH_TIMEOUT_MS = 8000;

const COUNTRY_NAMES = new Set(
  [
    "germany",
    "deutschland",
    "usa",
    "united states",
    "uk",
    "united kingdom",
    "england",
    "france",
    "spain",
    "italy",
    "thailand",
    "japan",
    "australia",
    "canada",
    "brazil",
    "mexico",
    "india",
    "indonesia",
    "turkey",
    "greece",
    "portugal",
    "vietnam",
    "china",
    "croatia",
    "netherlands",
    "switzerland",
    "austria",
    "singapore",
    "malaysia",
    "philippines",
    "south korea",
    "uae",
    "dubai",
  ].map((s) => s.toLowerCase()),
);

async function fetchHtml(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: travalaHtmlHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function isCountryQuery(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  if (COUNTRY_NAMES.has(q)) return true;
  const slug = q.replace(/\s+/g, "-");
  return COUNTRY_NAMES.has(slug);
}

export type LiveHotel = {
  type: "HOTEL";
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
};

function extractNextData(html: string): Record<string, unknown> | null {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    const data = JSON.parse(m[1]) as { props?: { pageProps?: Record<string, unknown> } };
    return data.props?.pageProps ?? null;
  } catch {
    return null;
  }
}

function hotelIdFromSlug(slug: string): string {
  const m = slug.match(/-(\d+)$/);
  return m ? m[1] : slug;
}

function regionFromCountry(code: string | null, name: string): string | null {
  const c = (code || "").toUpperCase();
  if (["TH", "SG", "JP", "KR", "CN", "IN", "ID", "MY"].includes(c)) return "asia";
  if (["US", "CA", "MX"].includes(c)) return "north-america";
  if (["GB", "DE", "FR", "ES", "IT", "NL", "AT", "CH"].includes(c)) return "europe";
  if (["AE", "SA", "QA"].includes(c)) return "middle-east";
  if (["AU", "NZ"].includes(c)) return "oceania";
  const n = name.toLowerCase();
  if (/thailand|singapore|japan|korea|asia|bangkok|phuket/.test(n)) return "asia";
  return null;
}

function propertyToOffer(
  p: Record<string, unknown>,
  ctx: { city: string; country: string; countryCode?: string | null }
): LiveHotel | null {
  const slug = String(p.slug || "");
  const name = String(p.name || "");
  if (!slug || !name) return null;

  const stars =
    typeof p.star === "number" ? p.star : typeof p.star_rating === "number" ? p.star_rating : null;
  const thumbnail = String(p.thumbnail || p.photo || "");
  const city = String(p.city_name || ctx.city);
  const country = String(p.country_name || ctx.country);
  const countryCode = String(p.country_code || ctx.countryCode || "");
  const id = hotelIdFromSlug(slug);
  const basePrice = estimateHotelNightlyPrice({
    key: `hotel:${id}`,
    stars,
    city,
    country,
  });

  return {
    type: "HOTEL",
    title: name,
    description: `${name} in ${city}, ${country}.`,
    location: `${city}, ${country}`,
    city,
    country,
    region: regionFromCountry(countryCode || null, country),
    image: thumbnail || "https://static.travala.com/destination/Asia/bangkok.jpg",
    price: basePrice,
    stars,
    metadata: {
      travalaSlug: slug,
      travalaId: id,
      source: "travala.com",
      url: `${TRAVALA_BASE}/hotel/${slug}`,
      live: true,
    },
  };
}

let worldwideCache: {
  at: number;
  urls: Array<{ label: string; url: string }>;
} | null = null;

async function getWorldwideCityUrls(): Promise<Array<{ label: string; url: string }>> {
  if (worldwideCache && Date.now() - worldwideCache.at < 1000 * 60 * 60) {
    return worldwideCache.urls;
  }

  const html = await fetchHtml(TRAVALA_BASE, 10000);
  if (!html) return [];
  const props = extractNextData(html);
  const countries =
    (props?.newWorldwideLocations as {
      countries?: Array<{
        country_name: string;
        regions?: Array<{
          region_slug?: string;
          cities?: Array<{ city_slug: string; city_name: string }>;
        }>;
      }>;
    })?.countries || [];

  const urls: Array<{ label: string; url: string }> = [];
  for (const country of countries) {
    const cslug = country.country_name.toLowerCase().replace(/\s+/g, "-");
    for (const region of country.regions || []) {
      for (const c of region.cities || []) {
        urls.push({
          label: `${c.city_name} ${country.country_name}`,
          url: `${TRAVALA_BASE}/hotels/${cslug}/${region.region_slug || "region"}/${c.city_slug}`,
        });
      }
    }
  }

  worldwideCache = { at: Date.now(), urls };
  return urls;
}

function slugifyCountry(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

async function findCountryPageUrl(query: string): Promise<string | null> {
  const q = (normalizeSearchQuery(query) || query).trim().toLowerCase();
  if (!q) return null;
  const slug = slugifyCountry(q);
  return `${TRAVALA_BASE}/hotels/${slug}`;
}

async function fetchHotelsFromCountryPage(url: string): Promise<LiveHotel[]> {
  const html = await fetchHtml(url);
  if (!html) return [];

  const props = extractNextData(html);
  if (!props) return [];

  const loc = props?.locationInfo as {
    city_name?: string;
    country_name?: string;
    country_code?: string;
  };
  const countryName = loc?.country_name || url.split("/hotels/")[1]?.replace(/-/g, " ") || "International";
  const ctx = {
    city: loc?.city_name || countryName,
    country: countryName,
    countryCode: loc?.country_code || null,
  };

  const hotels: LiveHotel[] = [];
  const seen = new Set<string>();

  const arrays = [
    (props?.cityPropertyData as Record<string, unknown> | undefined)?.explore_properties,
    (props?.cityPropertyData as Record<string, unknown> | undefined)?.top_picks,
    (props?.countryPropertyData as Record<string, unknown> | undefined)?.explore_properties,
    (props?.countryPropertyData as Record<string, unknown> | undefined)?.top_picks,
    (props?.staticProperty as { properties?: unknown[] })?.properties,
    props?.explore_properties,
    props?.top_picks,
  ];

  for (const arr of arrays) {
    if (!Array.isArray(arr)) continue;
    for (const raw of arr) {
      const p = raw as Record<string, unknown>;
      const slug = String(p.slug || "");
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const offer = propertyToOffer(
        p.name ? p : { ...p, name: String(p.name || slug.replace(/-\d+$/, "").replace(/-/g, " ")) },
        ctx,
      );
      if (offer) hotels.push(offer);
    }
  }
  return hotels;
}

export async function fetchLiveHotelsForQuery(
  query: string,
  options?: { country?: string; city?: string; liveUrl?: string },
): Promise<LiveHotel[]> {
  const primary = normalizeSearchQuery(options?.city || query) || query.trim();
  if (!primary) return [];

  const directUrl =
    options?.liveUrl || liveUrlForDestination(query, options?.country, options?.city);
  if (directUrl) {
    const directHotels = await fetchHotelsFromCityPage(directUrl);
    if (directHotels.length) return directHotels;
  }

  const resolved = await resolveDestinationFromAutocomplete(query);
  if (resolved?.liveUrl && resolved.liveUrl !== directUrl) {
    const resolvedHotels = await fetchHotelsFromCityPage(resolved.liveUrl);
    if (resolvedHotels.length) return resolvedHotels;
  }

  const countryUrl = await findCountryPageUrl(primary);
  if (countryUrl) {
    const countryHotels = await fetchHotelsFromCountryPage(countryUrl);
    if (countryHotels.length) return countryHotels;
  }

  if (isCountryQuery(primary)) return [];

  const cityUrl = await findCityPageUrl(primary);
  if (cityUrl) {
    const cityHotels = await fetchHotelsFromCityPage(cityUrl);
    if (cityHotels.length) return cityHotels;
  }

  return [];
}

async function findCityPageUrl(query: string): Promise<string | null> {
  const q = (normalizeSearchQuery(query) || query).trim().toLowerCase();
  if (!q) return null;

  const cities = await getWorldwideCityUrls();
  const slugQ = q.replace(/\s+/g, "-");

  const exact = cities.find(
    (c) => c.label.toLowerCase().startsWith(q) || c.url.toLowerCase().includes(`/${slugQ}`)
  );
  if (exact) return exact.url;

  const partial = cities.find(
    (c) => c.label.toLowerCase().includes(q) || c.url.toLowerCase().includes(slugQ)
  );
  return partial?.url ?? null;
}

async function fetchHotelsFromCityPage(url: string): Promise<LiveHotel[]> {
  const html = await fetchHtml(url);
  if (!html) return [];

  const props = extractNextData(html);
  const cpd = props?.cityPropertyData as Record<string, unknown> | undefined;
  if (!cpd) return [];

  const loc = props?.locationInfo as {
    city_name?: string;
    country_name?: string;
    country_code?: string;
  };
  const ctx = {
    city: loc?.city_name || "Unknown",
    country: loc?.country_name || "International",
    countryCode: loc?.country_code || null,
  };

  const hotels: LiveHotel[] = [];
  const arrays = [
    cpd.explore_properties,
    cpd.recently_booked_properties,
    cpd.top_picks,
    (cpd.static_property as { properties?: unknown[] })?.properties,
    cpd.all_hotels,
  ];

  const seen = new Set<string>();
  for (const arr of arrays) {
    if (!Array.isArray(arr)) continue;
    for (const raw of arr) {
      const p = raw as Record<string, unknown>;
      const slug = String(p.slug || "");
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const offer = propertyToOffer(
        p.name ? p : { ...p, name: String(p.name || slug.replace(/-\d+$/, "").replace(/-/g, " ")) },
        ctx
      );
      if (offer) hotels.push(offer);
    }
  }
  return hotels;
}

export async function upsertLiveHotels(hotels: LiveHotel[]) {
  for (const h of hotels) {
    const existing = await prisma.offer.findFirst({
      where: {
        OR: [
          { title: h.title, city: h.city },
          { metadata: { contains: String(h.metadata.travalaSlug || "") } },
        ],
      },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.offer.create({
      data: {
        type: h.type,
        title: h.title,
        description: h.description,
        location: h.location,
        city: h.city,
        country: h.country,
        region: h.region,
        image: h.image,
        price: h.price,
        stars: h.stars,
        metadata: JSON.stringify(h.metadata),
      },
    });
  }
}

export async function supplementHotelSearch(query: string, localCount: number): Promise<number> {
  const primary = normalizeSearchQuery(query) || query.trim();
  if (!primary || localCount >= 30) return localCount;

  try {
    const hotels = await fetchLiveHotelsForQuery(primary);
    if (!hotels.length) return localCount;

    await upsertLiveHotels(hotels.slice(0, 120));
    return localCount + hotels.length;
  } catch {
    return localCount;
  }
}
