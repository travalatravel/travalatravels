import { travalaApiHeaders } from "./travala-headers";
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

/** Top destinations with DE/EN aliases and direct Travala city page URLs. */
export const CANONICAL_DESTINATIONS: CanonicalDestination[] = [
  {
    keys: ["munich", "munchen", "muenchen", "münchen"],
    label: "Munich",
    subtitle: "Germany",
    searchQuery: "Munich",
    city: "Munich",
    country: "Germany",
    liveUrl: "https://www.travala.com/hotels/germany/bavaria/munich",
    searchTerms: ["Munich", "München", "Munchen"],
  },
  {
    keys: ["berlin"],
    label: "Berlin",
    subtitle: "Germany",
    searchQuery: "Berlin",
    city: "Berlin",
    country: "Germany",
    liveUrl: "https://www.travala.com/hotels/germany/berlin/berlin",
    searchTerms: ["Berlin"],
  },
  {
    keys: ["hamburg"],
    label: "Hamburg",
    subtitle: "Germany",
    searchQuery: "Hamburg",
    city: "Hamburg",
    country: "Germany",
    liveUrl: "https://www.travala.com/hotels/germany/hamburg/hamburg",
    searchTerms: ["Hamburg"],
  },
  {
    keys: ["cologne", "koln", "koeln", "köln"],
    label: "Cologne",
    subtitle: "Germany",
    searchQuery: "Cologne",
    city: "Cologne",
    country: "Germany",
    liveUrl: "https://www.travala.com/hotels/germany/north-rhine-westphalia/cologne",
    searchTerms: ["Cologne", "Köln", "Koln"],
  },
  {
    keys: ["frankfurt"],
    label: "Frankfurt",
    subtitle: "Germany",
    searchQuery: "Frankfurt",
    city: "Frankfurt",
    country: "Germany",
    liveUrl: "https://www.travala.com/hotels/germany/hesse/frankfurt",
    searchTerms: ["Frankfurt"],
  },
  {
    keys: ["dusseldorf", "duesseldorf", "düsseldorf"],
    label: "Düsseldorf",
    subtitle: "Germany",
    searchQuery: "Düsseldorf",
    city: "Düsseldorf",
    country: "Germany",
    liveUrl: "https://www.travala.com/hotels/germany/north-rhine-westphalia/dusseldorf",
    searchTerms: ["Düsseldorf", "Dusseldorf"],
  },
  {
    keys: ["nuremberg", "nurnberg", "nuernberg", "nürnberg"],
    label: "Nuremberg",
    subtitle: "Germany",
    searchQuery: "Nuremberg",
    city: "Nuremberg",
    country: "Germany",
    liveUrl: "https://www.travala.com/hotels/germany/bavaria/nuremberg",
    searchTerms: ["Nuremberg", "Nürnberg"],
  },
  {
    keys: ["vienna", "wien"],
    label: "Vienna",
    subtitle: "Austria",
    searchQuery: "Vienna",
    city: "Vienna",
    country: "Austria",
    liveUrl: "https://www.travala.com/hotels/austria/vienna-and-vicinity-/vienna",
    searchTerms: ["Vienna", "Wien"],
  },
  {
    keys: ["zurich", "zürich"],
    label: "Zurich",
    subtitle: "Switzerland",
    searchQuery: "Zurich",
    city: "Zurich",
    country: "Switzerland",
    liveUrl: "https://www.travala.com/hotels/switzerland/zurich/zurich",
    searchTerms: ["Zurich", "Zürich"],
  },
  {
    keys: ["paris"],
    label: "Paris",
    subtitle: "France",
    searchQuery: "Paris",
    city: "Paris",
    country: "France",
    liveUrl: "https://www.travala.com/hotels/france/ile-de-france/paris",
    searchTerms: ["Paris"],
  },
  {
    keys: ["london"],
    label: "London",
    subtitle: "United Kingdom",
    searchQuery: "London",
    city: "London",
    country: "United Kingdom",
    liveUrl: "https://www.travala.com/hotels/united-kingdom/england/london",
    searchTerms: ["London"],
  },
  {
    keys: ["amsterdam"],
    label: "Amsterdam",
    subtitle: "Netherlands",
    searchQuery: "Amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    liveUrl: "https://www.travala.com/hotels/netherlands/north-holland/amsterdam",
    searchTerms: ["Amsterdam"],
  },
  {
    keys: ["barcelona"],
    label: "Barcelona",
    subtitle: "Spain",
    searchQuery: "Barcelona",
    city: "Barcelona",
    country: "Spain",
    liveUrl: "https://www.travala.com/hotels/spain/catalonia/barcelona",
    searchTerms: ["Barcelona"],
  },
  {
    keys: ["madrid"],
    label: "Madrid",
    subtitle: "Spain",
    searchQuery: "Madrid",
    city: "Madrid",
    country: "Spain",
    liveUrl: "https://www.travala.com/hotels/spain/community-of-madrid/madrid",
    searchTerms: ["Madrid"],
  },
  {
    keys: ["rome", "rom"],
    label: "Rome",
    subtitle: "Italy",
    searchQuery: "Rome",
    city: "Rome",
    country: "Italy",
    liveUrl: "https://www.travala.com/hotels/italy/lazio/rome",
    searchTerms: ["Rome", "Rom"],
  },
  {
    keys: ["milan", "mailand"],
    label: "Milan",
    subtitle: "Italy",
    searchQuery: "Milan",
    city: "Milan",
    country: "Italy",
    liveUrl: "https://www.travala.com/hotels/italy/lombardy/milan",
    searchTerms: ["Milan", "Mailand"],
  },
  {
    keys: ["florence", "florenz"],
    label: "Florence",
    subtitle: "Italy",
    searchQuery: "Florence",
    city: "Florence",
    country: "Italy",
    liveUrl: "https://www.travala.com/hotels/italy/tuscany/florence",
    searchTerms: ["Florence", "Florenz"],
  },
  {
    keys: ["lisbon", "lissabon"],
    label: "Lisbon",
    subtitle: "Portugal",
    searchQuery: "Lisbon",
    city: "Lisbon",
    country: "Portugal",
    liveUrl: "https://www.travala.com/hotels/portugal/lisbon/lisbon",
    searchTerms: ["Lisbon", "Lissabon"],
  },
  {
    keys: ["prague", "prag", "praha"],
    label: "Prague",
    subtitle: "Czech Republic",
    searchQuery: "Prague",
    city: "Prague",
    country: "Czech Republic",
    liveUrl: "https://www.travala.com/hotels/czech-republic/prague/prague",
    searchTerms: ["Prague", "Prag", "Praha"],
  },
  {
    keys: ["budapest"],
    label: "Budapest",
    subtitle: "Hungary",
    searchQuery: "Budapest",
    city: "Budapest",
    country: "Hungary",
    liveUrl: "https://www.travala.com/hotels/hungary/central-hungary/budapest",
    searchTerms: ["Budapest"],
  },
  {
    keys: ["warsaw", "warschau"],
    label: "Warsaw",
    subtitle: "Poland",
    searchQuery: "Warsaw",
    city: "Warsaw",
    country: "Poland",
    liveUrl: "https://www.travala.com/hotels/poland/masovia/warsaw",
    searchTerms: ["Warsaw", "Warschau"],
  },
  {
    keys: ["copenhagen", "kopenhagen", "kobenhavn", "københavn"],
    label: "Copenhagen",
    subtitle: "Denmark",
    searchQuery: "Copenhagen",
    city: "Copenhagen",
    country: "Denmark",
    liveUrl: "https://www.travala.com/hotels/denmark/capital-region/copenhagen",
    searchTerms: ["Copenhagen", "Kopenhagen"],
  },
  {
    keys: ["athens", "athen"],
    label: "Athens",
    subtitle: "Greece",
    searchQuery: "Athens",
    city: "Athens",
    country: "Greece",
    liveUrl: "https://www.travala.com/hotels/greece/attica/athens",
    searchTerms: ["Athens", "Athen"],
  },
  {
    keys: ["brussels", "brussel", "brüssel"],
    label: "Brussels",
    subtitle: "Belgium",
    searchQuery: "Brussels",
    city: "Brussels",
    country: "Belgium",
    liveUrl: "https://www.travala.com/hotels/belgium/brussels/brussels",
    searchTerms: ["Brussels", "Brüssel"],
  },
  {
    keys: ["istanbul"],
    label: "Istanbul",
    subtitle: "Turkey",
    searchQuery: "Istanbul",
    city: "Istanbul",
    country: "Turkey",
    liveUrl: "https://www.travala.com/hotels/turkey/istanbul/istanbul",
    searchTerms: ["Istanbul"],
  },
  {
    keys: ["dubai"],
    label: "Dubai",
    subtitle: "UAE",
    searchQuery: "Dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    liveUrl: "https://www.travala.com/hotels/united-arab-emirates/dubai/dubai",
    searchTerms: ["Dubai"],
  },
  {
    keys: ["new york", "new-york", "nyc"],
    label: "New York",
    subtitle: "USA",
    searchQuery: "New York",
    city: "New York",
    country: "United States",
    liveUrl: "https://www.travala.com/hotels/united-states/new-york/new-york",
    searchTerms: ["New York"],
  },
  {
    keys: ["bangkok"],
    label: "Bangkok",
    subtitle: "Thailand",
    searchQuery: "Bangkok",
    city: "Bangkok",
    country: "Thailand",
    liveUrl: "https://www.travala.com/hotels/thailand/bangkok/bangkok",
    searchTerms: ["Bangkok"],
  },
  {
    keys: ["singapore"],
    label: "Singapore",
    subtitle: "Singapore",
    searchQuery: "Singapore",
    city: "Singapore",
    country: "Singapore",
    liveUrl: "https://www.travala.com/hotels/singapore/singapore/singapore",
    searchTerms: ["Singapore"],
  },
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
    if (dest.keys.some((alias) => normalizeDestinationKey(alias) === key)) return dest;
  }

  for (const dest of CANONICAL_DESTINATIONS) {
    if (
      dest.keys.some((alias) => {
        const aliasNorm = normalizeDestinationKey(alias);
        return aliasNorm.length >= 4 && (key.includes(aliasNorm) || aliasNorm.includes(key));
      })
    ) {
      return dest;
    }
  }

  return null;
}

