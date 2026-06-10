/**
 * Recalculates catalog nightly prices for all hotels in travala-offers.json.
 * Usage: npx tsx scripts/fix-hotel-prices.ts
 */
import fs from "fs";
import path from "path";
import { estimateHotelNightlyPrice } from "../src/lib/hotel-pricing";

const OUT_FILE = path.join(process.cwd(), "data", "travala-offers.json");

type Offer = {
  type: string;
  price: number;
  stars: number | null;
  city: string;
  country: string;
  location: string;
  metadata: { travalaSlug?: string; travalaId?: string };
  sourceKey?: string;
};

const data = JSON.parse(fs.readFileSync(OUT_FILE, "utf8")) as {
  offers: Offer[];
  stats?: Record<string, number>;
};

let updated = 0;
for (const offer of data.offers) {
  if (offer.type !== "HOTEL") continue;
  const key =
    offer.sourceKey ||
    `hotel:${offer.metadata?.travalaId || offer.metadata?.travalaSlug || offer.location}`;
  const next = estimateHotelNightlyPrice({
    key,
    stars: offer.stars,
    city: offer.city,
    country: offer.country,
    location: offer.location,
  });
  if (offer.price !== next) {
    offer.price = next;
    updated++;
  }
}

const hotels = data.offers.filter((o) => o.type === "HOTEL");
const prices = hotels.map((h) => h.price).sort((a, b) => b - a);

fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 0));
console.log(`✓ Updated ${updated} hotel prices`);
console.log(`  Range: $${prices[prices.length - 1]} – $${prices[0]} per night (list)`);
console.log(`  Sale range (40% off): $${(prices[prices.length - 1] * 0.6).toFixed(2)} – $${(prices[0] * 0.6).toFixed(2)}`);
