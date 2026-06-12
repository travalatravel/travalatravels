import { prisma } from "@/lib/prisma";
import { searchTermsForQuery, normalizeSearchQuery } from "@/lib/search-query";
import { expandCanonicalSearchTerms, resolveDestination, type CanonicalDestination } from "@/lib/city-destinations";
import { fetchLiveHotelsForQuery, upsertLiveHotels, type LiveHotel } from "@/lib/travala-live-search";
import type { Offer, OfferType } from "@/lib/types";

function mapDbOffer(row: {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  region: string | null;
  image: string;
  price: number;
  stars: number | null;
  metadata: string | null;
}): Offer {
  return { ...row, type: row.type as OfferType };
}

export type HotelSearchParams = {
  q?: string;
  country?: string;
  city?: string;
  sort?: string;
  page?: number;
  limit?: number;
  starsMin?: number;
  priceMax?: number;
};

const COUNTRY_ALIASES: Record<string, string[]> = {
  germany: ["Germany", "Deutschland", "DE"],
  usa: ["USA", "United States", "US", "America"],
  uk: ["United Kingdom", "UK", "GB", "England", "Scotland", "Wales"],
  france: ["France", "FR"],
  spain: ["Spain", "ES"],
  italy: ["Italy", "IT"],
  thailand: ["Thailand", "TH"],
  japan: ["Japan", "JP"],
  australia: ["Australia", "AU"],
  canada: ["Canada", "CA"],
  brazil: ["Brazil", "BR"],
  mexico: ["Mexico", "MX"],
  india: ["India", "IN"],
  indonesia: ["Indonesia", "ID"],
  turkey: ["Turkey", "TR", "Türkiye"],
  greece: ["Greece", "GR"],
  portugal: ["Portugal", "PT"],
  vietnam: ["Vietnam", "VN"],
  china: ["China", "CN"],
  croatia: ["Croatia", "HR"],
};

