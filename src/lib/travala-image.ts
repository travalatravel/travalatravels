import type { OfferType } from "@/lib/types";
import { fetchTravalaHotelPhotosFromApi } from "./travala-api";
import { travalaHtmlHeaders } from "./travala-headers";

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
    headers: travalaHtmlHeaders(),
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

type HotelImageV2 = {
  large_url?: string;
  medium_url?: string;
  thumbnail_url?: string;
};

function extractPhotosFromHotelProps(hotel: Record<string, unknown>): string[] {
  const urls: string[] = [];

  const photos = hotel.photos as string[] | undefined;
  if (photos?.length) urls.push(...photos.filter(Boolean));

  const imagesV2 = hotel.images_v2 as HotelImageV2[] | undefined;
  if (Array.isArray(imagesV2)) {
    for (const img of imagesV2) {
      if (img.large_url) urls.push(img.large_url);
      else if (img.medium_url) urls.push(img.medium_url);
      else if (img.thumbnail_url) urls.push(img.thumbnail_url);
    }
  }

  if (typeof hotel.featured_image === "string" && hotel.featured_image) {
    urls.push(hotel.featured_image);
  }

  return [...new Set(urls)];
}

export async function fetchTravalaHotelPhotosFromPage(slug: string): Promise<string[]> {
  const props = await fetchTravalaHotelPage(slug);
  const hotel = props?.hotelInformationProps as Record<string, unknown> | undefined;
  if (!hotel) return [];
  return extractPhotosFromHotelProps(hotel);
}

export async function fetchTravalaHotelPhotos(
  slug: string,
  opts?: { checkIn?: string; checkOut?: string; guests?: number; rooms?: number },
): Promise<string[]> {
  const pagePhotos = await fetchTravalaHotelPhotosFromPage(slug);

  let apiPhotos: string[] = [];
  if (opts?.checkIn && opts?.checkOut) {
    apiPhotos = await fetchTravalaHotelPhotosFromApi({
      slug,
      checkIn: opts.checkIn,
      checkOut: opts.checkOut,
      guests: opts.guests,
      rooms: opts.rooms,
    });
  }

  return [...new Set([...apiPhotos, ...pagePhotos])];
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
  opts: {
    slug?: string | null;
    url?: string | null;
    city?: string | null;
    country?: string | null;
    checkIn?: string | null;
    checkOut?: string | null;
    guests?: number;
    rooms?: number;
  },
): Promise<string[]> {
  switch (type) {
    case "HOTEL":
      return opts.slug
        ? fetchTravalaHotelPhotos(opts.slug, {
            checkIn: opts.checkIn || undefined,
            checkOut: opts.checkOut || undefined,
            guests: opts.guests,
            rooms: opts.rooms,
          })
        : [];
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
  if (type === "HOTEL") return Boolean(travalaSlugFromOffer(metadata));
  if (!isGenericTravalaImage(url)) return false;

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