export function expandCanonicalSearchTerms(raw: string): string[] {
  const canonical = matchCanonicalDestination(raw);
  if (!canonical) return [];
  return canonical.searchTerms;
}

export function liveUrlForDestination(raw: string, country?: string, city?: string): string | null {
  const canonical =
    matchCanonicalDestination(raw) ||
    matchCanonicalDestination(city || "") ||
    matchCanonicalDestination(country || "");
  if (canonical) return canonical.liveUrl;
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

type TravalaLocationItem = {
  type?: string;
  name?: string;
  country_slug?: string | null;
  region_slug?: string | null;
  city_slug?: string | null;
};

function countryFromTravalaName(name: string): string | undefined {
  const parts = name.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : undefined;
}

function liveUrlFromSlugs(item: TravalaLocationItem): string | null {
  if (!item.country_slug || !item.city_slug) return null;
  const region = item.region_slug || "region";
  return `https://www.travala.com/hotels/${item.country_slug}/${region}/${item.city_slug}`;
}

function scoreTravalaLocation(item: TravalaLocationItem, queryNorm: string, local: CanonicalDestination | null): number {
  const type = (item.type || "").toLowerCase();
  const name = (item.name || "").replace(/<[^>]*>/g, "");
  const primary = normalizeDestinationKey(normalizeSearchQuery(name));
  let score = 0;

  if (!item.country_slug || !item.city_slug) score += 100;
  if (type === "multi_city_vicinity") score -= 8;
  else if (type === "city") score -= 6;
  else if (type === "multi_region") score -= 4;
  else score += 40;

  if (local) {
    const localCity = normalizeDestinationKey(local.city);
    const localQuery = normalizeDestinationKey(local.searchQuery);
    if (primary === localCity || primary === localQuery) score -= 30;
    if (name.toLowerCase().includes(local.searchQuery.toLowerCase())) score -= 15;
  }

  if (primary === queryNorm) score -= 20;
  else if (primary.startsWith(queryNorm) || queryNorm.startsWith(primary)) score -= 10;

  return score;
}

export async function resolveDestinationFromAutocomplete(raw: string): Promise<CanonicalDestination | null> {
  const trimmed = raw.trim();
  if (trimmed.length < 2) return null;

  const queryNorm = normalizeDestinationKey(trimmed);
  const local = matchCanonicalDestination(trimmed);

  try {
    const params = new URLSearchParams({
      q: trimmed,
      limit: "16",
      enable_rth_search: "true",
      enable_typeahead: "true",
      typeahead_version: "V2",
    });

    const res = await fetch(`https://api.travala.com/suggestion/v2/autocomplete?${params}`, {
      headers: travalaApiHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return local;

    const json = (await res.json()) as {
      success?: boolean;
      data?: { cities?: TravalaLocationItem[] };
    };
    if (!json.success || !json.data?.cities?.length) return local;

    const candidates = json.data.cities
      .filter((item) => ["city", "multi_city_vicinity", "multi_region"].includes(item.type || ""))
      .map((item) => ({ item, score: scoreTravalaLocation(item, queryNorm, local) }))
      .sort((a, b) => a.score - b.score);

    const best = candidates[0]?.item;
    const liveUrl = best ? liveUrlFromSlugs(best) : null;
    if (!best || !liveUrl) return local;

    const cityName = normalizeSearchQuery(best.name || "") || local?.searchQuery || trimmed;
    const country = countryFromTravalaName(best.name || "") || local?.country || "";

    return {
      keys: local?.keys || [queryNorm],
      label: local?.label || cityName,
      subtitle: country,
      searchQuery: local?.searchQuery || cityName,
      city: local?.city || cityName,
      country,
      liveUrl,
      searchTerms: local?.searchTerms || [cityName, trimmed],
    };
  } catch {
    return local;
  }
}

export async function resolveDestination(raw: string): Promise<CanonicalDestination | null> {
  const local = matchCanonicalDestination(raw);
  if (local) return local;
  return resolveDestinationFromAutocomplete(raw);
}
