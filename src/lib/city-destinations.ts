import { normalizeSearchQuery } from "./search-query";

export type CanonicalDestination = {
  keys: string[];
  label: string;
  subtitle: string;
  searchQuery: string;
  city: string;
  country: string;
  liveUrl: string;
  searchTerms: string[];
};

export const CANONICAL_DESTINATIONS: CanonicalDestination[] = [
  {
    keys: ["tenerife", "teneriffa"],
    label: "Tenerife",
    subtitle: "Spain",
    searchQuery: "Tenerife",
    city: "Santa Cruz de Tenerife",
    country: "Spain",
    liveUrl: "https://www.travala.com/hotels/spain/canary-islands/santa-cruz-de-tenerife",
    searchTerms: [
      "Tenerife",
      "Santa Cruz de Tenerife",
      "Los Cristianos",
      "Arona",
      "Adeje",
      "Playa de las Americas",
      "Costa Adeje",
      "Puerto de la Cruz",
    ],
  },
];

export function normalizeDestinationKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function matchCanonicalDestination(raw: string): CanonicalDestination | null {
  const key = normalizeDestinationKey(normalizeSearchQuery(raw) || raw);
  if (!key) return null;

  for (const dest of CANONICAL_DESTINATIONS) {
    if (dest.keys.some((alias) => alias === key)) return dest;
  }

  for (const dest of CANONICAL_DESTINATIONS) {
    if (dest.keys.some((alias) => key.includes(alias) || alias.includes(key))) return dest;
  }

  return null;
}

export function expandCanonicalSearchTerms(raw: string): string[] {
  const canonical = matchCanonicalDestination(raw);
  if (!canonical) return [];
  return canonical.searchTerms;
}

export function liveUrlForDestination(raw: string, country?: string, city?: string): string | null {
  const canonical = matchCanonicalDestination(raw) || matchCanonicalDestination(city || "") || matchCanonicalDestination(country || "");
  if (canonical) return canonical.liveUrl;

  const c = (city || normalizeSearchQuery(raw) || raw).trim();
  const co = (country || "").trim();
  if (!c || !co) return null;

  const countrySlug = co.toLowerCase().replace(/\s+/g, "-");
  const citySlug = c.toLowerCase().replace(/\s+/g, "-");
  if (countrySlug === "spain" && citySlug.includes("tenerife")) {
    return "https://www.travala.com/hotels/spain/canary-islands/santa-cruz-de-tenerife";
  }

  return null;
}

export function canonicalToSuggestion(dest: CanonicalDestination) {
  return {
    id: `canonical-${dest.keys[0]}`,
    label: dest.label,
    subtitle: dest.subtitle,
    kind: "city" as const,
    query: `${dest.label}, ${dest.subtitle}`,
    searchQuery: dest.searchQuery,
    country: dest.country,
    city: dest.city,
    liveUrl: dest.liveUrl,
  };
}
