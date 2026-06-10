const res = await fetch("https://www.travala.com", {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
});
const html = await res.text();
const idx = html.indexOf("Crypto-friendly");
console.log("=== CRYPTO SECTION ===");
console.log(html.slice(Math.max(0, idx - 200), idx + 1200));
const searchIdx = html.indexOf("Search for Places");
console.log("\n=== SEARCH SECTION ===");
console.log(html.slice(Math.max(0, searchIdx - 1500), searchIdx + 2000));
const exploreIdx = html.indexOf("Worldwide Destinations");
console.log("\n=== DESTINATIONS ===");
console.log(html.slice(Math.max(0, exploreIdx - 400), exploreIdx + 2500));
const headerIdx = html.indexOf("TvlHeader");
console.log("\n=== HEADER ===");
console.log(html.slice(Math.max(0, headerIdx), headerIdx + 800));
const cssLinks = [...html.matchAll(/href="([^"]+\.css)"/g)].map((m) => m[1]).slice(0, 5);
console.log("\nCSS:", cssLinks);
