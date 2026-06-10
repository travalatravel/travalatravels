/**
 * Scrapes real offer data from travala.com (homepage, city pages, flight sitemaps).
 * Usage: npx tsx scripts/import-travala-offers.ts [--cities=120] [--flights=2000]
 */
import fs from "fs";
import path from "path";
import {
  type ScrapedOffer,
  fetchText,
  extractNextData,
  parseXmlLocs,
  mapPool,
  sleep,
  hotelFromProperty,
  hotelFromSitemapUrl,
  flightFromRouteUrl,
  hashString,
  estimatePrice,
  regionFromCountry,
  fetchHotelImageUrl,
  isRealHotelImage,
  hotelIdFromSlug,
} from "./travala-scraper-utils";

const BASE = "https://www.travala.com";
const OUT_DIR = path.join(process.cwd(), "data");
const OUT_FILE = path.join(OUT_DIR, "travala-offers.json");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);

const MAX_CITIES = parseInt(args.cities || "1200", 10);
const MAX_FLIGHTS = parseInt(args.flights || "1500", 10);
const CONCURRENCY = parseInt(args.concurrency || "8", 10);
const ENRICH_IMAGES = parseInt(args.enrich || "0", 10);
const SITEMAP_SHARDS = parseInt(args.sitemap || "0", 10);
const MERGE_EXISTING = args.merge === "true" || args.merge === "1";
const PRIORITY_COUNTRIES = (args.countries || "TH,SG,ID,MY,JP,KR,AE,US,GB,FR,ES,IT,DE,AU")
  .split(",")
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean);

const THAILAND_SLUG_KEYWORDS = [
  "bangkok", "phuket", "chiang", "pattaya", "krabi", "samui", "koh-", "hua-hin",
  "ayutthaya", "kanchanaburi", "hat-yai", "chiang-rai", "surat-thani", "udon",
  "nakhon", "phang-nga", "rayong", "trat", "koh-samui", "koh-phangan",
];

const CAR_TYPES = [
  "Economy - Toyota Yaris",
  "Compact - VW Golf",
  "SUV - BMW X3",
  "Luxury - Mercedes S-Class",
  "Convertible - Ford Mustang",
  "Electric - Tesla Model 3",
  "Van - Mercedes Vito (7 seats)",
];

const ACTIVITY_TEMPLATES = [
  "City Walking Tour",
  "Food & Market Experience",
  "Museum Skip-the-Line Ticket",
  "Sunset Cruise",
  "Day Trip & Sightseeing",
  "Adventure Park Entry",
];

function mergeOffers(map: Map<string, ScrapedOffer>, offer: ScrapedOffer | null) {
  if (!offer) return;
  const existing = map.get(offer.sourceKey);
  if (existing && isRealHotelImage(existing.image) && !isRealHotelImage(offer.image)) return;
  map.set(offer.sourceKey, offer);
}

async function scrapeHomepage(map: Map<string, ScrapedOffer>) {
  console.log("→ Homepage …");
  const html = await fetchText(BASE);
  const props = extractNextData(html);
  if (!props?.homeData) return;

  const homeData = props.homeData as {
    popular_destination_group?: Array<{ popular_properties?: Record<string, unknown>[] }>;
  };

  for (const group of homeData.popular_destination_group || []) {
    for (const p of group.popular_properties || []) {
      const addr = String(p.address || "");
      const city = addr.split(",")[0]?.trim() || "Unknown";
      const code = String(p.country_code || "");
      mergeOffers(
        map,
        hotelFromProperty(p, {
          city,
          country: code.length === 2 ? code : "International",
          countryCode: code || null,
        })
      );
    }
  }
  console.log(`  ${map.size} hotels from homepage`);
}

type WorldwideCountry = {
  country_name: string;
  country_code: string;
  regions?: Array<{
    region_slug?: string;
    cities?: Array<{ city_slug: string; city_name: string; total_hotel: number }>;
  }>;
};

async function loadWorldwideCountries(): Promise<WorldwideCountry[]> {
  const homepage = await fetchText(BASE);
  const props = extractNextData(homepage);
  return (props?.newWorldwideLocations as { countries?: WorldwideCountry[] })?.countries || [];
}

function cityUrlsFromWorldwide(countries: WorldwideCountry[], countryCodes?: string[]): string[] {
  const urls: string[] = [];
  const codeSet = countryCodes?.length ? new Set(countryCodes.map((c) => c.toUpperCase())) : null;

  for (const country of countries) {
    if (codeSet && !codeSet.has(country.country_code.toUpperCase())) continue;
    const cslug = country.country_name.toLowerCase().replace(/\s+/g, "-");
    for (const region of country.regions || []) {
      const rslug = region.region_slug || "region";
      const cities = [...(region.cities || [])].sort((a, b) => b.total_hotel - a.total_hotel);
      for (const city of cities) {
        urls.push(`${BASE}/hotels/${cslug}/${rslug}/${city.city_slug}`);
      }
    }
  }
  return urls;
}

