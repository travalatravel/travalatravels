import type { SearchSuggestion } from "@/lib/travala-suggest";
import {
  CANONICAL_DESTINATIONS,
  canonicalToSuggestion,
  matchCanonicalDestination,
  normalizeDestinationKey,
} from "@/lib/city-destinations";

/** Instant city suggestions for hotel/stays search */
export const POPULAR_CITIES: SearchSuggestion[] = CANONICAL_DESTINATIONS.slice(0, 16).map((dest) =>
  canonicalToSuggestion(dest),
);

export function filterPopularCities(query: string, limit = 12): SearchSuggestion[] {
  const q = query.trim();
  if (!q) return POPULAR_CITIES.slice(0, limit);

  const canonical = matchCanonicalDestination(q);
  if (canonical) {
    return [canonicalToSuggestion(canonical)];
  }

  const qNorm = normalizeDestinationKey(q);
  return CANONICAL_DESTINATIONS.filter((dest) => {
    const hay = [dest.label, dest.subtitle, dest.searchQuery, ...dest.keys, ...dest.searchTerms]
      .map((part) => normalizeDestinationKey(part))
      .join(" ");
    return hay.includes(qNorm) || dest.keys.some((key) => normalizeDestinationKey(key).startsWith(qNorm));
  })
    .slice(0, limit)
    .map((dest) => canonicalToSuggestion(dest));
}