function escapeLike(term: string): string {
  return term.toLowerCase().replace(/'/g, "''");
}

function countryNamesForQuery(raw: string): string[] | null {
  const key = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const slugKey = key.replace(/-/g, "");
  for (const [aliasKey, aliases] of Object.entries(COUNTRY_ALIASES)) {
    const aliasHit =
      key === aliasKey ||
      slugKey === aliasKey.replace(/-/g, "") ||
      aliases.some((a) => a.toLowerCase() === key || a.toLowerCase() === raw.trim().toLowerCase());
    if (aliasHit) {
      return aliases.filter((a) => a.length >= 3);
    }
  }
  return null;
}

function expandSearchTerms(raw: string, resolved?: CanonicalDestination | null): string[] {
  const terms = new Set(searchTermsForQuery(raw).filter((t) => t.length >= 3));
  expandCanonicalSearchTerms(raw).forEach((term) => terms.add(term));
  if (resolved) {
    terms.add(resolved.searchQuery);
    terms.add(resolved.city);
    resolved.searchTerms.forEach((term) => {
      if (term.length >= 3) terms.add(term);
    });
  }
  const key = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const slugKey = key.replace(/-/g, "");
  for (const [aliasKey, aliases] of Object.entries(COUNTRY_ALIASES)) {
    if (key.includes(aliasKey) || aliasKey.includes(slugKey)) {
      aliases.filter((a) => a.length >= 3).forEach((a) => terms.add(a));
    }
  }
  return [...terms];
}

function buildHotelWhereClause(params: HotelSearchParams, resolved?: CanonicalDestination | null): string | null {
  const countryNames = new Set<string>();
  for (const raw of [params.country, params.q].filter(Boolean) as string[]) {
    const names = countryNamesForQuery(raw);
    if (names) names.forEach((n) => countryNames.add(n));
  }

  const cityTerm = params.city?.trim();
  const qCountries = params.q ? countryNamesForQuery(params.q) : null;
  const qIsCountry = Boolean(qCountries?.length);

  if (countryNames.size > 0) {
    const countryClause = [...countryNames]
      .map((term) => `LOWER(country) LIKE '%${escapeLike(term)}%'`)
      .join(" OR ");
    const parts = [`(${countryClause})`];
    if (cityTerm) {
      parts.push(`LOWER(city) LIKE '%${escapeLike(cityTerm)}%'`);
    } else if (params.q && !qIsCountry) {
      const qTerms = expandSearchTerms(params.q, resolved);
      if (qTerms.length) {
        const qClause = qTerms
          .map(
            (term) =>
              `(LOWER(city) LIKE '%${escapeLike(term)}%' OR LOWER(title) LIKE '%${escapeLike(term)}%' OR LOWER(location) LIKE '%${escapeLike(term)}%')`,
          )
          .join(" OR ");
        parts.push(`(${qClause})`);
      }
    }
    return parts.join(" AND ");
  }

  const terms = new Set<string>();
  if (params.q) expandSearchTerms(params.q, resolved).forEach((t) => terms.add(t));
  if (params.city) expandSearchTerms(params.city, resolved).forEach((t) => terms.add(t));
  const termList = [...terms].filter(Boolean);
  if (!termList.length) return null;

  return termList
    .map(
      (term) =>
        `(LOWER(city) LIKE '%${escapeLike(term)}%' OR LOWER(title) LIKE '%${escapeLike(term)}%' OR LOWER(country) LIKE '%${escapeLike(term)}%' OR LOWER(location) LIKE '%${escapeLike(term)}%')`,
    )
    .join(" OR ");
}

function liveToOffer(h: LiveHotel, index: number): Offer {
  const slug = String(h.metadata.travalaSlug || `live-${index}`);
  return {
    id: `live:${slug}`,
    type: "HOTEL",
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
  };
}

function orderByClause(sort: string): string {
  switch (sort) {
    case "price-asc":
      return "ORDER BY price ASC";
    case "price-desc":
      return "ORDER BY price DESC";
    case "stars-desc":
      return "ORDER BY stars IS NULL, stars DESC, price ASC";
    default:
      return "ORDER BY stars IS NULL, stars DESC, price ASC";
  }
}

export async function searchHotelOffers(params: HotelSearchParams): Promise<{
  offers: Offer[];
  total: number;
  page: number;
  pages: number;
  source: "db" | "live" | "mixed";
}> {
  const page = Math.max(params.page || 1, 1);
  const limit = Math.min(params.limit || 48, 100);
  const skip = (page - 1) * limit;
  const sort = params.sort || "recommended";

  const rawQuery = (params.city || params.q || "").trim();
  const resolved = rawQuery ? await resolveDestination(rawQuery) : null;
  const effectiveParams: HotelSearchParams = {
    ...params,
    q: params.q || resolved?.searchQuery,
    city: params.city || resolved?.city,
    country: params.country || resolved?.country,
  };

  const whereClause = buildHotelWhereClause(effectiveParams, resolved);

  const primaryTerm =
    normalizeSearchQuery(effectiveParams.city || effectiveParams.country || effectiveParams.q || "") ||
    effectiveParams.city ||
    effectiveParams.country ||
    effectiveParams.q ||
    "";

  let dbOffers: Offer[] = [];
  let dbTotal = 0;

  if (whereClause) {
    const countRows = await prisma.$queryRawUnsafe<{ cnt: number }[]>(
      `SELECT COUNT(*) as cnt FROM Offer WHERE type = 'HOTEL' AND (${whereClause})`,
    );
    dbTotal = Number(countRows[0]?.cnt ?? 0);

    const starsFilter = params.starsMin ? ` AND stars >= ${params.starsMin}` : "";
    const priceFilter = params.priceMax ? ` AND price <= ${params.priceMax}` : "";

    const rawRows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT * FROM Offer WHERE type = 'HOTEL' AND (${whereClause})${starsFilter}${priceFilter} ${orderByClause(sort)} LIMIT ${limit} OFFSET ${skip}`,
    );
    dbOffers = rawRows.map((row) =>
      mapDbOffer({
        id: String(row.id),
        type: String(row.type),
        title: String(row.title),
        description: String(row.description),
        location: String(row.location),
        city: String(row.city),
        country: String(row.country),
        region: row.region != null ? String(row.region) : null,
        image: String(row.image),
        price: Number(row.price),
        stars: row.stars != null ? Number(row.stars) : null,
        metadata: row.metadata != null ? String(row.metadata) : null,
      }),
    );
  } else {
    const where: { type: string; stars?: { gte: number }; price?: { lte: number } } = { type: "HOTEL" };
    if (params.starsMin) where.stars = { gte: params.starsMin };
    if (params.priceMax) where.price = { lte: params.priceMax };

    dbTotal = await prisma.offer.count({ where });
    const orderBy =
      sort === "price-asc"
        ? [{ price: "asc" as const }]
        : sort === "price-desc"
          ? [{ price: "desc" as const }]
          : [{ stars: "desc" as const }, { price: "asc" as const }];

    const rows = await prisma.offer.findMany({
      where,
      take: limit,
      skip,
      orderBy,
    });
    dbOffers = rows.map(mapDbOffer);
  }

  let offers = dbOffers;
  let source: "db" | "live" | "mixed" = "db";

  if (primaryTerm && dbTotal < limit) {
    const primary = primaryTerm;
    try {
      const live = await Promise.race([
        fetchLiveHotelsForQuery(primary, {
          country: effectiveParams.country,
          city: effectiveParams.city,
          liveUrl: resolved?.liveUrl,
        }),
        new Promise<LiveHotel[]>((_, reject) =>
          setTimeout(() => reject(new Error("live timeout")), 15000),
        ),
      ]);

      if (live.length > 0) {
        void upsertLiveHotels(live.slice(0, 200)).catch(() => {});
        const liveOffers = live.map((h, i) => liveToOffer(h, i));
        const seen = new Set<string>();
        offers = [...liveOffers, ...dbOffers].filter((o) => {
          const key = o.title.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        if (params.starsMin) offers = offers.filter((o) => (o.stars ?? 0) >= params.starsMin!);
        if (params.priceMax) offers = offers.filter((o) => o.price <= params.priceMax!);
        if (sort === "price-asc") offers.sort((a, b) => a.price - b.price);
        else if (sort === "price-desc") offers.sort((a, b) => b.price - a.price);
        else offers.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0) || a.price - b.price);

        offers = offers.slice(skip, skip + limit);
        dbTotal = Math.max(dbTotal, liveOffers.length);
        source = dbOffers.length > 0 ? "mixed" : "live";
      }
    } catch {
      /* use DB results only */
    }
  }

  return {
    offers,
    total: dbTotal,
    page,
    pages: Math.max(1, Math.ceil(dbTotal / limit)),
    source,
  };
}