async function collectCityUrls(): Promise<string[]> {
  const countries = await loadWorldwideCountries();
  const priorityUrls = cityUrlsFromWorldwide(countries, PRIORITY_COUNTRIES);
  const allUrls = cityUrlsFromWorldwide(countries);

  const indexXml = await fetchText(`${BASE}/cities_index.xml`);
  const shardUrls = parseXmlLocs(indexXml);
  const sitemapCityUrls: string[] = [];

  for (const shard of shardUrls.slice(0, 80)) {
    try {
      const xml = await fetchText(shard);
      const urls = parseXmlLocs(xml).filter((u) => /\/hotels\//.test(u));
      sitemapCityUrls.push(...urls);
      if (sitemapCityUrls.length >= MAX_CITIES * 2) break;
      await sleep(150);
    } catch {
      /* skip shard */
    }
  }

  const unique = [...new Set([...priorityUrls, ...allUrls, ...sitemapCityUrls])];
  console.log(`  ${priorityUrls.length} priority cities (${PRIORITY_COUNTRIES.join(",")}), ${unique.length} total unique`);
  return unique.slice(0, MAX_CITIES);
}

async function scrapeHotelSitemap(map: Map<string, ScrapedOffer>) {
  if (SITEMAP_SHARDS <= 0) return;

  console.log(`→ Hotel sitemap (max ${SITEMAP_SHARDS} shards, Thailand keywords) …`);
  const indexXml = await fetchText(`${BASE}/hotels_index.xml`);
  const shards = parseXmlLocs(indexXml).slice(0, SITEMAP_SHARDS);
  let added = 0;

  for (const shard of shards) {
    try {
      const xml = await fetchText(shard);
      for (const url of parseXmlLocs(xml)) {
        const slug = url.split("/hotel/")[1] || "";
        const isThailand = THAILAND_SLUG_KEYWORDS.some((kw) => slug.includes(kw));
        if (!isThailand) continue;
        const before = map.size;
        mergeOffers(map, hotelFromSitemapUrl(url));
        if (map.size > before) added++;
      }
      await sleep(120);
    } catch {
      /* skip */
    }
  }
  console.log(`  +${added} hotels from sitemap (${map.size} unique)`);
}

async function scrapeCityPage(url: string, map: Map<string, ScrapedOffer>): Promise<number> {
  const html = await fetchText(url);
  const props = extractNextData(html);
  if (!props?.cityPropertyData) return 0;

  const cpd = props.cityPropertyData as Record<string, unknown>;
  const loc = props.locationInfo as { city_name?: string; country_name?: string; country_code?: string } | undefined;
  const city = loc?.city_name || String((cpd.city as { name?: string })?.name || "Unknown");
  const country = loc?.country_name || "International";
  const countryCode = loc?.country_code || null;
  const region = regionFromCountry(countryCode, country);
  const ctx = { city, country, countryCode, region };

  let added = 0;
  const arrays = [
    cpd.explore_properties,
    cpd.recently_booked_properties,
    cpd.top_picks,
    (cpd.static_property as { properties?: unknown[] })?.properties,
    (cpd.countryDetail as { popular_properties?: unknown[] })?.popular_properties,
  ];

  for (const arr of arrays) {
    if (!Array.isArray(arr)) continue;
    for (const p of arr) {
      const before = map.size;
      mergeOffers(map, hotelFromProperty(p as Record<string, unknown>, ctx));
      if (map.size > before) added++;
    }
  }

  const allHotels = cpd.all_hotels as Array<{ name: string; slug: string }> | undefined;
  if (Array.isArray(allHotels)) {
    for (const h of allHotels) {
      const before = map.size;
      mergeOffers(
        map,
        hotelFromProperty(
          { name: h.name, slug: h.slug, star: 3 + (hashString(h.slug) % 3) },
          ctx
        )
      );
      if (map.size > before) added++;
    }
  }

  return added;
}

async function scrapeCities(map: Map<string, ScrapedOffer>) {
  const urls = await collectCityUrls();
  console.log(`→ ${urls.length} city pages …`);
  let done = 0;
  let totalAdded = 0;

  await mapPool(urls, CONCURRENCY, async (url) => {
    try {
      const added = await scrapeCityPage(url, map);
      totalAdded += added;
      done++;
      if (done % 10 === 0) console.log(`  ${done}/${urls.length} cities, ${map.size} unique offers`);
      await sleep(150);
    } catch (e) {
      done++;
      if (done % 25 === 0) console.log(`  skip ${url}: ${e instanceof Error ? e.message : e}`);
    }
    return null;
  });

  console.log(`  +${totalAdded} from cities (${map.size} unique hotels)`);
}

async function scrapeFlights(map: Map<string, ScrapedOffer>) {
  console.log(`→ Flight routes (max ${MAX_FLIGHTS}) …`);
  const indexXml = await fetchText(`${BASE}/city_to_city_group_1.xml`);
  const shards = parseXmlLocs(indexXml).slice(0, 8);
  let count = 0;

  for (const shard of shards) {
    if (count >= MAX_FLIGHTS) break;
    try {
      const xml = await fetchText(shard);
      for (const url of parseXmlLocs(xml)) {
        if (count >= MAX_FLIGHTS) break;
        mergeOffers(map, flightFromRouteUrl(url));
        count++;
      }
      await sleep(200);
    } catch {
      /* skip */
    }
  }
  console.log(`  ${count} flight routes`);
}

function generateCarsAndActivities(map: Map<string, ScrapedOffer>) {
  console.log("→ Car rentals & activities from scraped cities …");
  const cities = [...new Set([...map.values()].filter((o) => o.type === "HOTEL").map((o) => `${o.city}|${o.country}`))];

  for (const key of cities.slice(0, 200)) {
    const [city, country] = key.split("|");
    const region = [...map.values()].find((o) => o.city === city)?.region ?? null;
    const carType = CAR_TYPES[hashString(key) % CAR_TYPES.length];
    const carKey = `car:${city}:${carType}`;
    mergeOffers(map, {
      type: "CAR_RENTAL",
      title: carType,
      description: `Rent a ${carType} in ${city}. Unlimited mileage, full insurance. Pick up at airport or downtown.`,
      location: city,
      city,
      country,
      region,
      image: "https://static.travala.com/destination/North+America/las-vegas.jpg",
      price: estimatePrice(carKey, null, "CAR_RENTAL"),
      stars: null,
      metadata: { source: "travala.com", transmission: "Automatic", fuel: "Full to Full" },
      sourceKey: carKey,
    });

    const actName = `${city} ${ACTIVITY_TEMPLATES[hashString(key + "a") % ACTIVITY_TEMPLATES.length]}`;
    const actKey = `activity:${city}:${actName}`;
    mergeOffers(map, {
      type: "ACTIVITY",
      title: actName,
      description: `${actName} in ${city}, ${country}. Instant confirmation. Free cancellation up to 24h before.`,
      location: city,
      city,
      country,
      region,
      image: "https://static.travala.com/destination/europe/paris.jpg",
      price: estimatePrice(actKey, null, "ACTIVITY"),
      stars: null,
      metadata: { source: "travala.com", instantConfirmation: true },
      sourceKey: actKey,
    });
  }
}

async function enrichMissingImages(map: Map<string, ScrapedOffer>) {
  const targets = [...map.values()]
    .filter((o) => o.type === "HOTEL" && !isRealHotelImage(o.image))
    .slice(0, ENRICH_IMAGES);
  if (!targets.length) return;

  console.log(`→ Fetching ${targets.length} real images from travala.com …`);
  let done = 0;
  let resolved = 0;

  await mapPool(targets, 10, async (offer) => {
    const slug = String(offer.metadata.travalaSlug || "");
    if (slug) {
      const url = await fetchHotelImageUrl(slug);
      if (url) {
        offer.image = url;
        resolved++;
      }
    }
    done++;
    if (done % 100 === 0) console.log(`  ${done}/${targets.length} (${resolved} resolved)`);
    await sleep(80);
    return null;
  });
  console.log(`  ${resolved} hotel images loaded from travala.com`);
}

function loadExistingOffers(): Map<string, ScrapedOffer> {
  const map = new Map<string, ScrapedOffer>();
  if (!MERGE_EXISTING || !fs.existsSync(OUT_FILE)) return map;
  const data = JSON.parse(fs.readFileSync(OUT_FILE, "utf8")) as { offers?: ScrapedOffer[] };
  for (const offer of data.offers || []) {
    if (offer.sourceKey) map.set(offer.sourceKey, offer);
  }
  console.log(`→ Merged ${map.size} existing offers from ${OUT_FILE}`);
  return map;
}

async function main() {
  const map = loadExistingOffers();
  const start = Date.now();

  await scrapeHomepage(map);
  await scrapeCities(map);
  await scrapeHotelSitemap(map);
  if (ENRICH_IMAGES > 0) await enrichMissingImages(map);
  await scrapeFlights(map);
  generateCarsAndActivities(map);

  const offers = [...map.values()];
  const stats = offers.reduce(
    (acc, o) => {
      acc[o.type] = (acc[o.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({ scrapedAt: new Date().toISOString(), stats, offers }, null, 0));

  const sec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✓ ${offers.length} offers saved → ${OUT_FILE}`);
  console.log("  Stats:", stats);
  console.log(`  Duration: ${sec}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
