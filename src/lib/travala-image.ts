const TRAVALA_BASE = "https://www.travala.com";

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

export function photoFromPageProps(props: Record<string, unknown> | null): string | null {
  if (!props) return null;
  const hotel = props.hotelInformationProps as { photos?: string[] } | undefined;
  if (hotel?.photos?.[0]) return hotel.photos[0];

  const cpd = props.cityPropertyData as Record<string, unknown> | undefined;
  if (!cpd) return null;

  const arrays = [
    cpd.explore_properties,
    cpd.recently_booked_properties,
    cpd.top_picks,
    (cpd.static_property as { properties?: Array<{ slug?: string; photo?: string; thumbnail?: string }> })?.properties,
  ];

  return null;
}

export function photoForSlugFromProps(
  props: Record<string, unknown> | null,
  slug: string
): string | null {
  const direct = photoFromPageProps(props);
  if (direct) return direct;

  if (!props?.cityPropertyData) return null;
  const cpd = props.cityPropertyData as Record<string, unknown>;

  const lists = [
    cpd.explore_properties,
    cpd.recently_booked_properties,
    cpd.top_picks,
    (cpd.static_property as { properties?: Array<{ slug?: string; photo?: string; thumbnail?: string }> })?.properties,
  ];

  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    const hit = list.find((p) => p.slug === slug);
    if (hit?.thumbnail) return hit.thumbnail;
    if (hit?.photo) return hit.photo;
  }
  return null;
}

export async function fetchTravalaHotelPage(slug: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${TRAVALA_BASE}/hotel/${slug}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TravalaClone/1.0)",
      Accept: "text/html",
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const html = await res.text();
  return extractNextData(html);
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

export function isGenericTravalaImage(url: string): boolean {
  if (!url) return true;
  if (url.includes("i.travelapi.com")) return false;
  if (url.includes("/photo/hotel/")) return false;
  if (url.includes("/resources/images")) return false;
  return url.includes("static.travala.com/destination/") || url.includes("statics.travala.com/destination/");
}

export function parseOfferMetadata(metadata: string | null): Record<string, unknown> {
  if (!metadata) return {};
  try {
    return JSON.parse(metadata) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function travalaSlugFromOffer(metadata: string | null, title?: string): string | null {
  const meta = parseOfferMetadata(metadata);
  if (typeof meta.travalaSlug === "string" && meta.travalaSlug) return meta.travalaSlug;
  if (typeof meta.url === "string") {
    const m = meta.url.match(/\/hotel\/([^/?#]+)/);
    if (m) return m[1];
  }
  return null;
}
