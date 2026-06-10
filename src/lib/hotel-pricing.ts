/** Realistic nightly list prices (USD) for catalog display — travala.com live rates load on the offer page. */

const LUXURY_MARKETS =
  /london|paris|dubai|new york|manhattan|tokyo|singapore|hong kong|zurich|geneva|monaco|milan|rome|barcelona|amsterdam|sydney|melbourne|los angeles|san francisco|las vegas|miami|beverly hills|kuwait|doha|abu dhabi|seoul|shanghai|beijing|edinburgh|venice|nice|cannes|st\. moritz|aspen|bali seminyak/i;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function nightlyRange(stars: number, luxury: boolean): { min: number; max: number } {
  if (stars >= 5) {
    return luxury ? { min: 320, max: 1450 } : { min: 160, max: 520 };
  }
  if (stars >= 4) {
    return luxury ? { min: 160, max: 680 } : { min: 85, max: 310 };
  }
  if (stars >= 3) {
    return luxury ? { min: 90, max: 260 } : { min: 48, max: 165 };
  }
  return luxury ? { min: 55, max: 130 } : { min: 32, max: 95 };
}

export function estimateHotelNightlyPrice(input: {
  key: string;
  stars?: number | null;
  city?: string;
  country?: string;
  location?: string;
}): number {
  const stars = Math.min(5, Math.max(1, input.stars ?? 3));
  const market = `${input.city || ""} ${input.country || ""} ${input.location || ""}`;
  const luxury = LUXURY_MARKETS.test(market);
  const { min, max } = nightlyRange(stars, luxury);
  const span = Math.max(1, max - min);
  return min + (hashString(input.key) % (span + 1));
}
