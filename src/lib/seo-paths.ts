import { slugForHotelName } from "@/data/featured-hotel-slugs";

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function hotelsCountryPath(country: string): string {
  return `/hotels/${slugify(country)}`;
}

export function hotelsCityPath(country: string, city: string): string {
  return `/hotels/${slugify(country)}/${slugify(city)}`;
}

export function hotelDetailPath(slug: string): string {
  return `/hotel/${slug}`;
}

export function propertyTypePath(slug: string): string {
  return `/${slug}`;
}

const COUNTRY_SLUGS = new Set([
  "germany",
  "deutschland",
  "usa",
  "united-states",
  "uk",
  "united-kingdom",
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
]);

export function featuredHotelPath(name: string): string {
  const slug = slugForHotelName(name);
  if (slug) return hotelDetailPath(slug);
  return searchStaysPath(name);
}

export function searchStaysPath(query?: string): string {
  if (!query) return "/search?type=stays";
  const hotelSlug = slugForHotelName(query);
  if (hotelSlug) return hotelDetailPath(hotelSlug);
  const slug = slugify(query);
  if (COUNTRY_SLUGS.has(slug)) return hotelsCountryPath(query);
  return `/search?type=stays&q=${encodeURIComponent(query)}`;
}
