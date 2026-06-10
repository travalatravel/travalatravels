import fs from "fs";

const allSlugs = {};

function walk(o) {
  if (!o || typeof o !== "object") return;
  if (o.name && o.slug && typeof o.star === "number") allSlugs[o.name] = o.slug;
  for (const v of Object.values(o)) if (typeof v === "object") walk(v);
}

walk(JSON.parse(fs.readFileSync("docs/research/homepage-next-data.json", "utf8")));

const offers = JSON.parse(fs.readFileSync("data/travala-offers.json", "utf8"));
for (const o of offers.offers || []) {
  const slug = o.metadata?.travalaSlug;
  if (slug && o.title) allSlugs[o.title] = slug;
}

const manual = {
  "Le Bristol Paris": "le-bristol-paris-10884",
  "Rome Cavalieri": "rome-cavalieri-a-waldorf-astoria-hotel-1089",
  "Copacabana Palace, A Belmond Hotel": "copacabana-palace-a-belmond-hotel-rio-de-janeiro-7130",
};
Object.assign(allSlugs, manual);

const featuredNames = new Set();
const siteSrc = fs.readFileSync("src/data/site-data.ts", "utf8");
const extraSrc = fs.readFileSync("src/data/destination-extra.ts", "utf8");
for (const src of [siteSrc, extraSrc]) {
  const re = /hotels:\s*\[([\s\S]*?)\]\s*,?\s*\n\s*\}/g;
  let m;
  while ((m = re.exec(src))) {
    const block = m[1];
    for (const nm of block.matchAll(/name:\s*"([^"]+)"/g)) featuredNames.add(nm[1]);
  }
}

const map = {};
for (const name of featuredNames) {
  if (allSlugs[name]) map[name] = allSlugs[name];
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));

const out = `/** Featured destination hotels → Travala slug */\nexport const FEATURED_HOTEL_SLUGS: Record<string, string> = ${JSON.stringify(sorted, null, 2)};\n\nexport function slugForHotelName(name: string): string | null {\n  const trimmed = name.trim();\n  if (FEATURED_HOTEL_SLUGS[trimmed]) return FEATURED_HOTEL_SLUGS[trimmed];\n  const lower = trimmed.toLowerCase();\n  for (const [key, slug] of Object.entries(FEATURED_HOTEL_SLUGS)) {\n    if (key.toLowerCase() === lower) return slug;\n  }\n  return null;\n}\n`;

fs.writeFileSync("src/data/featured-hotel-slugs.ts", out);
console.log("featured", featuredNames.size, "mapped", Object.keys(sorted).length);
