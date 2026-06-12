import { travalaApiHeaders } from "./travala-headers";

const TRAVALA_API = "https://api.travala.com";

export type TravalaResponse = {
  success?: boolean;
  data?: unknown;
  meta?: Record<string, unknown>;
};

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export function roomParams(guests: number, rooms: number): Record<string, number> {
  const params: Record<string, number> = {};
  const adultsPerRoom = Math.max(1, Math.ceil(guests / rooms));
  for (let i = 1; i <= Math.min(rooms, 4); i++) {
    params[`r${i}`] = adultsPerRoom;
  }
  return params;
}

export async function travalaGet(
  path: string,
  params: Record<string, string | number | boolean>,
  opts?: { timeoutMs?: number; cacheSeconds?: number },
) {
  const url = new URL(`${TRAVALA_API}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url, {
    headers: travalaApiHeaders(),
    signal: opts?.timeoutMs ? AbortSignal.timeout(opts.timeoutMs) : undefined,
    next: { revalidate: opts?.cacheSeconds ?? 300 },
  });

  if (!res.ok) return null;
  try {
    return (await res.json()) as TravalaResponse;
  } catch {
    return null;
  }
}

export async function travalaSessionId(
  slug: string,
  checkIn: string,
  checkOut: string,
  guests: number,
  rooms: number
): Promise<string | null> {
  const sessionRes = await travalaGet("searching/search/search-property", {
    slug,
    check_in: checkIn,
    check_out: checkOut,
    ...roomParams(guests, rooms),
  });
  return typeof sessionRes?.data === "string" ? sessionRes.data : null;
}

export async function travalaPackages(
  slug: string,
  sessionId: string
): Promise<TravalaResponse | null> {
  return travalaGet("searching/package/get_package", {
    slug,
    session_id: sessionId,
    user_currency_showing: "USD",
    limit_image_rth: "V1",
    merge_room: true,
    entravel_multiple_offers_enabled: false,
    entravel_b2c_enable: false,
    origin: false,
  });
}

/** Extract all room/property image URLs from Travala get_package API response. */
export function extractPackagePhotos(pkgData: unknown): string[] {
  if (!Array.isArray(pkgData)) return [];

  const urls: string[] = [];
  for (const pkg of pkgData) {
    const results = (pkg as { results?: Record<string, unknown>[] }).results || [];
    for (const result of results) {
      const bedGroups = (result.bed_groups as { images?: string[] }[] | undefined) || [];
      for (const group of bedGroups) {
        if (Array.isArray(group.images)) {
          urls.push(...group.images.filter((url): url is string => Boolean(url)));
        }
      }
    }
  }
  return [...new Set(urls)];
}

export async function fetchTravalaHotelPhotosFromApi(input: {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  rooms?: number;
}): Promise<string[]> {
  const guests = input.guests ?? 2;
  const rooms = input.rooms ?? 1;
  const sessionId = await travalaSessionId(
    input.slug,
    input.checkIn,
    input.checkOut,
    guests,
    rooms,
  );
  if (!sessionId) return [];

  const pkgRes = await travalaPackages(input.slug, sessionId);
  if (!pkgRes?.success) return [];
  return extractPackagePhotos(pkgRes.data);
}

export function usdPerNight(item: Record<string, unknown> | undefined): number | null {
  if (!item) return null;
  const perNight = item.prices_per_night_room_units as { USD?: number } | undefined;
  if (perNight?.USD) return perNight.USD;
  const discountNight = item.prices_discount_per_night_all_units as { USD?: number } | undefined;
  if (discountNight?.USD) return discountNight.USD;
  const withoutTax = item.price_without_tax as { price_per_night?: { USD?: number } } | undefined;
  if (withoutTax?.price_per_night?.USD) return withoutTax.price_per_night.USD;
  const allInclusive = item.price_all_inclusive as { price_per_night?: { USD?: number } } | undefined;
  if (allInclusive?.price_per_night?.USD) return allInclusive.price_per_night.USD;
  return null;
}

export function usdTotal(item: Record<string, unknown> | undefined): number | null {
  if (!item) return null;
  const all = item.prices_discount_all_units as { USD?: number } | undefined;
  if (all?.USD) return all.USD;
  const prices = item.prices_all_units as { USD?: number } | undefined;
  return prices?.USD ?? null;
}
