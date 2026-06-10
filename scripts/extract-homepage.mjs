import { readFileSync } from "fs";

const html = readFileSync("scripts/homepage.html", "utf8");
const markers = [
  "home-hero-search",
  "TvlSearchBoxPC",
  "HomePagePC",
  "tabHeader",
  "CryptoFriendlySection",
  "TvaHeader_homePage",
  "StaticWorldwideDestinationsV2",
];
for (const m of markers) {
  const i = html.indexOf(m);
  if (i >= 0) {
    console.log(`\n=== ${m} ===\n${html.slice(i, i + 1200)}`);
  }
}
