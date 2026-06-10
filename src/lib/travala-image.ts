import type { OfferType } from "@/lib/types";

const TRAVALA_BASE = "https://www.travala.com";

type DestinationRow = {
  name?: string;
  image?: string;
  country?: string;
};

type PropertyRow = {
  thumbnail?: string;
  photo?: string;
};

type DestinationGroup = {
  destination?: DestinationRow[];
  popular_properties?: PropertyRow[];
};

let activitiesCityCache: { at: number; photos: Map<string, string[]> } | null = null;
const ACTIVITIES_CACHE_TTL = 1000 * 60 * 60 * 24;

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

function normalizeCityKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

async function fetchTravalaHtml(pathOrUrl: string): Promise<string | null> {
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${TRAVALA_BASE}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TravalaClone/1.0)",
      Accept: "text/html",
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  return res.text();
}

export async function fetchTravalaPage(pathOrUrl: string): Promise<Record<string, unknown> | null> {
  const html = await fetchTravalaHtml(pathOrUrl);
  if (!html) return null;
  return extractNextData(html);
}

export async function fetchTravalaHotelPage(slug: string): Promise<Record<string, unknown> | null> {
  return fetchTravalaPage(`/hotel/${slug}`);
}

export async function fetchTravalaHotelPhotos(slug: string): Promise<string[]> {
  const props = await fetchTravalaHotelPage(slug);
  const hotel = props?.hotelInformationProps as { photos?: string[] } | undefined;
  const photos = (hotel?.photos || []).filter(Boolean);
  return [...new Set(photos)];
}

export async function fetchTravalaHotelImage(slug: string): Promise<string | null> {
  const photos = await fetchTravalaHotelPhotos(slug);
  return photos[0] ?? null;
}

export async function fetchTravalaFlightPhotos(routeUrl: string): Promise<string[]> {
  const props = await fetchTravalaPage(routeUrl);
  if (!props) return [];

  const flightData = props.flightData as
    | {
        destinationTopHotels?: Array<{ thumbnail?: string; photo?: string }>;
      }
    | undefined;

  const photos = (flightData?.destinationTopHotels || [])
    .flatMap((hotel) => [hotel.thumbnail, hotel.photo])
    .filter((url): url is string => Boolean(url));

  return [...new Set(photos)];
}

async function loadActivitiesCityPhotos(): Promise<Map<string, string[]>> {
  if (activitiesCityCache && Date.now() - activitiesCityCache.at < ACTIVITIES_CACHE_TTL) {
    return activitiesCityCache.photos;
  }

  const props = await fetchTravalaPage("/activities");
  const map = new Map<string, string[]>();

  if (props?.homeData) {
    const homeData = props.homeData as {
      popular_destination_group?: DestinationGroup[];
      global_popular_destinations?: DestinationRow[];
    };

    for (const group of homeData.popular_destination_group || []) {
      const propertyPhotos = (group.popular_properties || [])
        .flatMap((property) => [property.thumbnail, property.photo])
        .filter((url): url is string => Boolean(url));

      for (const destination of group.destination || []) {
        if (!destination.name) continue;
        const key = normalizeCityKey(destination.name);
        const existing = map.get(key) || [];
        const next = [...existing];
        if (destination.image) next.push(destination.image);
        next.push(...propertyPhotos);
        map.set(key, [...new Set(next)]);
      }
    }

    for (const destination of homeData.global_popular_destinations || []) {
      if (!destination.name || !destination.image) continue;
      const key = normalizeCityKey(destination.name);
      const existing = map.get(key) || [];
      map.set(key, [...new Set([...existing, destination.image])]);
    }
  }

  activitiesCityCache = { at: Date.now(), photos: map };
  return map;
}

export async function fetchTravalaCityPhotos(city?: string | null, country?: string | null): Promise<string[]> {
  if (!city?.trim()) return [];

  const map = await loadActivitiesCityPhotos();
  const cityKey = normalizeCityKey(city);
  let photos = map.get(cityKey) || [];

  if (!photos.length && country) {
    photos = map.get(normalizeCityKey(country)) || [];
  }

  return [...new Set(photos)];
}

export async function fetchOfferPhotos(
  type: OfferType,
  opts: { slug?: string | null; url?: string | null; city?: string | null; country?: string | null },
): Promise<string[]> {
  switch (type) {
    case "HOTEL":
      return opts.slug ? fetchTravalaHotelPhotos(opts.slug) : [];
    case "FLIGHT":
      return opts.url ? fetchTravalaFlightPhotos(opts.url) : [];
    case "CAR_RENTAL":
    case "ACTIVITY":
      return fetchTravalaCityPhotos(opts.city, opts.country);
    default:
      return [];
  }
}

export function isGenericTravalaImage(url: string): boolean {
  if (!url) return true;
  if (url.includes("i.travelapi.com")) return false;
  if (url.includes("/photo/hotel/")) return false;
  if (url.includes("flight-banner")) return true;
  if (url.includes("static.travala.com/destination/")) return true;
  if (url.includes("statics.travala.com/destination/")) return true;
  if (url.includes("/resources/images")) return true;
  return false;
}

export function shouldResolveOfferImage(
  url: string,
  type: OfferType,
  metadata: string | null,
  city?: string | null,
): boolean {
  if (!isGenericTravalaImage(url)) return false;

  if (type === "HOTEL") return Boolean(travalaSlugFromOffer(metadata));
  if (type === "FLIGHT") return Boolean(travalaRouteUrlFromOffer(metadata));
  if (type === "CAR_RENTAL" || type === "ACTIVITY") return Boolean(city?.trim());
  return false;
}

export function parseOfferMetadata(metadata: string | null): Record<string, unknown> {
  if (!metadata) return {};
  try {
    return JSON.parse(metadata) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function travalaSlugFromOffer(metadata: string | null): string | null {
  const meta = parseOfferMetadata(metadata);
  if (typeof meta.travalaSlug === "string" && meta.travalaSlug) return meta.travalaSlug;
  if (typeof meta.url === "string") {
    const m = meta.url.match(/\/hotel\/([^/?#]+)/);
    if (m) return m[1];
  }
  return null;
}

export function travalaRouteUrlFromOffer(metadata: string | null): string | null {
  const meta = parseOfferMetadata(metadata);
  if (typeof meta.url !== "string" || !meta.url.includes("/flights/")) return null;
  return meta.url;
}
