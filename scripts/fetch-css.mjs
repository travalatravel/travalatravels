const html = await fetch("https://www.travala.com", {
  headers: { "User-Agent": "Mozilla/5.0" },
}).then((r) => r.text());

const urls = [...new Set([...html.matchAll(/href="(\/_next\/static\/css\/[^"]+\.css)"/g)].map((m) => m[1]))];

const keys = [
  "SearchWrap",
  "TvlSearchBox",
  "CryptoFriendlySection_title",
  "CryptoFriendlySection_subtitle",
  "StaticWorldwideDestinationsV2_head",
  "StaticWorldwideDestinationsV2_title",
  "StaticWorldwideDestinationsV2_continentItem",
  "TvaHeader_homePage",
  "DestinationItem_destinationItem",
];

for (const path of urls) {
  const css = await fetch(`https://www.travala.com${path}`).then((r) => r.text());
  for (const key of keys) {
    const idx = css.indexOf(key);
    if (idx >= 0) {
      console.log(`\n=== ${key} (${path}) ===\n${css.slice(idx, idx + 700)}`);
    }
  }
}
